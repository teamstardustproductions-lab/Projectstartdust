class OrbitalRing {
  constructor() {
    this.ring = document.getElementById('orbital-ring');
    this.cards = document.querySelectorAll('.orbital-card');
    if (!this.ring || this.cards.length === 0) return;

    this.radiusX = 480;
    this.radiusZ = 180;
    this.angleOffset = 0;
    this.speed = 0.002; // Rotation speed
    this.rafId = null;

    this.init();
  }

  init() {
    // Reset ring tilt since we do math-based ellipse
    this.ring.style.transform = 'none';
    
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  animate() {
    this.angleOffset += this.speed;
    const numCards = this.cards.length;

    this.cards.forEach((card, index) => {
      const angle = this.angleOffset + (index / numCards) * Math.PI * 2;
      
      const x = Math.cos(angle) * this.radiusX;
      const z = Math.sin(angle) * this.radiusZ;

      // Blur logic: if z < -50, start blurring up to 8px
      let blur = 0;
      let opacity = 1;
      let scale = 1;

      if (z < -30) {
        // z goes from -30 to -180
        const depthRatio = Math.abs(z + 30) / (this.radiusZ - 30);
        blur = depthRatio * 8; // Max blur 8px
        opacity = 1 - (depthRatio * 0.4); // Fade slightly to 0.6
      }

      // Scale effect: slightly smaller in back, larger in front
      // map z from -180 to 180 -> scale from 0.8 to 1.2
      const zRatio = z / this.radiusZ; // -1 to 1
      scale = 1 + (zRatio * 0.15);

      card.style.transform = `translate3d(${x}px, 0, ${z}px) scale(${scale})`;
      card.style.filter = `blur(${blur}px)`;
      card.style.opacity = opacity;
      
      // Z-index sorting (though preserve-3d usually handles it, manual z-index helps with filters sometimes)
      card.style.zIndex = Math.round(z + 1000);
    });

    this.rafId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

export default OrbitalRing;
