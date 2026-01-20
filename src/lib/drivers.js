import { LXPrinter } from "./lxprinter.js";
import { YHKPrinter } from "./yhkprinter.js";

// TODO there has to be a better way than 'any'
const _drivers = {
  LX: LXPrinter,
  YHK: YHKPrinter,
};

export function drivers() {
  return Object.keys(_drivers);
}

export async function connect(driverName) {
  if (!(driverName in _drivers)) throw new Error(`No driver '${driverName}'`);
  const printer = new _drivers[driverName]();
  printer.connect();
  return printer;
}
