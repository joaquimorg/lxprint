<template>
  <div class="label-maker">
    <div class="label-toolbar">
      <div class="label-tools">
        <button class="btn-icon" @click="addText">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 5h12v2h-5v12h-2V7H6V5z" fill="currentColor" />
            </svg>
          </span>
          Text
        </button>
        <button class="btn-icon" @click="addImage">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.6" />
              <circle cx="9" cy="11" r="2" fill="currentColor" />
              <path d="M8 16l3-3 3 3 3-4 3 4" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          Image
        </button>
        <button class="btn-icon" @click="addBarcode">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="2" height="12" fill="currentColor" />
              <rect x="8" y="6" width="1" height="12" fill="currentColor" />
              <rect x="11" y="6" width="2" height="12" fill="currentColor" />
              <rect x="15" y="6" width="1" height="12" fill="currentColor" />
              <rect x="18" y="6" width="2" height="12" fill="currentColor" />
            </svg>
          </span>
          Barcode
        </button>
        <button class="btn-icon" @click="addRect">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="5" y="7" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          Rect
        </button>
        <button class="btn-icon" @click="addEllipse">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="7" ry="5" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          Ellipse
        </button>
        <button class="btn-icon" @click="addLine">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 17L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          Line
        </button>
      </div>
      <div class="label-tools">
        <button class="btn-icon" @click="duplicateSelected">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.6" />
              <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          Duplicate
        </button>
        <button class="btn-icon" @click="deleteSelected">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M9 7V5h6v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <rect x="7" y="7" width="10" height="12" rx="2" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </span>
          Delete
        </button>
        <button class="btn-icon" @click="undo">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 8H4V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M4 8a8 8 0 1 0 2.3-5.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Undo
        </button>
        <button class="btn-icon" @click="redo">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 8h3V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M20 8a8 8 0 1 1-2.3-5.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Redo
        </button>
        <button class="btn-icon" @click="raiseSelected">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 6l5 6H7l5-6z" fill="currentColor" />
              <path d="M7 16h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Raise
        </button>
        <button class="btn-icon" @click="lowerSelected">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 18l-5-6h10l-5 6z" fill="currentColor" />
              <path d="M7 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Lower
        </button>
      </div>
      <div class="label-tools">
        <button class="btn-icon" @click="importJson">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 4v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M8 10l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5 18h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Import
        </button>
        <button class="btn-icon" @click="exportJson">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 20V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M8 14l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5 6h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          Export
        </button>
        <button class="btn-icon" @click="requestReset">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.6" />
              <path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </span>
          New
        </button>
      </div>
      <div class="label-tools">
      </div>
    </div>
    <div class="label-workspace">
      <div class="label-editor-wrap">
        <LabelEditor
          ref="editorRef"
          class="label-canvas-wrap"
          :width="labelWidthPx"
          :height="labelHeightPx"
          :zoom="zoom"
          @change-bitmap="setBitmap"
          @selection-change="onSelectionChange"
          @layout-change="scheduleAutosave"
        />
        <div class="label-zoom-panel" role="group" aria-label="Zoom controls">
          <button class="btn-icon" @click="zoomOut" title="Zoom out">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" />
                <path d="M8 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M16.5 16.5L20 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
          </button>
          <span class="zoom-value">{{ zoomLabel }}</span>
          <button class="btn-icon" @click="zoomIn" title="Zoom in">
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" />
                <path d="M11 8v6M8 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M16.5 16.5L20 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
          </button>
          <span class="zoom-divider" aria-hidden="true"></span>
          <button class="btn-icon" @click="resetZoom" title="Reset zoom">Reset</button>
        </div>
      </div>
      <div class="label-properties">
        <div class="prop-header">Properties</div>
        <div v-if="selected">
          <div class="prop-grid prop-grid-4">
            <div class="prop-field">
              <label class="prop-label">X</label>
              <input type="number" v-model.number="form.x" @input="applyForm" />
            </div>
            <div class="prop-field">
              <label class="prop-label">Y</label>
              <input type="number" v-model.number="form.y" @input="applyForm" />
            </div>
            <div class="prop-field">
              <label class="prop-label">W</label>
              <input type="number" v-model.number="form.width" @input="onWidthInput" />
            </div>
            <div class="prop-field">
              <label class="prop-label">H</label>
              <input type="number" v-model.number="form.height" @input="onHeightInput" />
            </div>
          </div>
          <div class="prop-grid prop-grid-2">
            <div class="prop-field">
              <label class="prop-label">Rotation</label>
              <input type="number" v-model.number="form.rotation" @input="applyForm" />
            </div>
            <div class="prop-field">
              <label class="prop-label">Layer</label>
              <div class="prop-layer">{{ layerInfo }}</div>
            </div>
          </div>

          <template v-if="selected.type === 'text'">
            <div class="prop-section">Text</div>
            <textarea v-model="form.text" rows="3" @input="applyForm" />
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Font</label>
                <select v-model="form.fontFamily" @change="applyForm">
                <optgroup label="Sans-Serif">
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="&quot;Open Sans&quot;, sans-serif">Open Sans</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Oswald, sans-serif">Oswald</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                </optgroup>
                <optgroup label="Serif">
                  <option value="&quot;Playfair Display&quot;, serif">Playfair Display</option>
                  <option value="Merriweather, serif">Merriweather</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="&quot;Times New Roman&quot;, serif">Times New Roman</option>
                </optgroup>
                <optgroup label="Monospace">
                  <option value="&quot;Roboto Mono&quot;, monospace">Roboto Mono</option>
                  <option value="&quot;Source Code Pro&quot;, monospace">Source Code Pro</option>
                  <option value="&quot;Courier New&quot;, monospace">Courier New</option>
                </optgroup>
                <optgroup label="Display">
                  <option value="Impact, sans-serif">Impact</option>
                  <option value="&quot;Comic Sans MS&quot;, cursive">Comic Sans</option>
                </optgroup>
              </select>
              </div>
              <div class="prop-field">
                <label class="prop-label">Size</label>
                <input type="number" v-model.number="form.fontSize" @input="applyForm" />
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Style</label>
                <div class="prop-inline">
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.bold }"
                    @click="toggleStyle('bold')"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.italic }"
                    @click="toggleStyle('italic')"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.underline }"
                    @click="toggleStyle('underline')"
                  >
                    <span class="underline">U</span>
                  </button>
                </div>
              </div>
              <div class="prop-field">
                <label class="prop-label">Color</label>
                <select v-model="form.fill" @change="applyForm">
                  <option v-for="opt in toneOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">BG</label>
                <select v-model="form.bgFill" @change="applyForm">
                  <option value="transparent">Transparent</option>
                  <option v-for="opt in toneOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="prop-field">
                <label class="prop-label">Options</label>
                <div class="prop-inline">
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.noWrap }"
                    @click="toggleTextOption('noWrap')"
                    title="No wrap"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 8h16M4 12h10M4 16h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                      <path d="M18 12h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.clip }"
                    @click="toggleTextOption('clip')"
                    title="Clip"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.autoFit }"
                    @click="toggleTextOption('autoFit')"
                    title="Auto-fit"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M7 7h4M7 7v4M17 7h-4M17 7v4M7 17h4M7 17v-4M17 17h-4M17 17v-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">H-Align</label>
                <div class="prop-inline">
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.align === 'left' }"
                    @click="setAlign('left')"
                    title="Left"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M6 8h10M6 12h7M6 16h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.align === 'center' }"
                    @click="setAlign('center')"
                    title="Center"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M7 8h10M9 12h6M6 16h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.align === 'right' }"
                    @click="setAlign('right')"
                    title="Right"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 8h10M11 12h7M6 16h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="prop-field">
                <label class="prop-label">V-Align</label>
                <div class="prop-inline">
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.verticalAlign === 'top' }"
                    @click="setVAlign('top')"
                    title="Top"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 6h8M10 10v8M14 10v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.verticalAlign === 'middle' }"
                    @click="setVAlign('middle')"
                    title="Middle"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M6 12h12M10 6v12M14 6v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-icon prop-icon"
                    :class="{ active: form.verticalAlign === 'bottom' }"
                    @click="setVAlign('bottom')"
                    title="Bottom"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 18h8M10 6v8M14 6v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selected.type === 'image'">
            <div class="prop-section">Image</div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Lock</label>
                <input type="checkbox" v-model="form.lockAspect" @change="applyForm" />
              </div>
              <div class="prop-field">
                <label class="prop-label">Scale</label>
                <div class="prop-inline">
                  <input type="range" min="10" max="300" v-model.number="form.imageScale" @input="onScaleInput" />
                  <input type="number" v-model.number="form.imageScale" @input="onScaleInput" />
                </div>
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Fit</label>
                <div class="prop-inline fit-buttons">
                  <button class="btn-icon" @click="fitToLabel('contain')" title="Contain" aria-label="Contain">
                    <span class="icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
                        <rect x="7" y="8" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4" />
                      </svg>
                    </span>
                  </button>
                  <button class="btn-icon" @click="fitToLabel('cover')" title="Cover" aria-label="Cover">
                    <span class="icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
                        <rect x="5.5" y="7" width="13" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" />
                      </svg>
                    </span>
                  </button>
                  <button class="btn-icon" @click="fitToLabel('original')" title="Original" aria-label="Original">
                    <span class="icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.6" />
                        <path d="M4 8V4h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                        <path d="M20 16v4h-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
              <div class="prop-field">
                <label class="prop-label">B&amp;W Filter</label>
                <select v-model="form.imageFilter" @change="onImageFilterChange">
                  <option v-for="opt in imageFilterOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Brightness</label>
                <div class="prop-inline">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    v-model.number="form.imageBrightness"
                    @input="onImageFilterChange"
                  />
                  <input type="number" v-model.number="form.imageBrightness" @input="onImageFilterChange" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="selected.type === 'barcode'">
            <div class="prop-section">Barcode</div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Type</label>
                <select v-model="form.barcodeType" @change="applyForm">
                  <option value="CODE128">Code128</option>
                  <option value="EAN13">EAN-13</option>
                  <option value="UPC">UPC-A</option>
                  <option value="CODE39">Code39</option>
                </select>
              </div>
              <div class="prop-field">
                <label class="prop-label">Value</label>
                <input type="text" v-model="form.barcodeValue" @input="applyForm" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="prop-section">Style</div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Fill</label>
                <select v-model="form.fill" @change="applyForm">
                  <option v-for="opt in toneOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="prop-field">
                <label class="prop-label">Stroke</label>
                <select v-model="form.stroke" @change="applyForm">
                  <option v-for="opt in toneOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="prop-grid prop-grid-2">
              <div class="prop-field">
                <label class="prop-label">Stroke W</label>
                <input type="number" v-model.number="form.strokeWidth" @input="applyForm" />
              </div>
              <div class="prop-field" v-if="selected.type === 'rect'">
                <label class="prop-label">Corner</label>
                <input type="number" v-model.number="form.cornerRadius" @input="applyForm" />
              </div>
            </div>
          </template>
        </div>
        <div v-else class="prop-empty">Select an element</div>
      </div>
    </div>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="onImagePicked"
    />
    <input
      ref="jsonInput"
      type="file"
      accept="application/json"
      class="hidden-input"
      @change="onJsonPicked"
    />
    <div v-if="showImportConfirm" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-title">Replace current layout?</div>
        <div class="modal-body">Import will replace the current layout. Continue?</div>
        <div class="modal-actions">
          <button class="btn-icon" @click="cancelImport">Cancel</button>
          <button class="btn-icon" @click="confirmImport">Import</button>
        </div>
      </div>
    </div>
    <div v-if="showImportError" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-title">Invalid JSON</div>
        <div class="modal-body">{{ importErrorMessage }}</div>
        <div class="modal-actions">
          <button class="btn-icon" @click="closeImportError">OK</button>
        </div>
      </div>
    </div>
    <div v-if="showResetConfirm" class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-title">Create new label?</div>
        <div class="modal-body">This will discard the current layout. Continue?</div>
        <div class="modal-actions">
          <button class="btn-icon" @click="cancelReset">Cancel</button>
          <button class="btn-icon" @click="confirmReset">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import LabelEditor from "./LabelEditor.vue";
import { PrinterContextKey } from "../printerContext.js";

const context = inject(PrinterContextKey);
if (!context) throw new Error("Printer context is missing");

const { printThreshold, bitmap, labelSize } = context;

const editorRef = ref(null);
const selected = ref(null);
const layerInfo = ref("--");
const imageInput = ref(null);
const jsonInput = ref(null);
const lastDim = ref("width");
const showImportConfirm = ref(false);
const showImportError = ref(false);
const importErrorMessage = ref("");
const pendingImportElements = ref(null);
const pendingImportLabelSize = ref(null);
const showResetConfirm = ref(false);
const imageFilterDefault = ref("threshold");
const zoom = ref(1);

const toneOptions = [
  { value: "#000000", label: "Black" },
  { value: "#ffffff", label: "White" },
  { value: "#f0f0f0", label: "94%" },
  { value: "#e0e0e0", label: "87%" },
  { value: "#c0c0c0", label: "75%" },
  { value: "#a0a0a0", label: "62%" },
  { value: "#808080", label: "50%" },
  { value: "#606060", label: "37%" },
  { value: "#404040", label: "25%" },
  { value: "#2e2e2e", label: "12%" },
  { value: "#1a1a1a", label: "6%" },
];

const imageFilterOptions = [
  { value: "threshold", label: "Threshold" },
  { value: "bayer", label: "Bayer 4x4" },
  { value: "bayer8", label: "Bayer 8x8" },
  { value: "bluenoise", label: "Blue noise 8x8" },
  { value: "halftone", label: "Halftone 4x4" },
  { value: "noise", label: "Noise dither" },
  { value: "floyd", label: "Floyd-Steinberg" },
  { value: "atkinson", label: "Atkinson" },
  { value: "jjn", label: "Jarvis-Judice-Ninke" },
  { value: "stucki", label: "Stucki" },
  { value: "burkes", label: "Burkes" },
  { value: "sierra", label: "Sierra" },
  { value: "sierra2", label: "Sierra 2" },
  { value: "sierraLite", label: "Sierra Lite" },
  { value: "sauvola", label: "Sauvola" },
  { value: "niblack", label: "Niblack" },
  { value: "otsu", label: "Otsu" },
];

const form = reactive({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rotation: 0,
  text: "",
  fontFamily: "sans-serif",
  fontSize: 24,
  bold: false,
  italic: false,
  underline: false,
  noWrap: false,
  clip: false,
  autoFit: false,
  align: "left",
  verticalAlign: "top",
  fill: "#000000",
  bgFill: "transparent",
  stroke: "#000000",
  strokeWidth: 0,
  cornerRadius: 0,
  lockAspect: true,
  imageScale: 100,
  imageFilter: "threshold",
  imageBrightness: 0,
  barcodeType: "CODE128",
  barcodeValue: "123456789012",
});

const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);

const dotsPerMm = 8;
const labelSizes = Array.from({ length: 9 }, (_, idx) => {
  const height = (idx + 2) * 10;
  return { value: `48x${height}`, label: `48x${height}mm`, w: 48, h: height };
});

const selectedSize = computed(() => {
  return labelSizes.find((opt) => opt.value === labelSize.value) || labelSizes[0];
});

const labelWidthPx = computed(() => Math.round(selectedSize.value.w * dotsPerMm));
const labelHeightPx = computed(() => Math.round(selectedSize.value.h * dotsPerMm));

const syncForm = (item) => {
  if (!item) return;
  form.x = Math.round(item.x || 0);
  form.y = Math.round(item.y || 0);
  form.width = Math.round(item.width || 0);
  form.height = Math.round(item.height || 0);
  form.rotation = Math.round(item.rotation || 0);
  form.text = item.text || "";
  form.fontFamily = item.fontFamily || "Roboto, sans-serif";
  form.fontSize = item.fontSize || 24;
  form.bold = !!item.bold;
  form.italic = !!item.italic;
  form.underline = !!item.underline;
  form.noWrap = !!item.noWrap;
  form.clip = !!item.clip;
  form.autoFit = !!item.autoFit;
  form.align = item.align || "left";
  form.verticalAlign = item.verticalAlign || "top";
  form.fill = item.fill || "#000000";
  form.bgFill = item.bgFill || "transparent";
  form.stroke = item.stroke || "#000000";
  form.strokeWidth = item.strokeWidth || 0;
  form.cornerRadius = item.cornerRadius || 0;
  form.lockAspect = item.lockAspect !== false;
  if (item.type === "image") {
    if (item.naturalWidth) {
      form.imageScale = Math.round((item.width / item.naturalWidth) * 100);
    } else {
      form.imageScale = 100;
    }
    form.imageFilter = item.imageFilter || imageFilterDefault.value;
    form.imageBrightness = Number.isFinite(item.imageBrightness) ? item.imageBrightness : 0;
  } else {
    form.imageScale = 100;
  }
  form.barcodeType = item.barcodeType || "CODE128";
  form.barcodeValue = item.barcodeValue || "123456789012";
};

const applyForm = () => {
  if (!selected.value) return;
  const minSize = selected.value.type === "line" ? 0 : 10;
  const minWidth = selected.value.type === "line" ? 1 : 10;
  const updates = {
    x: form.x,
    y: form.y,
    width: Math.max(minWidth, form.width),
    height: Math.max(minSize, form.height),
    rotation: form.rotation,
  };

  if (selected.value.type === "text") {
    Object.assign(updates, {
      text: form.text,
      fontFamily: form.fontFamily,
      fontSize: form.fontSize,
      bold: form.bold,
      italic: form.italic,
      underline: form.underline,
      noWrap: form.noWrap,
      clip: form.clip,
      autoFit: form.autoFit,
      align: form.align,
      verticalAlign: form.verticalAlign,
      fill: form.fill,
      bgFill: form.bgFill,
    });
  } else if (selected.value.type === "image") {
    Object.assign(updates, {
      lockAspect: form.lockAspect,
    });
  } else if (selected.value.type === "barcode") {
    Object.assign(updates, {
      barcodeType: form.barcodeType,
      barcodeValue: form.barcodeValue,
    });
  } else {
    Object.assign(updates, {
      fill: form.fill,
      stroke: form.stroke,
      strokeWidth: form.strokeWidth,
    });
    if (selected.value.type === "rect") {
      updates.cornerRadius = form.cornerRadius;
    }
  }

  if (selected.value.type === "image" && form.lockAspect && selected.value.aspect) {
    if (lastDim.value === "width") {
      updates.height = Math.round(updates.width / selected.value.aspect);
      form.height = updates.height;
    } else {
      updates.width = Math.round(updates.height * selected.value.aspect);
      form.width = updates.width;
    }
  }

  editorRef.value?.updateSelected(updates);
};


const zoomOut = () => {
  zoom.value = Math.max(0.5, Math.round((zoom.value - 0.1) * 10) / 10);
};

const zoomIn = () => {
  zoom.value = Math.min(2, Math.round((zoom.value + 0.1) * 10) / 10);
};

const resetZoom = () => {
  zoom.value = 1;
};

const toggleStyle = (key) => {
  form[key] = !form[key];
  applyForm();
};

const toggleTextOption = (key) => {
  form[key] = !form[key];
  applyForm();
};

const setAlign = (value) => {
  form.align = value;
  applyForm();
};

const setVAlign = (value) => {
  form.verticalAlign = value;
  applyForm();
};

const onScaleInput = () => {
  if (!selected.value || selected.value.type !== "image") return;
  if (!selected.value.naturalWidth || !selected.value.naturalHeight) return;
  const scale = Math.max(10, form.imageScale) / 100;
  const width = Math.round(selected.value.naturalWidth * scale);
  const height = Math.round(selected.value.naturalHeight * scale);
  form.width = width;
  form.height = height;
  editorRef.value?.updateSelected({ width, height });
};

const fitToLabel = (mode) => {
  if (!selected.value || selected.value.type !== "image") return;
  if (!selected.value.naturalWidth || !selected.value.naturalHeight) return;
  const labelW = labelWidthPx.value;
  const labelH = labelHeightPx.value;
  const imgW = selected.value.naturalWidth;
  const imgH = selected.value.naturalHeight;
  let scale = 1;

  if (mode === "contain") {
    scale = Math.min(labelW / imgW, labelH / imgH);
  } else if (mode === "cover") {
    scale = Math.max(labelW / imgW, labelH / imgH);
  } else if (mode === "original") {
    scale = 1;
  }

  form.imageScale = Math.round(scale * 100);
  applyForm();
};

const onWidthInput = () => {
  lastDim.value = "width";
  applyForm();
};

const onHeightInput = () => {
  lastDim.value = "height";
  applyForm();
};

const onSelectionChange = (payload) => {
  if (!payload) {
    selected.value = null;
    layerInfo.value = "--";
    return;
  }
  selected.value = payload.item;
  layerInfo.value = `${payload.index} / ${payload.total}`;
  syncForm(payload.item);
};

watch(selected, (item) => {
  if (item) syncForm(item);
});

const setBitmap = (x) => {
  bitmap.value = x;
};

const addText = () => editorRef.value?.addText();
const addRect = () => editorRef.value?.addRect();
const addEllipse = () => editorRef.value?.addEllipse();
const addLine = () => editorRef.value?.addLine();
const addBarcode = () => editorRef.value?.addBarcode();
const deleteSelected = () => editorRef.value?.deleteSelected();
const duplicateSelected = () => editorRef.value?.duplicateSelected();
const raiseSelected = () => editorRef.value?.raiseSelected();
const lowerSelected = () => editorRef.value?.lowerSelected();
const undo = () => editorRef.value?.undo();
const redo = () => editorRef.value?.redo();

const addImage = () => imageInput.value?.click();
const importJson = () => jsonInput.value?.click();

const exportJson = () => {
  const payload = {
    version: 1,
    labelSize: labelSize.value,
    elements: editorRef.value?.exportLayout() || [],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours(),
  )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  link.download = `label_${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Autosave to the browser (survives refresh) ----------------------------
const STORAGE_KEY = "lxprint.design.v1";
let autosaveTimer = null;
let restored = false;

const persistDesign = () => {
  if (!restored) return; // don't overwrite the saved design before we load it
  try {
    const payload = {
      version: 1,
      labelSize: labelSize.value,
      elements: editorRef.value?.exportLayout() || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Autosave failed", err);
  }
};

const scheduleAutosave = () => {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(persistDesign, 400);
};

watch(labelSize, scheduleAutosave);

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.labelSize) labelSize.value = data.labelSize;
      if (Array.isArray(data?.elements) && data.elements.length) {
        editorRef.value?.importLayout(data.elements);
      }
    }
  } catch (err) {
    console.warn("Failed to restore saved design", err);
  } finally {
    restored = true;
  }
});

const onImagePicked = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const src = reader.result;
    if (typeof src === "string") {
      const filter = imageFilterDefault.value;
      const result = await convertToBw(src, filter, printThreshold.value, 0);
      const bwSrc = result.src;
      const scale = Math.min(
        labelWidthPx.value / result.width,
        labelHeightPx.value / result.height,
      );
      const size = {
        width: Math.max(10, Math.round(result.width * scale)),
        height: Math.max(10, Math.round(result.height * scale)),
      };
      editorRef.value?.addImage({
        src: bwSrc,
        originalSrc: src,
        imageFilter: filter,
        imageBrightness: 0,
        ...size,
      });
    }
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

const onJsonPicked = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ""));
      const payload = Array.isArray(data) ? { elements: data } : data;
      if (!payload.elements) {
        throw new Error("JSON must contain an elements array.");
      }
      pendingImportElements.value = payload.elements;
      pendingImportLabelSize.value = payload.labelSize || null;
      showImportConfirm.value = true;
    } catch (err) {
      console.error("Invalid JSON import", err);
      importErrorMessage.value = "Invalid JSON file. Please check the format and try again.";
      showImportError.value = true;
    }
  };
  reader.readAsText(file);
  event.target.value = "";
};

const confirmImport = () => {
  if (pendingImportLabelSize.value) labelSize.value = pendingImportLabelSize.value;
  if (pendingImportElements.value) editorRef.value?.importLayout(pendingImportElements.value);
  pendingImportElements.value = null;
  pendingImportLabelSize.value = null;
  showImportConfirm.value = false;
};

const cancelImport = () => {
  pendingImportElements.value = null;
  pendingImportLabelSize.value = null;
  showImportConfirm.value = false;
};

const closeImportError = () => {
  showImportError.value = false;
  importErrorMessage.value = "";
};

const requestReset = () => {
  showResetConfirm.value = true;
};

const confirmReset = () => {
  labelSize.value = "48x30";
  editorRef.value?.resetLayout();
  showResetConfirm.value = false;
};

const cancelReset = () => {
  showResetConfirm.value = false;
};

const clampByte = (value) => Math.max(0, Math.min(255, value));

const buildIntegral = (lum, w, h) => {
  const stride = w + 1;
  const size = stride * (h + 1);
  const sum = new Float32Array(size);
  const sumSq = new Float32Array(size);
  for (let y = 1; y <= h; y++) {
    let rowSum = 0;
    let rowSumSq = 0;
    for (let x = 1; x <= w; x++) {
      const v = lum[(y - 1) * w + (x - 1)];
      rowSum += v;
      rowSumSq += v * v;
      const idx = y * stride + x;
      sum[idx] = sum[idx - stride] + rowSum;
      sumSq[idx] = sumSq[idx - stride] + rowSumSq;
    }
  }
  return { sum, sumSq, stride };
};

const getWindowStats = (sum, sumSq, stride, w, h, x, y, radius) => {
  const x0 = Math.max(0, x - radius);
  const y0 = Math.max(0, y - radius);
  const x1 = Math.min(w - 1, x + radius);
  const y1 = Math.min(h - 1, y + radius);
  const idx = (xx, yy) => yy * stride + xx;
  const area = (x1 - x0 + 1) * (y1 - y0 + 1);
  const s =
    sum[idx(x1 + 1, y1 + 1)] -
    sum[idx(x0, y1 + 1)] -
    sum[idx(x1 + 1, y0)] +
    sum[idx(x0, y0)];
  const s2 =
    sumSq[idx(x1 + 1, y1 + 1)] -
    sumSq[idx(x0, y1 + 1)] -
    sumSq[idx(x1 + 1, y0)] +
    sumSq[idx(x0, y0)];
  const mean = s / area;
  const variance = s2 / area - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));
  return { mean, std };
};

const applyThresholdToPixels = (pixels, lum, threshold) => {
  for (let i = 0; i < lum.length; i++) {
    const bw = lum[i] < threshold ? 0 : 255;
    const p = i * 4;
    pixels[p] = bw;
    pixels[p + 1] = bw;
    pixels[p + 2] = bw;
  }
};

const orderedDither = (pixels, lum, w, h, matrix, threshold) => {
  const size = matrix.length;
  const scale = 255 / (size * size);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const t = (matrix[y % size][x % size] + 0.5) * scale;
      const bw = lum[idx] + (t - 128) < threshold ? 0 : 255;
      const p = idx * 4;
      pixels[p] = bw;
      pixels[p + 1] = bw;
      pixels[p + 2] = bw;
    }
  }
};

const errorDiffuse = (pixels, lum, w, h, kernel, threshold) => {
  const buf = new Float32Array(lum);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const oldVal = buf[idx];
      const newVal = oldVal < threshold ? 0 : 255;
      const err = oldVal - newVal;
      buf[idx] = newVal;
      for (const [dx, dy, weight] of kernel.weights) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        buf[ny * w + nx] += (err * weight) / kernel.divisor;
      }
    }
  }
  for (let i = 0; i < buf.length; i++) {
    const bw = buf[i] < 128 ? 0 : 255;
    const p = i * 4;
    pixels[p] = bw;
    pixels[p + 1] = bw;
    pixels[p + 2] = bw;
  }
};

const adaptiveThreshold = (pixels, lum, w, h, threshold, method) => {
  const { sum, sumSq, stride } = buildIntegral(lum, w, h);
  const radius = 7;
  const thrOffset = threshold - 128;
  const R = 128;
  const k = method === "niblack" ? -0.2 : 0.34;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const { mean, std } = getWindowStats(sum, sumSq, stride, w, h, x, y, radius);
      let t = mean;
      if (method === "niblack") {
        t = mean + k * std;
      } else {
        t = mean * (1 + k * (std / R - 1));
      }
      t += thrOffset;
      const bw = lum[idx] < t ? 0 : 255;
      const p = idx * 4;
      pixels[p] = bw;
      pixels[p + 1] = bw;
      pixels[p + 2] = bw;
    }
  }
};

const otsuThreshold = (lum) => {
  const hist = new Uint32Array(256);
  for (let i = 0; i < lum.length; i++) {
    hist[clampByte(Math.round(lum[i]))] += 1;
  }
  const total = lum.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }
  return threshold;
};

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const HALFTONE4 = [
  [12, 5, 6, 13],
  [4, 0, 1, 7],
  [11, 3, 2, 8],
  [15, 10, 9, 14],
];

const BAYER8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

const BLUE_NOISE8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const KERNEL_FLOYD = {
  divisor: 16,
  weights: [
    [1, 0, 7],
    [-1, 1, 3],
    [0, 1, 5],
    [1, 1, 1],
  ],
};

const KERNEL_ATKINSON = {
  divisor: 8,
  weights: [
    [1, 0, 1],
    [2, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [0, 2, 1],
  ],
};

const KERNEL_JJN = {
  divisor: 48,
  weights: [
    [1, 0, 7],
    [2, 0, 5],
    [-2, 1, 3],
    [-1, 1, 5],
    [0, 1, 7],
    [1, 1, 5],
    [2, 1, 3],
    [-2, 2, 1],
    [-1, 2, 3],
    [0, 2, 5],
    [1, 2, 3],
    [2, 2, 1],
  ],
};

const KERNEL_STUCKI = {
  divisor: 42,
  weights: [
    [1, 0, 8],
    [2, 0, 4],
    [-2, 1, 2],
    [-1, 1, 4],
    [0, 1, 8],
    [1, 1, 4],
    [2, 1, 2],
    [-2, 2, 1],
    [-1, 2, 2],
    [0, 2, 4],
    [1, 2, 2],
    [2, 2, 1],
  ],
};

const KERNEL_BURKES = {
  divisor: 32,
  weights: [
    [1, 0, 8],
    [2, 0, 4],
    [-2, 1, 2],
    [-1, 1, 4],
    [0, 1, 8],
    [1, 1, 4],
    [2, 1, 2],
  ],
};

const KERNEL_SIERRA = {
  divisor: 32,
  weights: [
    [1, 0, 5],
    [2, 0, 3],
    [-2, 1, 2],
    [-1, 1, 4],
    [0, 1, 5],
    [1, 1, 4],
    [2, 1, 2],
    [-1, 2, 2],
    [0, 2, 3],
    [1, 2, 2],
  ],
};

const KERNEL_SIERRA2 = {
  divisor: 16,
  weights: [
    [1, 0, 4],
    [2, 0, 3],
    [-2, 1, 1],
    [-1, 1, 2],
    [0, 1, 3],
    [1, 1, 2],
    [2, 1, 1],
  ],
};

const KERNEL_SIERRA_LITE = {
  divisor: 4,
  weights: [
    [1, 0, 2],
    [-1, 1, 1],
    [0, 1, 1],
  ],
};

const convertToBw = (src, filter, threshold, brightness) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 1;
      canvas.height = img.naturalHeight || img.height || 1;
      const sourceWidth = canvas.width;
      const sourceHeight = canvas.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ src, width: sourceWidth, height: sourceHeight });
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const pixels = data.data;
      const lum = new Float32Array(w * h);
      const bright = Number.isFinite(brightness) ? brightness : 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        lum[i / 4] = clampByte(0.2126 * r + 0.7152 * g + 0.0722 * b + bright);
      }

      const thr = clampByte(Number.isFinite(threshold) ? threshold : 128);
      if (filter === "floyd") {
        errorDiffuse(pixels, lum, w, h, KERNEL_FLOYD, thr);
      } else if (filter === "atkinson") {
        errorDiffuse(pixels, lum, w, h, KERNEL_ATKINSON, thr);
      } else if (filter === "jjn") {
        errorDiffuse(pixels, lum, w, h, KERNEL_JJN, thr);
      } else if (filter === "stucki") {
        errorDiffuse(pixels, lum, w, h, KERNEL_STUCKI, thr);
      } else if (filter === "burkes") {
        errorDiffuse(pixels, lum, w, h, KERNEL_BURKES, thr);
      } else if (filter === "sierra") {
        errorDiffuse(pixels, lum, w, h, KERNEL_SIERRA, thr);
      } else if (filter === "sierra2") {
        errorDiffuse(pixels, lum, w, h, KERNEL_SIERRA2, thr);
      } else if (filter === "sierraLite") {
        errorDiffuse(pixels, lum, w, h, KERNEL_SIERRA_LITE, thr);
      } else if (filter === "bayer") {
        orderedDither(pixels, lum, w, h, BAYER4, thr);
      } else if (filter === "bayer8") {
        orderedDither(pixels, lum, w, h, BAYER8, thr);
      } else if (filter === "bluenoise") {
        orderedDither(pixels, lum, w, h, BLUE_NOISE8, thr);
      } else if (filter === "halftone") {
        orderedDither(pixels, lum, w, h, HALFTONE4, thr);
      } else if (filter === "noise") {
        for (let i = 0; i < lum.length; i++) {
          const jitter = (Math.random() * 2 - 1) * 32;
          const bw = lum[i] + jitter < thr ? 0 : 255;
          const p = i * 4;
          pixels[p] = bw;
          pixels[p + 1] = bw;
          pixels[p + 2] = bw;
        }
      } else if (filter === "sauvola") {
        adaptiveThreshold(pixels, lum, w, h, thr, "sauvola");
      } else if (filter === "niblack") {
        adaptiveThreshold(pixels, lum, w, h, thr, "niblack");
      } else if (filter === "otsu") {
        const t = clampByte(otsuThreshold(lum) + (thr - 128));
        applyThresholdToPixels(pixels, lum, t);
      } else {
        applyThresholdToPixels(pixels, lum, thr);
      }
      ctx.putImageData(data, 0, 0);
      resolve({ src: canvas.toDataURL("image/png"), width: sourceWidth, height: sourceHeight });
    };
    img.onerror = () => resolve({ src, width: 1, height: 1 });
    img.src = src;
  });

const onImageFilterChange = async () => {
  if (!selected.value || selected.value.type !== "image") return;
  const item = editorRef.value?.getSelected();
  if (!item) return;
  const filter = form.imageFilter;
  const brightness = Number.isFinite(form.imageBrightness) ? form.imageBrightness : 0;
  const originalSrc = item.originalSrc || item.src;
  const result = await convertToBw(originalSrc, filter, printThreshold.value, brightness);
  const bwSrc = result.src;
  editorRef.value?.updateSelected({
    src: bwSrc,
    originalSrc,
    imageFilter: filter,
    imageBrightness: brightness,
  });
};
</script>
