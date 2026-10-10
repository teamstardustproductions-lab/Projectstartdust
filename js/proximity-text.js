/**
 * VARIABLE PROXIMITY TEXT ANIMATION
 * Project Stardust — Interactive Mouse Proximity Engine
 * Triggers font variation, scale, vertical lift, and color shift exclusively when hovering over the Selected Portfolio container.
 */

export default class ProximityText {
  constructor(options = {}) {
    this.selector = options.selector || '.portfolio-title';
    this.containerSelector = options.containerSelector || '.cinematic-widescreen-frame';
    this.radius = options.radius || 240; // Influence radius in px
    this.minWeight = options.minWeight || 400;
    this.maxWeight = options.maxWeight || 900;
    this.maxScale = options.maxScale || 1.28;
    this.maxLift = options.maxLift || -10; // px vertical translation
    this.lerpAmount = options.lerpAmount || 0.16;

    this.mouse = { x: -9999, y: -9999 };
    this.isHovered = false;
    this.chars = [];
    this.animFrame = null;

    this.init();
  }

  init() {
    const titles = document.querySelectorAll(this.selector);
    if (!titles.length) return;

    titles.forEach(title => this.splitTitle(title));
    if (!this.chars.length) return;

    this.bindEvents();
    this.animate();
  }

  splitTitle(titleEl) {
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim() && text.includes(' ')) {
          return document.createTextNode(' ');
        }
        const frag = document.createDocumentFragment();
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === ' ' || char === '\n') {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.className = 'prox-char';
            span.textContent = char;
            span.dataset.char = char;
            frag.appendChild(span);
          }
        }
        return frag;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        const children = Array.from(node.childNodes);
        children.forEach(child => {
          const processed = processNode(child);
          if (processed) clone.appendChild(processed);
        });
        return clone;
      }
      return null;
    };

    const children = Array.from(titleEl.childNodes);
    titleEl.innerHTML = '';
    children.forEach(child => {
      const processed = processNode(child);
      if (processed) titleEl.appendChild(processed);
    });

    const charSpans = titleEl.querySelectorAll('.prox-char');
    charSpans.forEach((span, index) => {
      const isNoir = span.closest('.font-noir') !== null;
      this.chars.push({
        el: span,
        isNoir,
        index,
        currentWeight: isNoir ? 400 : this.minWeight,
        targetWeight: isNoir ? 400 : this.minWeight,
        currentScale: 1,
        targetScale: 1,
        currentY: 0,
        targetY: 0,
        currentGold: 0,
        targetGold: 0
      });
    });
  }

  bindEvents() {
    const containers = document.querySelectorAll(this.containerSelector);
    const targetContainers = containers.length ? containers : document.querySelectorAll(this.selector);

    targetContainers.forEach(container => {
      container.addEventListener('mouseenter', (e) => {
        this.isHovered = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      container.addEventListener('mousemove', (e) => {
        this.isHovered = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, { passive: true });

      container.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });
    });
  }

  animate() {
    this.chars.forEach((item) => {
      let proximity = 0;

      if (this.isHovered) {
        const rect = item.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = this.mouse.x - cx;
        const dy = this.mouse.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.radius) {
          const normDist = 1 - dist / this.radius;
          // Smooth power falloff curve
          proximity = Math.sin(normDist * (Math.PI / 2));
        }
      }

      // Calculate Targets
      if (!item.isNoir) {
        item.targetWeight = this.minWeight + (this.maxWeight - this.minWeight) * proximity;
        item.targetScale = 1 + (this.maxScale - 1) * proximity;
      } else {
        item.targetScale = 1 + (this.maxScale - 1) * 1.12 * proximity;
      }

      item.targetY = this.maxLift * proximity;
      item.targetGold = proximity;

      // Lerp for physics spring motion
      item.currentWeight += (item.targetWeight - item.currentWeight) * this.lerpAmount;
      item.currentScale += (item.targetScale - item.currentScale) * this.lerpAmount;
      item.currentY += (item.targetY - item.currentY) * this.lerpAmount;
      item.currentGold += (item.targetGold - item.currentGold) * this.lerpAmount;

      // Inline Styles
      const weightStyle = !item.isNoir 
        ? `font-weight: ${Math.round(item.currentWeight)}; font-variation-settings: 'wght' ${Math.round(item.currentWeight)};` 
        : '';
      const transformStyle = `transform: translate3d(0, ${item.currentY.toFixed(2)}px, 0) scale(${item.currentScale.toFixed(3)});`;
      
      // Color shift: Black #08080C -> Champagne Gold #D4AF37 on proximity peak
      let colorStyle = '';
      if (item.currentGold > 0.04) {
        const r = Math.round(8 + (212 - 8) * item.currentGold);
        const g = Math.round(8 + (175 - 8) * item.currentGold);
        const b = Math.round(12 + (55 - 12) * item.currentGold);
        colorStyle = `color: rgb(${r}, ${g}, ${b}); text-shadow: 0 4px 20px rgba(${r}, ${g}, ${b}, ${(0.35 * item.currentGold).toFixed(2)});`;
      }

      item.el.style.cssText = `${weightStyle} ${transformStyle} ${colorStyle}`;
    });

    this.animFrame = requestAnimationFrame(() => this.animate());
  }
}
