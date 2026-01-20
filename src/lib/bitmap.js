export class BitmapData {
  static threshold = 110;

  static setThreshold(value) {
    BitmapData.threshold = value;
  }

  constructor(img) {
    this.img = img;
    this.bitmap = new Uint8ClampedArray(img.data.length / 32);
    const dv = new DataView(img.data.buffer);
    const threshold = BitmapData.threshold;
    for (let i = 0; i < this.bitmap.length; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = byte << 1;
        const offset = (i * 8 + j) * 4;
        const r = dv.getUint8(offset);
        const g = dv.getUint8(offset + 1);
        const b = dv.getUint8(offset + 2);
        const a = dv.getUint8(offset + 3);
        if (a < 10) {
          byte += 0;
          continue;
        }
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        byte += lum < threshold ? 1 : 0;
      }
      this.bitmap[i] = byte;
    }
  }

  // This is specific to LX printers
  *generatePrintData() {
    for (let i = 0; i < this.printLength; i++) {
      const line = new Uint8Array(100);
      const dv = new DataView(line.buffer);
      dv.setUint8(0, 0x55);
      dv.setUint16(1, i);
      line.set(this.bitmap.slice(i * 96, (i + 1) * 96), 3);
      yield line;
    }
  }

  get printLength() {
    return Math.ceil(this.bitmap.length / 96);
  }
}
