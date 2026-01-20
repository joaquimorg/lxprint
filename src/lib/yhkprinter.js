import { Printer } from "./printer.js";
import { BitmapData } from "./bitmap.js";

function UintToString(buf) {
  return new TextDecoder().decode(buf);
}

export class YHKPrinter extends Printer {
  status = { state: "disconnected" };

  get driverName() {
    return "yhk";
  }

  get name() {
    return "YHK";
  }

  async connect() {
    this.dev = await navigator.serial.requestPort({
      allowedBluetoothServiceClassIds: ["00001101-0000-1000-8000-00805f9b34fb"],
      filters: [
        { bluetoothServiceClassId: "00001101-0000-1000-8000-00805f9b34fb" },
      ],
    });
    await this.dev.open({ baudRate: 9600 });
    if (!(this.dev.readable && this.dev.writable))
      throw new Error("Port not in a usable state");
    this.reader = this.dev.readable.getReader();
    this.writer = this.dev.writable.getWriter();
    this.setStatus({ state: "connected" });
    this.statusInterval = setInterval(() => {
      this.pulseStatus().then((x) => console.log(x));
    }, 3000);
    console.log(UintToString(await this.getSerial()));
    console.log(UintToString(await this.getInfo()));
    console.log(UintToString(await this.getStatus()));
  }

  async disconnect() {
    clearInterval(this.statusInterval);
    if (this.reader) this.reader.releaseLock();
    if (this.writer) this.writer.releaseLock();
    if (this.dev) await this.dev.close();
    this.setStatus({ state: "disconnected" });
  }

  async cmdWithoutResponse(cmd) {
    if (!this.writer) throw new Error("Port writer not ready");
    await this.writer.write(cmd);
  }

  async cmdWithResponse(cmd) {
    if (!this.reader) throw new Error("Port reader not ready");
    await this.cmdWithoutResponse(cmd);
    const { value } = await this.reader.read();
    if (!value) throw new Error("No response");
    return value;
  }

  async getSerial() {
    const response = await this.cmdWithResponse(
      new Uint8Array([0x1d, 0x67, 0x39]),
    );
    return response;
  }

  async getInfo() {
    const response = await this.cmdWithResponse(
      new Uint8Array([0x1d, 0x67, 0x69]),
    );
    return response;
  }

  async getStatus() {
    const response = await this.cmdWithResponse(
      new Uint8Array([0x1e, 0x47, 0x03]),
    );
    return response;
  }

  async pulseStatus() {
    if (this.status.state !== "connected")
      return "Skipping status update, printer busy";
    const response = await this.getStatus();
    const status = Object.fromEntries(
      UintToString(response)
        .split(",")
        .map((x) => x.split("=")),
    );
    const voltage = parseInt(status["VOLT"]);
    // TODO: this battery level function is a wild-arsed guess.
    this.setStatus({ voltage: voltage, battery: (voltage - 6000) / 20 });
    return UintToString(response);
  }

  async print(img) {
    this.setStatus({ state: "printing" });

    const printingImage = new BitmapData(img);

    // Theoretically this sets the density
    await this.cmdWithoutResponse(new Uint8Array([0x1d, 0x49, 0xf0, 0x19]));

    await this.cmdWithoutResponse(new Uint8Array([0x1b, 0x40])); // Init

    // Send start code for 1-bit image data
    const header = new Uint8Array(8);
    const dv = new DataView(header.buffer);
    header.set([0x1d, 0x76, 0x30, 0x00]);
    dv.setUint16(4, img.width / 8, true);
    dv.setUint16(6, img.height, true);
    await this.cmdWithoutResponse(header);

    await this.cmdWithoutResponse(new Uint8Array(printingImage.bitmap));

    // End Print code
    await this.cmdWithoutResponse(new Uint8Array([0x0a, 0x0a, 0x0a, 0x0a]));

    this.setStatus({ state: "connected" });
  }
}
