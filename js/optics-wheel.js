export default class OpticsWheel {
  constructor() {
    this.container = document.getElementById('optics-wheel-wrapper');
    this.track = document.getElementById('optics-wheel-track');
    this.items = Array.from(document.querySelectorAll('.wheel-item'));
    this.prevBtn = document.getElementById('optics-prev-btn');
    this.nextBtn = document.getElementById('optics-next-btn');
    
    if (!this.container || !this.items.length) return;

    this.numItems = this.items.length;
    this.activeIndex = -1;
    this.targetIndex = 0;
    this.currentIndex = 0;
    this.isDragging = false;
    this.stepAngle = 34; // Degree tilt separation between items on the arc
    this.itemSpacing = 160; // Vertical spacing between cards in px

    this.init();
  }

  init() {
    // Navigation arrow buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.step(-1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.step(1);
      });
    }

    // Direct click on any wheel item
    this.items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        if (!this.isDragging) {
          this.setTargetIndex(index);
        }
      });
    });

    // Touch & Mouse Drag on Wheel Container
    this.setupDrag();

    // Mouse Wheel Spin Support
    this.container.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > 10) {
        const dir = e.deltaY > 0 ? 1 : -1;
        this.targetIndex = Math.max(0, Math.min(this.numItems - 1, this.targetIndex + dir * 0.4));
      }
    }, { passive: true });

    // Initial render
    this.updateWheel(1.0);
  }

  step(direction) {
    const nextIdx = Math.max(0, Math.min(this.numItems - 1, Math.round(this.targetIndex) + direction));
    this.setTargetIndex(nextIdx);
  }

  setTargetIndex(idx) {
    this.targetIndex = Math.max(0, Math.min(this.numItems - 1, idx));
  }

  setupDrag() {
    let startY = 0;
    let initialIndex = 0;
    let dragMoved = false;

    const onPointerDown = (e) => {
      this.isDragging = true;
      dragMoved = false;
      startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      initialIndex = this.targetIndex;
      this.container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaY = currentY - startY;
      if (Math.abs(deltaY) > 4) dragMoved = true;
      const indexDelta = -deltaY / 130;
      this.targetIndex = Math.max(0, Math.min(this.numItems - 1, initialIndex + indexDelta));
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container.style.cursor = 'grab';
      if (dragMoved) {
        this.targetIndex = Math.round(this.targetIndex);
      }
    };

    this.container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  updateProgress(progress) {
    if (typeof progress === 'number' && !this.isDragging) {
      const pClamped = Math.max(0, Math.min(1, progress));
      this.targetIndex = pClamped * (this.numItems - 1);
    }
  }

  /**
   * Frame animation render loop
   */
  updateWheel(deltaLerp = 0.12) {
    this.currentIndex += (this.targetIndex - this.currentIndex) * deltaLerp;
    const currentRounded = Math.max(0, Math.min(this.numItems - 1, Math.round(this.currentIndex)));

    this.items.forEach((item, index) => {
      const diff = index - this.currentIndex;
      const absDiff = Math.abs(diff);

      const angle = diff * this.stepAngle;
      const rad = (angle * Math.PI) / 180;
      
      const x = -(absDiff * absDiff * 42) - Math.sin(rad) * 35; 
      const y = diff * this.itemSpacing;

      const scale = Math.max(0.65, 1 - absDiff * 0.16);
      const opacity = Math.max(0, 1 - absDiff * 0.45);
      const rotateZ = -angle * 0.55;

      item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotateZ.toFixed(2)}deg)`;
      item.style.opacity = opacity.toFixed(3);
      item.style.zIndex = Math.round(100 - absDiff * 20);

      if (absDiff < 0.45) {
        item.classList.add('is-active');
        item.style.pointerEvents = 'auto';
      } else {
        item.classList.remove('is-active');
        item.style.pointerEvents = absDiff < 1.8 ? 'auto' : 'none';
      }
    });

    this.activeIndex = currentRounded;
  }
}
