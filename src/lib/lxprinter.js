import "core-js/proposals/array-buffer-base64";

import { BitmapData } from "./bitmap.js";
import { Printer, PrinterErrorEvent } from "./printer.js";

// --- Tunables --------------------------------------------------------------
const CONNECT_TIMEOUT_MS = 30000;
const WRITE_RETRIES = 4; // retries per GATT write on transient errors
// Web Bluetooth service/characteristic discovery can hang indefinitely right
// after a fresh connection (it doesn't reject — it just never resolves). We
// give each discovery a bounded time and, on failure, drop the GATT link and
// try again from scratch, which clears a stale service cache.
const DISCOVERY_ATTEMPTS = 4;
const OP_TIMEOUT_MS = 6000; // per discovery operation
// Small gap between raster packets. The reference driver paces at ~20ms; in the
// browser the awaited write queue already provides back-pressure, so a short
// delay is enough to avoid overflowing the printer's BLE buffer.
const INTER_PACKET_DELAY_MS = 4;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reject if `promise` doesn't settle within `ms`. Used to bound Web Bluetooth
// calls that can otherwise hang forever.
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timed out: ${label} (${ms}ms)`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// A transient GATT error is one that typically succeeds on retry: another
// operation was in progress, or the stack was momentarily busy.
function isTransientGattError(err) {
  const name = err?.name || "";
  const msg = err?.message || "";
  return (
    name === "NetworkError" ||
    name === "InvalidStateError" ||
    name === "NotSupportedError" ||
    /in progress/i.test(msg) ||
    /busy/i.test(msg)
  );
}

function crc16xmodem(data) {
  return data.reduce((crc, x) => {
    crc ^= x << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    return crc & 0xffff;
  }, 0);
}

function parseStatusMsg(msg) {
  const d = new DataView(msg.buffer);
  return {
    battery: d.getUint8(2),
    noPaper: !!d.getUint8(3),
    charging: !!d.getUint8(4),
    overheat: !!d.getUint8(5),
    lowBatt: !!d.getUint8(6),
    density: d.getUint8(7),
    voltage: d.getUint16(8),
    unk1: d.getUint8(10),
    unk2: d.getUint8(11),
  };
}

export class LXPrinter extends Printer {
  status = { state: "disconnected" };
  // All GATT writes are funnelled through this promise chain so they never
  // overlap. Concurrent writeValue* calls are the main cause of dropped
  // packets / "GATT operation already in progress" failures on Web Bluetooth.
  _writeQueue = Promise.resolve();
  // True while we are mid-(re)connection; the discovery loop manages its own
  // GATT teardowns, so the disconnect handler must ignore drops during it.
  _establishing = false;

  get driverName() {
    return "lx";
  }

  get name() {
    return this._name;
  }

  constructor() {
    super();
    this.recvHandler = async (event) => await this.receiveMessage(event);
    // The link dropped on its own (idle timeout, range, etc.). We keep the
    // saved device so the next print() can silently re-establish — no chooser.
    this.onDisconnected = () => {
      if (this._establishing) return; // handled by the discovery loop
      console.log("[LX] link lost — will reconnect on next print");
      this._teardownSession();
      // "standby": link is down but the device is remembered, so the UI can
      // still offer Print and we reconnect silently in ensureConnected().
      this.setStatus({ state: "standby" });
    };
  }

  error(msg) {
    this.dispatchEvent(new PrinterErrorEvent(msg));
  }

  // --- Serialized, retrying GATT write --------------------------------------
  async _rawWrite(data) {
    if (!this.sendChar) throw new Error("Not connected");
    for (let attempt = 0; ; attempt++) {
      try {
        await this.sendChar.writeValueWithoutResponse(data);
        return;
      } catch (err) {
        if (attempt >= WRITE_RETRIES || !isTransientGattError(err)) throw err;
        // Back off a little and retry; the BLE stack was momentarily busy.
        await sleep(15 * (attempt + 1));
      }
    }
  }

  // Enqueue a write. Returns a promise for *this* write while keeping the
  // shared chain alive even if an individual write fails.
  send(data) {
    const result = this._writeQueue.then(() => this._rawWrite(data));
    this._writeQueue = result.catch(() => {});
    return result;
  }

  // User-initiated connection: shows the device chooser (needs a user gesture),
  // remembers the device, then establishes the session.
  async connect() {
    try {
      this.setStatus({ state: "connecting" });

      console.log("[LX] requesting device...");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "LX" }],
        optionalServices: [0xffe6],
      });
      if (!device?.gatt) throw new Error("No dev");

      this.dev = device;
      this._savedDevice = device; // kept across idle drops for silent reconnect
      this._name = device.name;
      device.removeEventListener("gattserverdisconnected", this.onDisconnected);
      device.addEventListener("gattserverdisconnected", this.onDisconnected);

      await this._establishSession();
    } catch (err) {
      this.error("Connection Error");
      console.dir(err);
      await this.disconnect(); // full teardown: forget the device
    }
  }

  // Guarantees an authenticated session before printing. If the link dropped
  // while idle, this silently reconnects to the remembered device (no chooser).
  async ensureConnected() {
    if (
      this.status.state === "connected" &&
      this.dev?.gatt?.connected &&
      this.sendChar
    ) {
      return;
    }
    if (!this._savedDevice) throw new Error("No device — connect first");

    console.log("[LX] reconnecting to remembered device...");
    this.dev = this._savedDevice;
    this.dev.removeEventListener("gattserverdisconnected", this.onDisconnected);
    this.dev.addEventListener("gattserverdisconnected", this.onDisconnected);
    try {
      await this._establishSession();
    } catch (err) {
      // Keep the saved device so the user can simply try to print again.
      this._teardownSession();
      this.setStatus({ state: "disconnected" });
      throw err;
    }
  }

  // Connect GATT, discover, subscribe, and run the auth handshake. Resolves
  // once the printer confirms authentication (or rejects on timeout/failure).
  _establishSession() {
    this._establishing = true;
    this._ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this._ready.catch(() => {}); // avoid unhandled rejection noise

    const timer = setTimeout(
      () => this._readyReject?.(new Error("Connection timeout")),
      CONNECT_TIMEOUT_MS,
    );

    this._doEstablish().catch((err) => this._readyReject?.(err));

    return this._ready.finally(() => {
      clearTimeout(timer);
      this._establishing = false;
    });
  }

  async _doEstablish() {
    this.setStatus({ state: "connecting" });
    await this._connectAndDiscover();

    console.log("[LX] starting notifications...");
    await withTimeout(
      this.recvChar.startNotifications(),
      OP_TIMEOUT_MS,
      "startNotifications",
    );
    this.recvChar.removeEventListener(
      "characteristicvaluechanged",
      this.recvHandler,
    );
    this.recvChar.addEventListener(
      "characteristicvaluechanged",
      this.recvHandler,
    );

    console.log("[LX] sending handshake 0x5a01, awaiting reply...");
    await this.send(new Uint8Array([0x5a, 0x01]));
  }

  async _connectAndDiscover() {
    let lastErr;
    for (let attempt = 1; attempt <= DISCOVERY_ATTEMPTS; attempt++) {
      try {
        console.log(`[LX] connecting GATT (attempt ${attempt})...`);
        this.server = await withTimeout(
          this.dev.gatt.connect(),
          OP_TIMEOUT_MS,
          "gatt.connect",
        );
        if (!this.server) throw new Error("No GATT server");

        console.log("[LX] getting service 0xffe6...");
        this.service = await withTimeout(
          this.server.getPrimaryService(0xffe6),
          OP_TIMEOUT_MS,
          "getPrimaryService",
        );
        if (!this.service) throw new Error("No service");

        console.log("[LX] getting characteristics...");
        this.sendChar = await withTimeout(
          this.service.getCharacteristic(0xffe1),
          OP_TIMEOUT_MS,
          "getCharacteristic 0xffe1",
        );
        this.recvChar = await withTimeout(
          this.service.getCharacteristic(0xffe2),
          OP_TIMEOUT_MS,
          "getCharacteristic 0xffe2",
        );
        return; // success
      } catch (err) {
        lastErr = err;
        console.log(`[LX] discovery attempt ${attempt} failed: ${err}`);
        // Drop the (possibly stale) GATT link before retrying so the next
        // attempt performs a clean service discovery. onDisconnected ignores
        // this because _establishing is true.
        try {
          if (this.dev?.gatt?.connected) this.dev.gatt.disconnect();
        } catch {
          /* ignore */
        }
        this.server = undefined;
        this.service = undefined;
        this.sendChar = undefined;
        this.recvChar = undefined;
        if (attempt < DISCOVERY_ATTEMPTS) await sleep(400 * attempt);
      }
    }
    throw lastErr || new Error("Failed to connect / discover services");
  }

  async authStage1(msg) {
    this.mac = msg.slice(4, 10);
    this.authBytes = new Uint8Array(10);
    crypto.getRandomValues(this.authBytes);
    if (!this.authBytes || !this.mac) return;
    this.authCrc = Array.from(this.authBytes).map((x) => {
      const y = new Uint8Array(7);
      y[0] = x;
      y.set(this.mac || new Uint8Array(6), 1);
      return crc16xmodem(y);
    });

    await this.send(new Uint8Array([0x5a, 0x0a, ...this.authBytes]));
  }

  async authStage2(_) {
    // We don't verify the incoming message, but it should be
    // 0x5a0a + authCrc.map(x => x & 0xFF)
    if (!this.authCrc) throw new Error("No authCrc");
    await this.send(
      new Uint8Array([0x5a, 0x0b, ...this.authCrc.map((x) => x >> 8)]),
    );
  }

  async authResult(msg) {
    if (msg[2] !== 1) {
      this.error("Authentication failed");
      this._readyReject?.(new Error("Authentication failed"));
      return;
    }
    this.setStatus({ state: "connected" });
    this._readyResolve?.();
  }

  // Close the active BLE session but KEEP the remembered device so we can
  // reconnect silently later.
  _teardownSession() {
    this._writeQueue = Promise.resolve();
    this.printLines = undefined;

    try {
      this.recvChar?.removeEventListener(
        "characteristicvaluechanged",
        this.recvHandler,
      );
    } catch {
      /* ignore */
    }

    this.server = undefined;
    this.service = undefined;
    this.sendChar = undefined;
    this.recvChar = undefined;
    this.mac = undefined;
    this.authBytes = undefined;
    this.authCrc = undefined;
  }

  // Full disconnect: tears down the session AND forgets the device. Use for an
  // explicit user "disconnect" or a failed initial connection.
  async disconnect() {
    this._establishing = false;
    this._readyReject?.(new Error("Disconnected"));

    // Remove the drop handler before disconnecting so it doesn't re-fire.
    try {
      this.dev?.removeEventListener(
        "gattserverdisconnected",
        this.onDisconnected,
      );
    } catch {
      /* ignore */
    }

    try {
      if (this.server?.connected) this.server.disconnect();
    } catch {
      /* ignore */
    }

    this._teardownSession();
    this.dev = undefined;
    this._savedDevice = undefined;
    this._name = undefined;
    this.setStatus({ state: "disconnected" });
  }

  async receiveMessage(event) {
    const target = event.target;
    if (!target.value) return;
    const msg = new Uint8Array(target.value.buffer);

    if (msg[0] !== 0x5a) return;

    switch (msg[1]) {
      case 0x01:
        return await this.authStage1(msg);
      case 0x0a:
        return await this.authStage2(msg);
      case 0x0b:
        return await this.authResult(msg);
      case 0x02:
        return this.setStatus(parseStatusMsg(msg));
      case 0x05:
        return await this.retransmit(msg); // printer lost a line
      case 0x06:
        return await this.donePrinting(msg);
      case 0x08:
        return this.onPaused(msg); // buffer full / paused
    }
  }

  // The printer reports a missing line and expects it to be resent. The line
  // number is a big-endian uint16 in bytes 2..3.
  async retransmit(msg) {
    if (!this.printLines?.length) return;
    const dv = new DataView(msg.buffer);
    if (msg.length < 4) return;
    const lineNo = dv.getUint16(2);
    const line = this.printLines[lineNo];
    if (!line) {
      console.log(`Retransmit requested for unknown line ${lineNo}`);
      return;
    }
    console.log(`Retransmitting line ${lineNo}`);
    await this.send(line);
  }

  onPaused(_msg) {
    // The printer's buffer is full; it will resume on its own. The serialized
    // write queue means our in-flight writes simply wait their turn, so there
    // is nothing to do beyond noting it.
    console.log("Printer paused (buffer full)");
  }

  async donePrinting(msg) {
    const dv = new DataView(msg.buffer);
    const printlen = dv.getUint16(2);

    await this.send(
      new Uint8Array([0x5a, 0x04, printlen >> 8, printlen & 0xff, 0x01, 0x00]),
    );

    this.printLines = undefined;
    this.setStatus({ state: "connected" });
  }

  async print(img) {
    // Re-establish the link if it dropped while idle. Runs from a click, so a
    // user gesture is available; reconnecting a known device needs no chooser.
    try {
      await this.ensureConnected();
    } catch (err) {
      console.dir(err);
      this.error("Reconnection failed");
      return;
    }

    try {
      this.setStatus({ state: "printing" });

      this.printingImage = new BitmapData(img);
      const printLength = this.printingImage.printLength;

      // Pre-build every packet and keep it, indexed by line number, so we can
      // answer retransmission requests instantly during the print.
      this.printLines = [];
      for (const line of this.printingImage.generatePrintData()) {
        this.printLines.push(line);
      }
      // Blank terminator line at index == printLength.
      const terminator = new Uint8Array(100);
      terminator.set([0x55, printLength >> 8, printLength & 0xff]);
      this.printLines.push(terminator);

      // Print-start event: declare number of lines (incl. terminator).
      const startMsg = new Uint8Array(6);
      new DataView(startMsg.buffer).setUint16(2, printLength + 1);
      startMsg.set([0x5a, 0x04], 0);
      await this.send(startMsg);

      // Stream the raster lines, paced to avoid overrunning the BLE buffer.
      for (const line of this.printLines) {
        await this.send(line);
        if (INTER_PACKET_DELAY_MS > 0) await sleep(INTER_PACKET_DELAY_MS);
      }
      // The printer acknowledges completion with a 0x06 message, handled in
      // donePrinting(); state returns to "connected" there.
    } catch (err) {
      console.dir(err);
      this.error("Print failed");
      this.printLines = undefined;
      this.setStatus({ state: "connected" });
    }
  }
}
