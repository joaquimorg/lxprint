import { reactive, shallowRef, ref } from "vue";
import { connect } from "./lib/drivers.js";
import { BitmapData } from "./lib/bitmap.js";

export const PrinterContextKey = Symbol("PrinterContext");

export function createPrinterContext() {
  const printerStatus = reactive({ state: "disconnected" });
  const printer = shallowRef(null);
  const errors = reactive([]);
  const printThreshold = ref(110);
  const bitmap = ref(null);
  const labelSize = ref("48x30");
  const isConnecting = ref(false);

  const setPrintThreshold = (value) => {
    const next = Math.max(80, Math.min(240, value || 200));
    printThreshold.value = next;
    BitmapData.setThreshold(next);
  };

  setPrintThreshold(printThreshold.value);

  const connectPrinter = async (driver) => {
    errors.splice(0, errors.length);
    isConnecting.value = true;
    const prn = await connect(driver);
    prn.addEventListener("status", (e) => {
      Object.assign(printerStatus, e.status);
      if (["connected", "printing", "disconnected"].includes(e.status.state)) {
        isConnecting.value = false;
      }
    });
    prn.addEventListener("error", (e) => {
      errors.push(e.msg);
      isConnecting.value = false;
    });
    printer.value = prn;
    return prn;
  };

  return {
    printer,
    printerStatus,
    errors,
    printThreshold,
    setPrintThreshold,
    bitmap,
    labelSize,
    isConnecting,
    connect: connectPrinter,
  };
}
