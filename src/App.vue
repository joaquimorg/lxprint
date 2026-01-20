<template>
  <h1>Thermal Printer Label Editor</h1>
  <PrinterPanel />
  <LabelMaker />
  <Teleport to="body">
    <div v-if="showConnecting" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-title">Connecting</div>
        <div class="modal-body">Connecting to Bluetooth printer. Please wait.</div>
      </div>
    </div>
  </Teleport>
  <div id="footer">
    <div class="footer-row">
      <p>&copy; 2026 joaquim.org</p>
      <div class="footer-links">
        <a href="https://github.com/paradon/lxprint" target="_blank" rel="noreferrer">Based on this project</a>        
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import PrinterPanel from "./components/PrinterPanel.vue";
import LabelMaker from "./components/LabelMaker.vue";
import { PrinterContextKey } from "./printerContext.js";

const context = inject(PrinterContextKey);
if (!context) throw new Error("Printer context is missing");

const showConnecting = computed(() => context.isConnecting.value);
</script>
