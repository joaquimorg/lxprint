<template>
  <div class="printer-panel">
    <div class="printer-top">
      <div class="printer-status">
        <span class="printer-state" aria-hidden="true">
          <svg v-if="printerStatus.state === 'connected'" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.4 12.8l-1.4 1.4 2.6 2.6L18 9.4 16.6 8l-6.2 6.2-1-1.4z"
              fill="currentColor"
            />
            <path
              d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>
          <svg v-else-if="printerStatus.state === 'connecting'" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4a8 8 0 1 1-8 8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          </svg>
          <svg v-else-if="printerStatus.state === 'printing'" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="3" width="12" height="5" rx="1.5" stroke="currentColor" stroke-width="1.6" />
            <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" stroke-width="1.6" />
            <rect x="7" y="13" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6" />
            <path d="M9 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <svg v-else-if="printerStatus.state === 'standby'" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M9.5 9v6M14.5 9v6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7l10 10M17 7L7 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="3"
              stroke="currentColor"
              stroke-width="1.4"
            />
          </svg>
        </span>
        <span class="printer-name">{{ currentPrinterName }}</span>
      </div>
      <div class="printer-actions">
        <div v-if="isConnected">
          <button @click="disconnect" class="btn-icon">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 7l-1.4 1.4 2.1 2.1H9v2h6.7l-2.1 2.1L15 16l5-5-5-5z"
                  fill="currentColor"
                />
                <path
                  d="M5 5h8v2H7v10h6v2H5V5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Disconnect
          </button>
        </div>
        <div v-else class="printer-connect">
          <select v-model="driver">
            <option v-for="x in driverOptions" :key="x" :value="x">{{ x }}</option>
          </select>
          <button @click="connectPrinter" class="btn-icon">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 7l1.4 1.4-2.1 2.1H15v2H8.3l2.1 2.1L9 16l-5-5 5-5z"
                  fill="currentColor"
                />
                <path
                  d="M19 5h-8v2h6v10h-6v2h8V5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Connect
          </button>
        </div>
      </div>
      <div class="printer-threshold">
        <label class="prop-label">Threshold</label>
        <input type="range" min="80" max="240" v-model.number="thresholdValue" />
        <span class="threshold-value">{{ thresholdValue }}</span>
      </div>
      <div class="printer-controls">
        <select v-model="labelSize">
          <option v-for="opt in labelSizes" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button @click="print" :disabled="!canPrint" class="btn-icon">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6 7V3h12v4h2v6h-4v4H8v-4H4V7h2zm4 8h4v-3h4V9H6v3h4v3zm0-10v2h4V5h-4z"
                fill="currentColor"
              />
            </svg>
          </span>
          Print
        </button>
      </div>
    </div>
    <div class="printer-bottom">
      <div class="printer-readout" v-if="driverName === 'lx'">
        <BatteryIndicator :level="printerStatus.battery" :charging="printerStatus.charging" />
        <span v-if="printerStatus.noPaper" class="printer-flag">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 3h2v18H6V3zm3 1h9l-2 4 2 4H9V4z"
              fill="currentColor"
            />
          </svg>
          No Paper
        </span>
        <span v-if="printerStatus.lowBatt" class="printer-flag">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M7 6h10v12H7V6zm2 2v8h6V8H9z"
              fill="currentColor"
            />
            <path
              d="M10 10h4v4h-4v-4z"
              fill="currentColor"
            />
          </svg>
          Low Battery
        </span>
        <span v-if="printerStatus.overheat" class="printer-flag">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3c2.2 2.6 2.6 4.7 2.6 6.1 0 2.4-1.6 3.7-1.6 5.9 0 1.4.7 2.6 1.6 3.7-3.3-.4-6.2-3-6.2-6.8 0-2.9 1.7-4.3 1.7-6.4 0-1.1-.3-2-1-3.2 1.9.5 3 1.6 2.9 2.9z"
              fill="currentColor"
            />
          </svg>
          Overheat
        </span>
      </div>
      <div class="printer-readout" v-else-if="driverName === 'yhk'">
        <BatteryIndicator :level="printerStatus.battery" />
        <span>{{ printerStatus.voltage }}mV</span>
      </div>
      <div class="printer-errors">
        <div v-for="(x, i) in errors" :key="i" class="printer-flag">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l10 18H2L12 2zm0 5l-1 7h2l-1-7zm-1 10v2h2v-2h-2z"
              fill="currentColor"
            />
          </svg>
          {{ x }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import { drivers } from "../lib/drivers.js";
import { PrinterContextKey } from "../printerContext.js";
import BatteryIndicator from "./BatteryIndicator.vue";

const context = inject(PrinterContextKey);
if (!context) throw new Error("Printer context is missing");

const {
  printer,
  printerStatus,
  errors,
  connect,
  printThreshold,
  setPrintThreshold,
  bitmap,
  labelSize,
} = context;

const driverOptions = drivers();
const driver = ref(driverOptions[0]);

const isConnected = computed(() =>
  ["connected", "connecting", "printing", "standby"].includes(
    printerStatus.state,
  ),
);

const currentPrinterName = computed(() => {
  printerStatus.state;
  return printer.value?.name || "No Printer";
});
const driverName = computed(() => printer.value?.driverName);

const connectPrinter = () => connect(driver.value);
const disconnect = async () => await printer.value?.disconnect();

const thresholdValue = computed({
  get: () => printThreshold.value,
  set: (value) => setPrintThreshold(value),
});

const labelSizes = Array.from({ length: 9 }, (_, idx) => {
  const height = (idx + 2) * 10;
  return { value: `48x${height}`, label: `48x${height}mm` };
});

const canPrint = computed(
  () =>
    !!printer.value &&
    ["connected", "standby"].includes(printerStatus.state) &&
    !!bitmap.value,
);

const print = () => {
  if (!canPrint.value) return;
  const img = normalizeForLX(bitmap.value);
  printer.value.print(img);
};

const normalizeForLX = (img) => {
  if (!img) return img;
  if (printer.value?.driverName !== "lx") return img;
  const targetWidth = 384;
  if (img.width === targetWidth) return img;

  const src = document.createElement("canvas");
  src.width = img.width;
  src.height = img.height;
  const srcCtx = src.getContext("2d");
  if (!srcCtx) return img;
  srcCtx.putImageData(img, 0, 0);

  if (img.width > targetWidth) {
    const scale = targetWidth / img.width;
    const targetHeight = Math.max(1, Math.round(img.height * scale));
    const out = document.createElement("canvas");
    out.width = targetWidth;
    out.height = targetHeight;
    const outCtx = out.getContext("2d");
    if (!outCtx) return img;
    outCtx.drawImage(src, 0, 0, out.width, out.height);
    return outCtx.getImageData(0, 0, out.width, out.height);
  }

  const out = document.createElement("canvas");
  out.width = targetWidth;
  out.height = img.height;
  const outCtx = out.getContext("2d");
  if (!outCtx) return img;
  outCtx.fillStyle = "#ffffff";
  outCtx.fillRect(0, 0, out.width, out.height);
  const offsetX = Math.floor((targetWidth - img.width) / 2);
  outCtx.drawImage(src, offsetX, 0);
  return outCtx.getImageData(0, 0, out.width, out.height);
};

</script>
