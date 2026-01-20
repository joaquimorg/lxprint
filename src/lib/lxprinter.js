import "core-js/proposals/array-buffer-base64";

import { BitmapData } from "./bitmap.js";
import { Printer, PrinterErrorEvent } from "./printer.js";

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

  get driverName() {
    return "lx";
  }

  get name() {
    return this._name;
  }

  constructor() {
    super();
    // this.statusCallback = statusCallback;
    this.recvHandler = async (event) => await this.receiveMessage(event);
    this.onDisconnected = async (_) => {
      this.error("Disconnected");
      await this.disconnect();
    };
  }

  // static async connect() {
  //   const printer = new LXPrinter();
  //   await printer.init();
  //   return printer;
  // }

  // setStatus(status: Partial<PrinterStatus>) {
  //   this.status = {...this.status, ...status};
  //   if (this.statusCallback) this.statusCallback(status);
  // }

  error(msg) {
    this.dispatchEvent(new PrinterErrorEvent(msg));
  }

  async connect() {
    try {
      this.connectTimeout = setTimeout(() => {
        this.error("Connection Timeout");
        this.disconnect();
      }, 30000);
      this.setStatus({ state: "connecting" });
      // this.error = undefined;
      this.dev = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "LX" }],
        optionalServices: [0xffe6],
      });
      if (!this.dev?.gatt) throw new Error("No dev");
      this._name = this.dev.name;
      this.dev.addEventListener("gattserverdisconnected", this.onDisconnected);

      this.server = await this.dev.gatt.connect();
      if (!this.server) throw new Error("No GATT server");

      for (let i = 0; i < 4; i++) {
        if (i > 2)
          throw new Error("Failed to get GATT service after 3 retries");
        try {
          await this.server.getPrimaryServices();
          this.service = await this.server.getPrimaryService(0xffe6);
          if (!this.service) throw new Error("No service");
          i = 5;
        } catch (err) {
          console.log(`Failed to get GATT service, attempt ${i + 1}: ${err}`);
        }
      }
      if (!this.service) throw new Error("No service");
      this.sendChar = await this.service.getCharacteristic(0xffe1);
      this.recvChar = await this.service.getCharacteristic(0xffe2);

      await this.recvChar.startNotifications();
      this.recvChar.addEventListener(
        "characteristicvaluechanged",
        this.recvHandler,
      );

      await this.sendChar.writeValueWithoutResponse(
        new Uint8Array([0x5a, 0x01]),
      );
    } catch (err) {
      this.error("Connection Error");
      console.dir(err);
      await this.disconnect();
    }
  }

  async authStage1(msg) {
    this.mac = msg.slice(4, 10);
    console.dir(this.mac);
    this.authBytes = new Uint8Array(10);
    crypto.getRandomValues(this.authBytes);
    if (!this.authBytes) return;
    if (!this.mac) return;
    this.authCrc = Array.from(this.authBytes).map((x) => {
      const y = new Uint8Array(7);
      y[0] = x;
      y.set(this.mac || new Uint8Array(6), 1);
      return crc16xmodem(y);
    });

    const newMsg = new Uint8Array([0x5a, 0x0a, ...this.authBytes]);
    await this.sendChar?.writeValueWithoutResponse(newMsg);
  }

  async authStage2(_) {
    // We don't bother to verify the incoming message, but it should be 0x5a0a + authCrc.map(x => x & 0xFF)

    if (!this.authCrc) throw new Error("No authCrc");
    const newMsg = new Uint8Array([
      0x5a,
      0x0b,
      ...this.authCrc.map((x) => x >> 8),
    ]);
    await this.sendChar?.writeValueWithoutResponse(newMsg);
  }

  async disconnect() {
    clearTimeout(this.connectTimeout);
    this.connectTimeout = undefined;
    try {
      console.log("Stopping notifications");
      await this.recvChar?.stopNotifications();
      this.recvChar?.removeEventListener(
        "characteristicvaluechanged",
        this.recvHandler,
      );
    } catch {
      console.log("Failed to stop notifications");
    }

    try {
      console.log("Removing disconnect handler");
      this.dev?.removeEventListener(
        "gattserverdisconnected",
        this.onDisconnected,
      );
    } catch {
      console.log("Failed to remove disconnect handler");
    }

    this.dev = undefined;
    this._name = undefined;
    this.server = undefined;
    this.service = undefined;
    this.sendChar = undefined;
    this.recvChar = undefined;
    this.mac = undefined;
    this.authBytes = undefined;
    this.authCrc = undefined;
    this.setStatus({ state: "disconnected" });
  }

  async authResult(msg) {
    if (msg[2] !== 1) {
      await this.disconnect();
      return;
    }
    clearTimeout(this.connectTimeout);
    this.connectTimeout = undefined;
    this.setStatus({ state: "connected" });
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
      case 0x06:
        return await this.donePrinting(msg);
    }
  }

  async donePrinting(msg) {
    const dv = new DataView(msg.buffer);
    const printlen = dv.getUint16(2);

    await this.sendChar?.writeValueWithoutResponse(
      new Uint8Array([0x5a, 0x04, printlen >> 8, printlen & 0xff, 0x01, 0x00]),
    );

    this.setStatus({ state: "connected" });
  }

  async print(img) {
    this.setStatus({ state: "printing" });

    this.printingImage = new BitmapData(img);

    const msg = new Uint8Array(6);
    const dv = new DataView(msg.buffer);
    msg.set([0x5a, 0x04]);
    dv.setUint16(2, this.printingImage.printLength + 1);
    await this.sendChar?.writeValueWithoutResponse(msg);

    for (const line of this.printingImage.generatePrintData()) {
      await this.sendChar?.writeValueWithoutResponse(line);
    }

    const lastLine = new Uint8Array(100);
    lastLine.set([
      0x55,
      this.printingImage.printLength >> 8,
      this.printingImage.printLength & 0xff,
    ]);
    await this.sendChar?.writeValueWithoutResponse(lastLine);
  }
}
