<template>
  <div class="battery">
    <div class="battery-shell" :class="{ charging }">
      <div class="battery-fill" :style="{ width: `${fillWidth}px`, background: fillColor }" />
      <div class="battery-cap" />
    </div>
    <span class="battery-text">
      {{ charging ? "Charging" : levelLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  level: { type: Number, default: undefined },
  charging: { type: Boolean, default: false },
});

const fillWidth = computed(() => (props.level ? (26 * props.level) / 100 : 0));
const fillColor = computed(() => {
  if (props.charging) return "linear-gradient(90deg, #69d2ff, #52ffb8)";
  if (!props.level) return "#5b6475";
  if (props.level > 60) return "#52ffb8";
  if (props.level > 20) return "#69d2ff";
  return "#ff5f6d";
});

const levelLabel = computed(() => {
  if (typeof props.level !== "number") return "--%";
  return `${Math.round(props.level)}%`;
});
</script>

<style scoped>
.battery {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #e8f0ff;
}

.battery-shell {
  position: relative;
  width: 32px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(105, 210, 255, 0.4);
  background: rgba(12, 18, 30, 0.85);
  overflow: hidden;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.45);
}

.battery-fill {
  height: 100%;
  transition: width 0.25s ease;
}

.battery-cap {
  position: absolute;
  right: -3px;
  top: 3px;
  width: 3px;
  height: 8px;
  border-radius: 1px;
  background: rgba(105, 210, 255, 0.5);
}

.battery-shell.charging .battery-fill {
  animation: charge-flow 1.2s ease-in-out infinite;
}

.battery-text {
  font-size: 0.85em;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-dim);
}

@keyframes charge-flow {
  0% {
    filter: brightness(0.9);
  }
  50% {
    filter: brightness(1.2);
  }
  100% {
    filter: brightness(0.9);
  }
}
</style>
