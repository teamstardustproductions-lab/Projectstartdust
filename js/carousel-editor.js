/**
 * CarouselEditor — Live Interactive 3D Control Panel for CircularCarousel
 * Project Stardust
 */

export default class CarouselEditor {
  constructor(carouselInstance, containerSelector = '#paper-reveal') {
    this.carousel = carouselInstance;
    this.container = document.querySelector(containerSelector) || document.body;

    // Initial default state snapshot
    this.defaults = {
      preset: this.carousel.shape || 'cylinder',
      tilt: this.carousel.tiltValue ?? -5,
      tiltY: this.carousel.tiltYValue ?? 0,
      cardTilt: this.carousel.cardTiltValue ?? 0,
      cardRoll: this.carousel.cardRollValue ?? 0,
      gap: this.carousel.options.gap ?? 25,
      spread: this.carousel.spreadValue ?? 1,
      cardWidth: this.carousel.cardW ?? 240,
      perspective: this.carousel.options.perspective ?? 2500,
      cornerRadius: this.carousel.options.cornerRadius ?? 14,
      innerShade: this.carousel.options.innerShade ?? 0.15
    };

    this.current = { ...this.defaults };
    this.isOpen = false;

    this.init();
  }

  init() {
    this.buildDOM();
    this.bindEvents();
  }

  buildDOM() {
    // 1. Floating Toggle Button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'carousel-editor-toggle-btn';
    this.toggleBtn.setAttribute('type', 'button');
    this.toggleBtn.setAttribute('aria-label', 'Toggle Carousel Tilt & Spacing Studio Editor');
    this.toggleBtn.innerHTML = `
      <span class="editor-btn-icon">⚙</span>
      <span class="editor-btn-label">TILT & SPACING LAB</span>
    `;

    // 2. Main Glassmorphic Control Panel
    this.panel = document.createElement('div');
    this.panel.className = 'carousel-editor-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Carousel 3D Studio Tuner');

    this.panel.innerHTML = `
      <div class="editor-header">
        <div class="editor-title-wrap">
          <span class="editor-badge">3D STUDIO</span>
          <h3 class="editor-title">CAROUSEL TUNER</h3>
        </div>
        <button type="button" class="editor-close-btn" aria-label="Close Tuner">✕</button>
      </div>

      <div class="editor-body">
        <!-- Group 1: Axis & Tilt Controls -->
        <div class="editor-section">
          <div class="editor-section-head">
            <span class="editor-section-title">AXES & TILT CONTROL</span>
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-tilt">Carousel Pitch (X Tilt)</label>
              <span class="control-val-badge" id="val-ce-tilt">${this.current.tilt}°</span>
            </div>
            <input type="range" id="ce-tilt" min="-60" max="60" step="1" value="${this.current.tilt}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-tiltY">Carousel Yaw (Y Tilt)</label>
              <span class="control-val-badge" id="val-ce-tiltY">${this.current.tiltY}°</span>
            </div>
            <input type="range" id="ce-tiltY" min="-60" max="60" step="1" value="${this.current.tiltY}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-cardTilt">Card Pitch Tilt</label>
              <span class="control-val-badge" id="val-ce-cardTilt">${this.current.cardTilt}°</span>
            </div>
            <input type="range" id="ce-cardTilt" min="-45" max="45" step="1" value="${this.current.cardTilt}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-cardRoll">Card Roll Angle</label>
              <span class="control-val-badge" id="val-ce-cardRoll">${this.current.cardRoll}°</span>
            </div>
            <input type="range" id="ce-cardRoll" min="-45" max="45" step="1" value="${this.current.cardRoll}">
          </div>
        </div>

        <!-- Group 2: Spacing & Geometry Controls -->
        <div class="editor-section">
          <div class="editor-section-head">
            <span class="editor-section-title">SPACING & DIMENSIONS</span>
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-gap">Card Gap (Spacing)</label>
              <span class="control-val-badge" id="val-ce-gap">${this.current.gap}px</span>
            </div>
            <input type="range" id="ce-gap" min="-50" max="150" step="1" value="${this.current.gap}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-spread">Radial Spread Factor</label>
              <span class="control-val-badge" id="val-ce-spread">${this.current.spread}x</span>
            </div>
            <input type="range" id="ce-spread" min="0.4" max="3.0" step="0.05" value="${this.current.spread}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-cardWidth">Card Width</label>
              <span class="control-val-badge" id="val-ce-cardWidth">${this.current.cardWidth}px</span>
            </div>
            <input type="range" id="ce-cardWidth" min="120" max="450" step="5" value="${this.current.cardWidth}">
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-perspective">3D Perspective Depth</label>
              <span class="control-val-badge" id="val-ce-perspective">${this.current.perspective}px</span>
            </div>
            <input type="range" id="ce-perspective" min="600" max="5000" step="50" value="${this.current.perspective}">
          </div>
        </div>

        <!-- Group 3: Style Presets & Aesthetics -->
        <div class="editor-section">
          <div class="editor-section-head">
            <span class="editor-section-title">STYLE & PRESETS</span>
          </div>

          <div class="editor-control-row">
            <label for="ce-preset">Geometry Preset</label>
            <select id="ce-preset" class="editor-select">
              <option value="cylinder" ${this.current.preset === 'cylinder' ? 'selected' : ''}>Cylinder 3D</option>
              <option value="orbit" ${this.current.preset === 'orbit' ? 'selected' : ''}>Orbit Ring</option>
              <option value="wheel" ${this.current.preset === 'wheel' ? 'selected' : ''}>Vertical Wheel</option>
              <option value="panorama" ${this.current.preset === 'panorama' ? 'selected' : ''}>Panorama Curve</option>
            </select>
          </div>

          <div class="editor-control-row">
            <div class="control-label-wrap">
              <label for="ce-cornerRadius">Corner Radius</label>
              <span class="control-val-badge" id="val-ce-cornerRadius">${this.current.cornerRadius}px</span>
            </div>
            <input type="range" id="ce-cornerRadius" min="0" max="40" step="1" value="${this.current.cornerRadius}">
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="editor-footer">
        <button type="button" class="editor-action-btn editor-reset-btn" id="ce-reset-btn">Reset Defaults</button>
        <button type="button" class="editor-action-btn editor-copy-btn" id="ce-copy-btn">Copy Config JSON</button>
      </div>

      <!-- Toast Notification -->
      <div class="editor-toast" id="ce-toast">Config JSON Copied to Clipboard!</div>
    `;

    this.container.appendChild(this.toggleBtn);
    this.container.appendChild(this.panel);
  }

  bindEvents() {
    // Toggle Button
    this.toggleBtn.addEventListener('click', () => this.togglePanel());

    // Close Button
    const closeBtn = this.panel.querySelector('.editor-close-btn');
    closeBtn.addEventListener('click', () => this.closePanel());

    // Inputs mapping
    const sliderIds = [
      { id: 'ce-tilt', key: 'tilt', unit: '°' },
      { id: 'ce-tiltY', key: 'tiltY', unit: '°' },
      { id: 'ce-cardTilt', key: 'cardTilt', unit: '°' },
      { id: 'ce-cardRoll', key: 'cardRoll', unit: '°' },
      { id: 'ce-gap', key: 'gap', unit: 'px' },
      { id: 'ce-spread', key: 'spread', unit: 'x' },
      { id: 'ce-cardWidth', key: 'cardWidth', unit: 'px' },
      { id: 'ce-perspective', key: 'perspective', unit: 'px' },
      { id: 'ce-cornerRadius', key: 'cornerRadius', unit: 'px' }
    ];

    sliderIds.forEach(({ id, key, unit }) => {
      const input = this.panel.querySelector(`#${id}`);
      const badge = this.panel.querySelector(`#val-${id}`);
      if (!input) return;

      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.current[key] = val;
        if (badge) badge.textContent = `${val}${unit}`;
        
        // Update carousel live
        this.carousel.updateOptions({ [key]: val });
      });
    });

    // Preset select
    const presetSelect = this.panel.querySelector('#ce-preset');
    presetSelect.addEventListener('change', (e) => {
      const preset = e.target.value;
      this.current.preset = preset;
      this.carousel.updateOptions({ preset });
    });

    // Reset Button
    const resetBtn = this.panel.querySelector('#ce-reset-btn');
    resetBtn.addEventListener('click', () => this.resetDefaults());

    // Copy Button
    const copyBtn = this.panel.querySelector('#ce-copy-btn');
    copyBtn.addEventListener('click', () => this.copyConfig());
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.isOpen = true;
    this.panel.classList.add('active');
    this.toggleBtn.classList.add('active');
  }

  closePanel() {
    this.isOpen = false;
    this.panel.classList.remove('active');
    this.toggleBtn.classList.remove('active');
  }

  resetDefaults() {
    this.current = { ...this.defaults };

    // Update form elements
    Object.keys(this.current).forEach(key => {
      const input = this.panel.querySelector(`#ce-${key}`);
      const badge = this.panel.querySelector(`#val-ce-${key}`);
      if (input) {
        input.value = this.current[key];
        if (badge) {
          const unit = key.includes('Width') || key.includes('gap') || key.includes('perspective') || key.includes('Radius') ? 'px' : (key.includes('spread') ? 'x' : '°');
          badge.textContent = `${this.current[key]}${unit}`;
        }
      }
    });

    // Apply to carousel
    this.carousel.updateOptions(this.current);
    this.showToast('Reset to Initial Defaults');
  }

  copyConfig() {
    const configStr = JSON.stringify(this.current, null, 2);
    navigator.clipboard.writeText(configStr).then(() => {
      this.showToast('Copied Config JSON to Clipboard! 📋');
    }).catch(() => {
      this.showToast('Config: ' + JSON.stringify(this.current));
    });
  }

  showToast(msg) {
    const toast = this.panel.querySelector('#ce-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}
