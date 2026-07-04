<template>
  <div class="label-editor">
    <div class="label-stage">
      <v-stage
        ref="stageRef"
        :config="{
          width: stageWidth,
          height: stageHeight,
          scaleX: zoom,
          scaleY: zoom,
          x: 0,
          y: 0,
        }"
        @mousedown="onStageMouseDown"
        @touchstart="onStageMouseDown"
      >
        <v-layer>
          <v-group :config="{ x: stagePadding, y: stagePadding, name: 'contentGroup' }">
            <v-rect
              :config="{
                x: 0,
                y: 0,
                width,
                height,
                fill: '#ffffff',
                cornerRadius: 12,
                listening: false,
              }"
            />
            <template v-for="item in elements" :key="item.id">
              <v-group
                v-if="item.type === 'text'"
                :config="{
                  id: item.id,
                  x: item.x,
                  y: item.y,
                  rotation: item.rotation || 0,
                  draggable: true,
                  clipX: item.clip ? 0 : undefined,
                  clipY: item.clip ? 0 : undefined,
                  clipWidth: item.clip ? item.width : undefined,
                  clipHeight: item.clip ? item.height : undefined,
                }"
                @dragmove="onDragMove(item, $event)"
                @dragend="onDragEnd(item, $event)"
                @transformend="onTransformEnd(item, $event)"
                @mousedown="selectItem(item, $event)"
                @touchstart="selectItem(item, $event)"
              >
                <v-rect
                  :config="{
                    x: 0,
                    y: 0,
                    width: item.width,
                    height: item.height,
                    fill: 'transparent',
                    listening: false,
                  }"
                />
                <v-rect
                  v-if="item.bgFill && item.bgFill !== 'transparent'"
                  :config="{
                    x: 0,
                    y: 0,
                    width: item.width,
                    height: item.height,
                    fill: item.bgFill,
                    cornerRadius: 4,
                    listening: false,
                  }"
                />
                <v-text :config="textConfig(item)" />
              </v-group>
              <v-rect
                v-else-if="item.type === 'rect'"
                :config="rectConfig(item)"
                @dragmove="onDragMove(item, $event)"
                @dragend="onDragEnd(item, $event)"
                @transformend="onTransformEnd(item, $event)"
                @mousedown="selectItem(item, $event)"
                @touchstart="selectItem(item, $event)"
              />
              <v-ellipse
                v-else-if="item.type === 'ellipse'"
                :config="ellipseConfig(item)"
                @dragmove="onDragMove(item, $event)"
                @dragend="onDragEnd(item, $event)"
                @transformend="onTransformEnd(item, $event)"
                @mousedown="selectItem(item, $event)"
                @touchstart="selectItem(item, $event)"
              />
              <v-line
                v-else-if="item.type === 'line'"
                :config="lineConfig(item)"
                @dragmove="onDragMove(item, $event)"
                @dragend="onDragEnd(item, $event)"
                @transformend="onTransformEnd(item, $event)"
                @mousedown="selectItem(item, $event)"
                @touchstart="selectItem(item, $event)"
              />
              <v-image
                v-else-if="
                  item.type === 'image' ||
                  item.type === 'barcode' ||
                  item.type === 'qrcode'
                "
                :config="imageConfig(item)"
                @dragmove="onDragMove(item, $event)"
                @dragend="onDragEnd(item, $event)"
                @transformend="onTransformEnd(item, $event)"
                @mousedown="selectItem(item, $event)"
                @touchstart="selectItem(item, $event)"
              />
            </template>
            <v-group :config="{ name: 'guideLayer', listening: false }">
              <v-line
                v-for="(g, i) in guides"
                :key="'guide-' + i"
                :config="guideConfig(g)"
              />
            </v-group>
          </v-group>
        </v-layer>
        <v-layer :config="{ listening: false }">
          <v-rect
            :config="{
              x: 0,
              y: 0,
              width: baseStageWidth,
              height: baseStageHeight,
              fill: 'rgba(0, 0, 0, 0.35)',
            }"
          />
          <v-rect
            :config="{
              x: stagePadding,
              y: stagePadding,
              width,
              height,
              fill: '#000000',
              globalCompositeOperation: 'destination-out',
            }"
          />
        </v-layer>
        <v-layer>
          <v-transformer
            ref="transformerRef"
            :config="transformerConfig"
            @transform="onTransformSnap"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from "vue";
import Konva from "konva";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  zoom: { type: Number, default: 1 },
});

const emit = defineEmits([
  "change-bitmap",
  "selection-change",
  "layout-change",
]);

const stageRef = ref(null);
const transformerRef = ref(null);
const elements = ref([]);
const selectedId = ref(null);
const imageCache = new Map();
const stagePadding = 80;

// Active alignment guide lines (page centers/edges + other elements).
const guides = ref([]);
const SNAP_THRESHOLD = 6; // content-space px within which edges snap

const baseStageWidth = computed(() => props.width + stagePadding * 2);
const baseStageHeight = computed(() => props.height + stagePadding * 2);
const stageWidth = computed(() => Math.round(baseStageWidth.value * zoom.value));
const stageHeight = computed(() => Math.round(baseStageHeight.value * zoom.value));
const zoom = computed(() => Math.max(0.5, Math.min(2, props.zoom || 1)));


const history = ref([]);
const historyIndex = ref(-1);

const transformerConfig = {
  rotateEnabled: true,
  // keepRatio is set per-selection in syncTransformer; "inverted" lets Shift
  // temporarily free the aspect ratio while dragging a corner handle.
  shiftBehavior: "inverted",
  enabledAnchors: [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "middle-left",
    "middle-right",
    "top-center",
    "bottom-center",
  ],
  ignoreStroke: true,
  clipDuringTransform: false,
  boundBoxFunc: (oldBox, newBox) => {
    const isLine =
      oldBox.width <= 1 ||
      oldBox.height <= 1 ||
      newBox.width <= 1 ||
      newBox.height <= 1;
    if (isLine) {
      if (newBox.width < 1 || newBox.height < 0) return oldBox;
      return newBox;
    }
    if (newBox.width < 10 || newBox.height < 0) return oldBox;
    return newBox;
  },
};

const cloneElements = (value) => JSON.parse(JSON.stringify(value));

const commitHistory = () => {
  const snapshot = cloneElements(elements.value);
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(snapshot);
  historyIndex.value = history.value.length - 1;
};

const restoreHistory = (index) => {
  if (index < 0 || index >= history.value.length) return;
  historyIndex.value = index;
  elements.value = cloneElements(history.value[index]);
  selectedId.value = null;
  syncTransformer();
  nextTick(emitBitmap);
};

const addElement = (item) => {
  elements.value = [...elements.value, item];
  selectedId.value = item.id;
  commitHistory();
  nextTick(() => {
    syncTransformer();
    emitBitmap();
    emitSelection();
  });
};

const addText = () => {
  addElement({
    id: crypto.randomUUID(),
    type: "text",
    x: Math.max(20, props.width / 2 - 80),
    y: Math.max(20, props.height / 2 - 16),
    width: 160,
    height: 32,
    text: "New Text",
    fontSize: 24,
    fontFamily: "Roboto, sans-serif",
    fill: "#000000",
    bgFill: "transparent",
    bold: false,
    italic: false,
    underline: false,
    align: "center",
    verticalAlign: "middle",
    noWrap: false,
    clip: false,
    autoFit: false,
    rotation: 0,
  });
};

const addRect = () => {
  addElement({
    id: crypto.randomUUID(),
    type: "rect",
    x: Math.max(20, props.width / 2 - 80),
    y: Math.max(20, props.height / 2 - 50),
    width: 160,
    height: 100,
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 0,
    cornerRadius: 6,
    rotation: 0,
  });
};

const buildBarcodeDataUrl = (value, format) => {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, value || "000000000000", {
      format,
      displayValue: false,
      lineColor: "#000000",
      background: "#ffffff",
      margin: 0,
    });
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
};

const addBarcode = () => {
  const src = buildBarcodeDataUrl("123456789012", "CODE128");
  addElement({
    id: crypto.randomUUID(),
    type: "barcode",
    x: Math.max(20, props.width / 2 - 120),
    y: Math.max(20, props.height / 2 - 40),
    width: 240,
    height: 80,
    barcodeType: "CODE128",
    barcodeValue: "123456789012",
    src,
    rotation: 0,
  });
};

// Render a QR code to a crisp black/white PNG data URL. Uses the low-level
// matrix API so it stays synchronous, like the barcode path.
const buildQrDataUrl = (value, ecLevel) => {
  try {
    const qr = QRCode.create(value || " ", {
      errorCorrectionLevel: ecLevel || "M",
    });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const quiet = 4; // quiet-zone width in modules (spec minimum)
    const total = size + quiet * 2;
    const cell = Math.max(4, Math.floor(512 / total));
    const px = total * cell;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c]) {
          ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
        }
      }
    }
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
};

const addQrcode = () => {
  const value = "https://example.com";
  const src = buildQrDataUrl(value, "M");
  addElement({
    id: crypto.randomUUID(),
    type: "qrcode",
    x: Math.max(20, props.width / 2 - 60),
    y: Math.max(20, props.height / 2 - 60),
    width: 120,
    height: 120,
    qrValue: value,
    qrEcLevel: "M",
    src,
    rotation: 0,
  });
};

const addImage = (payload, size) => {
  const isObject = payload && typeof payload === "object";
  const src = isObject ? payload.src : payload;
  if (!src) return;
  const width = size?.width || payload?.width || 200;
  const height = size?.height || payload?.height || 120;
  addElement({
    id: crypto.randomUUID(),
    type: "image",
    x: Math.max(20, props.width / 2 - width / 2),
    y: Math.max(20, props.height / 2 - height / 2),
    width,
    height,
    src,
    originalSrc: isObject ? payload.originalSrc || src : src,
    imageFilter: isObject ? payload.imageFilter || "threshold" : "threshold",
    imageBrightness: isObject && Number.isFinite(payload.imageBrightness) ? payload.imageBrightness : 0,
    lockAspect: true,
    aspect: width / height,
    rotation: 0,
  });
};

const addEllipse = () => {
  addElement({
    id: crypto.randomUUID(),
    type: "ellipse",
    x: Math.max(20, props.width / 2 - 80),
    y: Math.max(20, props.height / 2 - 50),
    width: 160,
    height: 100,
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 0,
    rotation: 0,
  });
};

const addLine = () => {
  addElement({
    id: crypto.randomUUID(),
    type: "line",
    x: Math.max(20, props.width / 2 - 80),
    y: Math.max(20, props.height / 2 - 40),
    width: 160,
    height: 0,
    stroke: "#000000",
    strokeWidth: 3,
    rotation: 0,
  });
};

const normalizeElement = (item) => {
  if (!item || typeof item !== "object") return null;
  if (!item.type) return null;
  const id = item.id || crypto.randomUUID();
  const base = {
    id,
    x: Number.isFinite(item.x) ? item.x : 20,
    y: Number.isFinite(item.y) ? item.y : 20,
    width: Number.isFinite(item.width) ? item.width : 160,
    height: Number.isFinite(item.height) ? item.height : 80,
    rotation: Number.isFinite(item.rotation) ? item.rotation : 0,
  };
  if (item.type === "text") {
    return {
      ...base,
      type: "text",
      text: item.text || "Text",
      fontSize: Number.isFinite(item.fontSize) ? item.fontSize : 24,
      fontFamily: item.fontFamily || "Roboto, sans-serif",
      fill: item.fill || "#000000",
      bgFill: item.bgFill || "transparent",
      bold: !!item.bold,
      italic: !!item.italic,
      underline: !!item.underline,
      align: item.align || "left",
      verticalAlign: item.verticalAlign || "top",
      noWrap: !!item.noWrap,
      clip: !!item.clip,
      autoFit: !!item.autoFit,
    };
  }
  if (item.type === "rect") {
    return {
      ...base,
      type: "rect",
      fill: item.fill || "#000000",
      stroke: item.stroke || "#000000",
      strokeWidth: Number.isFinite(item.strokeWidth) ? item.strokeWidth : 0,
      cornerRadius: Number.isFinite(item.cornerRadius) ? item.cornerRadius : 0,
    };
  }
  if (item.type === "ellipse") {
    return {
      ...base,
      type: "ellipse",
      fill: item.fill || "#000000",
      stroke: item.stroke || "#000000",
      strokeWidth: Number.isFinite(item.strokeWidth) ? item.strokeWidth : 0,
    };
  }
  if (item.type === "line") {
    return {
      ...base,
      type: "line",
      stroke: item.stroke || "#000000",
      strokeWidth: Number.isFinite(item.strokeWidth) ? item.strokeWidth : 2,
    };
  }
  if (item.type === "barcode") {
    const barcodeType = item.barcodeType || "CODE128";
    const barcodeValue = item.barcodeValue || "123456789012";
    return {
      ...base,
      type: "barcode",
      barcodeType,
      barcodeValue,
      src: item.src || buildBarcodeDataUrl(barcodeValue, barcodeType),
    };
  }
  if (item.type === "qrcode") {
    const qrValue = item.qrValue || "https://example.com";
    const qrEcLevel = item.qrEcLevel || "M";
    return {
      ...base,
      type: "qrcode",
      qrValue,
      qrEcLevel,
      src: item.src || buildQrDataUrl(qrValue, qrEcLevel),
    };
  }
  if (item.type === "image") {
    return {
      ...base,
      type: "image",
      src: item.src || "",
      originalSrc: item.originalSrc || item.src || "",
      imageFilter: item.imageFilter || "threshold",
      imageBrightness: Number.isFinite(item.imageBrightness) ? item.imageBrightness : 0,
      lockAspect: item.lockAspect !== false,
      aspect: Number.isFinite(item.aspect)
        ? item.aspect
        : base.height
          ? base.width / base.height
          : 1,
      naturalWidth: item.naturalWidth,
      naturalHeight: item.naturalHeight,
    };
  }
  return null;
};


const deleteSelected = () => {
  if (!selectedId.value) return;
  elements.value = elements.value.filter((item) => item.id !== selectedId.value);
  selectedId.value = null;
  commitHistory();
  syncTransformer();
  emitSelection();
  nextTick(emitBitmap);
};

const duplicateSelected = () => {
  const item = elements.value.find((x) => x.id === selectedId.value);
  if (!item) return;
  const copy = { ...cloneElements(item), id: crypto.randomUUID() };
  copy.x += 12;
  copy.y += 12;
  addElement(copy);
};

const raiseSelected = () => {
  const idx = elements.value.findIndex((x) => x.id === selectedId.value);
  if (idx < 0 || idx === elements.value.length - 1) return;
  const updated = [...elements.value];
  const [item] = updated.splice(idx, 1);
  updated.splice(idx + 1, 0, item);
  elements.value = updated;
  commitHistory();
  emitSelection();
  nextTick(emitBitmap);
};

const lowerSelected = () => {
  const idx = elements.value.findIndex((x) => x.id === selectedId.value);
  if (idx <= 0) return;
  const updated = [...elements.value];
  const [item] = updated.splice(idx, 1);
  updated.splice(idx - 1, 0, item);
  elements.value = updated;
  commitHistory();
  emitSelection();
  nextTick(emitBitmap);
};

const undo = () => restoreHistory(historyIndex.value - 1);
const redo = () => restoreHistory(historyIndex.value + 1);

const emitSelection = () => {
  const item = elements.value.find((x) => x.id === selectedId.value);
  if (!item) {
    emit("selection-change", null);
    return;
  }
  const index = elements.value.findIndex((x) => x.id === item.id);
  emit("selection-change", {
    item: { ...item },
    index: index + 1,
    total: elements.value.length,
  });
};

const selectItem = (item, evt) => {
  evt.cancelBubble = true;
  selectedId.value = item.id;
  nextTick(() => {
    syncTransformer();
    emitSelection();
  });
};

const onStageMouseDown = (evt) => {
  const stage = evt.target.getStage();
  if (evt.target === stage) {
    selectedId.value = null;
    clearGuides();
    syncTransformer();
    emitSelection();
  }
};

const syncTransformer = () => {
  const transformer = transformerRef.value?.getNode();
  const stage = stageRef.value?.getStage();
  if (!transformer || !stage) return;
  const selectedNode = selectedId.value ? stage.findOne(`#${selectedId.value}`) : null;
  transformer.nodes(selectedNode ? [selectedNode] : []);
  const item = elements.value.find((x) => x.id === selectedId.value);
  if (item && item.type === "image") {
    transformer.keepRatio(item.lockAspect !== false);
  } else if (item && item.type === "line") {
    transformer.keepRatio(false); // a line has no meaningful aspect
  } else {
    // Corner handles keep the aspect ratio (QR stays square, text/shapes keep
    // proportion); the side handles still stretch a single axis. Hold Shift to
    // temporarily free the ratio.
    transformer.keepRatio(true);
  }
  transformer.forceUpdate();
  if (selectedNode && selectedNode.getLayer()) {
    selectedNode.getLayer().batchDraw();
  } else {
    transformer.getLayer()?.batchDraw();
  }
};

const updateItem = (item, updates, commit = true) => {
  elements.value = elements.value.map((x) => {
    if (x.id !== item.id) return x;
    const next = { ...x, ...updates };
    if (updates.src && updates.src !== x.src) {
      imageCache.delete(x.id);
    }
    if (next.type === "image" && x.naturalWidth && x.naturalHeight) {
      next.aspect = next.naturalWidth / next.naturalHeight;
    }
    return next;
  });
  if (selectedId.value === item.id) emitSelection();
  if (commit) {
    commitHistory();
    emitBitmap();
  }
};

const onDragEnd = (item, evt) => {
  updateItem(item, { x: evt.target.x(), y: evt.target.y() });
  clearGuides();
};

const onDragMove = (item, evt) => {
  const node = evt.target;
  applySnap(node, item.id);
  updateItem(item, { x: node.x(), y: node.y() }, false);
};

// --- Alignment guides / snapping ------------------------------------------
const getContentGroup = () => {
  const stage = stageRef.value?.getStage();
  return stage?.findOne(".contentGroup") || null;
};

// Collect candidate snap positions along one axis: page edges/center plus the
// edges/center of every other element's bounding box (in content coordinates).
const collectSnapLines = (axis, excludeId, content) => {
  const stage = stageRef.value?.getStage();
  const pageSize = axis === "x" ? props.width : props.height;
  const lines = [0, pageSize / 2, pageSize];
  if (!stage || !content) return lines;
  for (const el of elements.value) {
    if (el.id === excludeId) continue;
    const node = stage.findOne(`#${el.id}`);
    if (!node) continue;
    const r = node.getClientRect({ relativeTo: content });
    if (axis === "x") lines.push(r.x, r.x + r.width / 2, r.x + r.width);
    else lines.push(r.y, r.y + r.height / 2, r.y + r.height);
  }
  return lines;
};

// Snap the node so its nearest edge/center aligns with a target, and record
// the guide lines to draw. Returns nothing; mutates node position + guides.
const applySnap = (node, excludeId) => {
  const content = getContentGroup();
  if (!content) return;
  const box = node.getClientRect({ relativeTo: content });
  const active = [];

  const findBest = (edges, targets) => {
    let best = null;
    for (const edge of edges) {
      for (const target of targets) {
        const delta = target - edge;
        if (
          Math.abs(delta) <= SNAP_THRESHOLD &&
          (!best || Math.abs(delta) < Math.abs(best.delta))
        ) {
          best = { delta, target };
        }
      }
    }
    return best;
  };

  const vBest = findBest(
    [box.x, box.x + box.width / 2, box.x + box.width],
    collectSnapLines("x", excludeId, content),
  );
  if (vBest) {
    node.x(node.x() + vBest.delta);
    active.push({ axis: "x", pos: vBest.target });
  }

  const hBest = findBest(
    [box.y, box.y + box.height / 2, box.y + box.height],
    collectSnapLines("y", excludeId, content),
  );
  if (hBest) {
    node.y(node.y() + hBest.delta);
    active.push({ axis: "y", pos: hBest.target });
  }

  guides.value = active;
};

const clearGuides = () => {
  if (guides.value.length) guides.value = [];
};

const guideConfig = (g) => {
  const strokeWidth = 1 / zoom.value;
  const base = {
    stroke: "#ff2d8b",
    strokeWidth,
    dash: [4 / zoom.value, 4 / zoom.value],
    listening: false,
  };
  if (g.axis === "x") {
    return {
      ...base,
      points: [g.pos, -stagePadding, g.pos, props.height + stagePadding],
    };
  }
  return {
    ...base,
    points: [-stagePadding, g.pos, props.width + stagePadding, g.pos],
  };
};

// While resizing, show guides when an edge/center lines up (visual aid only;
// the actual size is baked on transform end).
const onTransformSnap = () => {
  const transformer = transformerRef.value?.getNode();
  const node = transformer?.nodes()[0];
  const content = getContentGroup();
  if (!node || !content) return;
  const box = node.getClientRect({ relativeTo: content });
  const active = [];
  const near = (value, targets) =>
    targets.find((t) => Math.abs(t - value) <= SNAP_THRESHOLD);
  const vTargets = collectSnapLines("x", selectedId.value, content);
  const hTargets = collectSnapLines("y", selectedId.value, content);
  for (const edge of [box.x, box.x + box.width / 2, box.x + box.width]) {
    const hit = near(edge, vTargets);
    if (hit !== undefined) active.push({ axis: "x", pos: hit });
  }
  for (const edge of [box.y, box.y + box.height / 2, box.y + box.height]) {
    const hit = near(edge, hTargets);
    if (hit !== undefined) active.push({ axis: "y", pos: hit });
  }
  guides.value = active;
};

const onTransformEnd = (item, evt) => {
  const node = evt.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  node.scaleX(1);
  node.scaleY(1);
  const baseWidth = item.width || node.width();
  const baseHeight = item.height || node.height();
  const width = item.type === "line" ? Math.max(1, baseWidth * scaleX) : Math.max(10, baseWidth * scaleX);
  const height = item.type === "line" ? Math.max(0, baseHeight * scaleY) : Math.max(10, baseHeight * scaleY);
  updateItem(item, {
    x: node.x(),
    y: node.y(),
    width,
    height,
    rotation: node.rotation(),
  });
  clearGuides();
  nextTick(syncTransformer);
};

const getTextFontSize = (item) => {
  const baseSize = item.fontSize || 24;
  if (!item.autoFit) return baseSize;
  const minSize = 6;
  const maxSize = baseSize;
  const wrap = item.noWrap ? "none" : "word";
  const fontStyle = `${item.bold ? "bold" : ""} ${item.italic ? "italic" : ""}`
    .trim()
    .replace(/\s+/g, " ");

  const fits = (size) => {
    const node = new Konva.Text({
      text: item.text || "",
      width: item.width,
      height: item.height,
      fontSize: size,
      fontFamily: item.fontFamily || "sans-serif",
      fontStyle: fontStyle || "normal",
      textDecoration: item.underline ? "underline" : "",
      wrap,
    });
    const rect = node.getClientRect();
    return rect.width <= item.width + 0.1 && rect.height <= item.height + 0.1;
  };

  let low = minSize;
  let high = maxSize;
  let best = minSize;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (fits(mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
};

const textConfig = (item) => ({
  x: 0,
  y: 0,
  width: item.width,
  height: item.height,
  text: item.text,
  fontSize: getTextFontSize(item),
  fontFamily: item.fontFamily,
  fill: item.fill,
  align: item.align || "left",
  verticalAlign: item.verticalAlign || "top",
  fontStyle: `${item.bold ? "bold" : ""} ${item.italic ? "italic" : ""}`.trim() || "normal",
  textDecoration: item.underline ? "underline" : "",
  wrap: item.noWrap ? "none" : "word",
  rotation: 0,
});



const imageConfig = (item) => {
  const img = imageCache.get(item.id);
  return {
    id: item.id,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    image: img || undefined,
    draggable: true,
    rotation: item.rotation || 0,
  };
};

const ensureImage = (item) => {
  if (!item.src) return;
  if (imageCache.has(item.id)) return;
  const img = new Image();
  img.onload = () => {
    imageCache.set(item.id, img);
    const updates = {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      imageRev: (item.imageRev || 0) + 1,
    };
    updateItem(item, updates, false);
    emitBitmap();
  };
  img.src = item.src;
};

const rectConfig = (item) => ({
  id: item.id,
  x: item.x,
  y: item.y,
  width: item.width,
  height: item.height,
  fill: item.fill,
  stroke: item.stroke,
  strokeWidth: item.strokeWidth || 0,
  cornerRadius: item.cornerRadius || 0,
  draggable: true,
  rotation: item.rotation || 0,
});

const ellipseConfig = (item) => ({
  id: item.id,
  x: item.x,
  y: item.y,
  radiusX: item.width / 2,
  radiusY: item.height / 2,
  fill: item.fill,
  stroke: item.stroke,
  strokeWidth: item.strokeWidth || 0,
  draggable: true,
  rotation: item.rotation || 0,
});

const lineConfig = (item) => ({
  id: item.id,
  x: item.x,
  y: item.y,
  points: [0, 0, item.width, item.height],
  stroke: item.stroke,
  strokeWidth: item.strokeWidth || 2,
  lineCap: "round",
  draggable: true,
  rotation: item.rotation || 0,
});

const updateBarcodeSrc = (item) => {
  if (item.type !== "barcode") return;
  const src = buildBarcodeDataUrl(item.barcodeValue, item.barcodeType);
  updateItem(item, { src }, false);
  imageCache.delete(item.id);
  ensureImage({ ...item, src });
};

const updateQrSrc = (item) => {
  if (item.type !== "qrcode") return;
  const src = buildQrDataUrl(item.qrValue, item.qrEcLevel);
  updateItem(item, { src }, false);
  imageCache.delete(item.id);
  ensureImage({ ...item, src });
};

const emitBitmap = () => {
  const stage = stageRef.value?.getStage();
  if (!stage) return;
  const transformer = transformerRef.value?.getNode();
  const wasVisible = transformer?.visible();
  if (transformer) transformer.visible(false);
  // Never bake alignment guides into the printable bitmap.
  const guideLayer = stage.findOne(".guideLayer");
  const guidesWereVisible = guideLayer?.visible();
  if (guideLayer) guideLayer.visible(false);
  const prevScale = stage.scale();
  const prevPos = stage.position();
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  const canvas = stage.toCanvas({
    x: stagePadding,
    y: stagePadding,
    width: props.width,
    height: props.height,
    pixelRatio: 1,
  });
  stage.scale(prevScale);
  stage.position(prevPos);
  if (transformer) transformer.visible(wasVisible);
  if (guideLayer) guideLayer.visible(guidesWereVisible);
  const output = document.createElement("canvas");
  output.width = canvas.width;
  output.height = canvas.height;
  const outCtx = output.getContext("2d");
  if (!outCtx) return;
  outCtx.fillStyle = "#ffffff";
  outCtx.fillRect(0, 0, output.width, output.height);
  outCtx.drawImage(canvas, 0, 0);
  const context = output.getContext("2d");
  if (!context) return;
  emit("change-bitmap", context.getImageData(0, 0, output.width, output.height));
};

const onKeyDown = (event) => {
  const target = event.target;
  if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

  const cmd = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  if (cmd && key === "z") {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
    return;
  }

  if (cmd && key === "d") {
    event.preventDefault();
    duplicateSelected();
    return;
  }

  if (key === "delete" || key === "backspace") {
    event.preventDefault();
    deleteSelected();
    return;
  }

  if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
    event.preventDefault();
    const item = elements.value.find((x) => x.id === selectedId.value);
    if (!item) return;
    const step = event.shiftKey ? 10 : 1;
    const delta = {
      arrowup: { x: 0, y: -step },
      arrowdown: { x: 0, y: step },
      arrowleft: { x: -step, y: 0 },
      arrowright: { x: step, y: 0 },
    }[key];
    updateItem(item, { x: item.x + delta.x, y: item.y + delta.y });
    commitHistory();
    emitBitmap();
  }
};

onMounted(() => {
  if (!elements.value.length) addText();
  nextTick(() => {
    commitHistory();
    emitBitmap();
    emitSelection();
  });
  window.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});

watch(
  () => [props.width, props.height, zoom.value],
  () => {
    nextTick(() => {
      emitBitmap();
      syncTransformer();
    });
  },
);

watch(elements, () => {
  nextTick(emitBitmap);
  emit("layout-change");
});

watch(
  elements,
  (items) => {
    items.forEach((item) => {
      if (
        item.type === "image" ||
        item.type === "barcode" ||
        item.type === "qrcode"
      )
        ensureImage(item);
    });
  },
  { deep: true },
);

defineExpose({
  addText,
  addRect,
  addEllipse,
  addLine,
  addBarcode,
  addQrcode,
  addImage,
  deleteSelected,
  duplicateSelected,
  raiseSelected,
  lowerSelected,
  undo,
  redo,
  resetLayout: () => {
    elements.value = [];
    selectedId.value = null;
    commitHistory();
    addText();
    nextTick(() => {
      syncTransformer();
      emitSelection();
      emitBitmap();
    });
  },
  exportLayout: () => cloneElements(elements.value),
  importLayout: (items) => {
    if (!Array.isArray(items)) return;
    const normalized = items.map(normalizeElement).filter(Boolean);
    elements.value = normalized;
    selectedId.value = null;
    commitHistory();
    syncTransformer();
    emitSelection();
    nextTick(() => {
      normalized.forEach((item) => {
        if (
        item.type === "image" ||
        item.type === "barcode" ||
        item.type === "qrcode"
      )
        ensureImage(item);
      });
      emitBitmap();
    });
  },
  updateSelected: async (updates, commit = true) => {
    const item = elements.value.find((x) => x.id === selectedId.value);
    if (!item) return;
    updateItem(item, updates, commit);
    if (
      item.type === "barcode" &&
      (Object.prototype.hasOwnProperty.call(updates, "barcodeValue") ||
        Object.prototype.hasOwnProperty.call(updates, "barcodeType"))
    ) {
      updateBarcodeSrc({ ...item, ...updates });
    }
    if (
      item.type === "qrcode" &&
      (Object.prototype.hasOwnProperty.call(updates, "qrValue") ||
        Object.prototype.hasOwnProperty.call(updates, "qrEcLevel"))
    ) {
      updateQrSrc({ ...item, ...updates });
    }
    await nextTick();
    syncTransformer();
  },
  getSelected: () => elements.value.find((x) => x.id === selectedId.value) || null,
  getElements: () => [...elements.value],
});
</script>
