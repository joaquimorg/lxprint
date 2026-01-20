export class Printer extends EventTarget {
  setStatus(status) {
    this.status = { ...this.status, ...status };
    console.dir({ setStatus: this.status });
    this.dispatchEvent(new PrinterStatusEvent(this.status));
  }
}

export class PrinterStatusEvent extends Event {
  constructor(status) {
    super("status");
    this.status = status;
  }
}

export class PrinterErrorEvent extends Event {
  constructor(msg) {
    super("error");
    this.msg = msg;
  }
}
