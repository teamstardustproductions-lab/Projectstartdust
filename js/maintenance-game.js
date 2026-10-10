/**
 * GAMIFIED MAINTENANCE EXPERIENCE
 * Project Stardust — Interactive Stardust Energy Particle Collector
 */

export class MaintenanceGame {
  constructor() {
    this.canvas = document.getElementById('maintenance-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById('game-score');
    this.progressFill = document.getElementById('game-progress-fill');
    this.statusText = document.getElementById('game-status-text');
    this.rewardModal = document.getElementById('game-reward-modal');
    this.guideText = document.getElementById('game-guide-text');
    this.restartBtn = document.getElementById('game-restart-btn');

    this.btnBurst = document.getElementById('btn-burst');
    this.btnGravity = document.getElementById('btn-gravity');
    this.btnReset = document.getElementById('btn-reset-orbs');

    this.score = 0;
    this.targetScore = 100;
    this.isZeroGravity = false;
    this.particles = [];
    this.burstEffects = [];

    this.mouse = {
      x: -1000,
      y: -1000,
      active: false
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupEvents();
    this.spawnOrbs(35);
    this.animate();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight || 480;
  }

  setupEvents() {
    const stage = this.canvas.parentElement;

    stage.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
      if (this.guideText) this.guideText.style.opacity = '0.3';
    });

    stage.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      if (this.guideText) this.guideText.style.opacity = '1';
    });

    // Touch Support
    stage.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.mouse.active = true;
      }
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      this.mouse.active = false;
    });

    // Control Buttons
    if (this.btnBurst) {
      this.btnBurst.addEventListener('click', () => this.triggerBurst());
    }

    if (this.btnGravity) {
      this.btnGravity.addEventListener('click', () => this.toggleGravity());
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.spawnOrbs(35));
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.resetGame());
    }
  }

  spawnOrbs(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createOrb());
    }
  }

  createOrb() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      radius: Math.random() * 5 + 4,
      color: Math.random() > 0.3 ? '#FFFFFF' : '#D4AF37',
      glow: Math.random() * 15 + 8,
      pulse: Math.random() * Math.PI * 2
    };
  }

  triggerBurst() {
    const centerX = this.mouse.active ? this.mouse.x : this.canvas.width / 2;
    const centerY = this.mouse.active ? this.mouse.y : this.canvas.height / 2;

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 3,
        color: '#FFFFFF',
        glow: 12,
        pulse: 0
      });
    }

    if (this.statusText) {
      this.statusText.textContent = 'SUPERNOVA BURST!';
      setTimeout(() => {
        this.statusText.textContent = this.isZeroGravity ? 'ZERO GRAVITY' : 'MAGNET ACTIVE';
      }, 1500);
    }
  }

  toggleGravity() {
    this.isZeroGravity = !this.isZeroGravity;
    this.particles.forEach(p => {
      p.vy *= -1.5;
      p.vx *= 1.2;
    });

    if (this.statusText) {
      this.statusText.textContent = this.isZeroGravity ? 'ZERO GRAVITY' : 'MAGNET ACTIVE';
    }
  }

  addScore() {
    if (this.score >= this.targetScore) return;
    this.score++;

    if (this.scoreEl) {
      this.scoreEl.textContent = `${this.score} / ${this.targetScore}`;
    }

    if (this.progressFill) {
      const pct = (this.score / this.targetScore) * 100;
      this.progressFill.style.width = `${pct}%`;
    }

    if (this.score >= this.targetScore) {
      this.unlockReward();
    }
  }

  unlockReward() {
    if (this.rewardModal) {
      this.rewardModal.setAttribute('aria-hidden', 'false');
      this.rewardModal.classList.add('is-active');
    }
    if (this.statusText) {
      this.statusText.textContent = '100% UNLOCKED';
    }
  }

  resetGame() {
    this.score = 0;
    if (this.scoreEl) this.scoreEl.textContent = `0 / ${this.targetScore}`;
    if (this.progressFill) this.progressFill.style.width = '0%';
    if (this.rewardModal) {
      this.rewardModal.setAttribute('aria-hidden', 'true');
      this.rewardModal.classList.remove('is-active');
    }
    if (this.statusText) this.statusText.textContent = 'MAGNET ACTIVE';
    this.spawnOrbs(35);
  }

  createBurstSpark(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.burstEffects.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        radius: Math.random() * 3 + 1,
        color: '#FFFFFF'
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = '#020204';
    this.ctx.fillRect(0, 0, w, h);

    // Draw background grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Draw Attractor Cursor Ring
    if (this.mouse.active) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 24, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update and Draw Orbs
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Gravity / Float Logic
      if (this.isZeroGravity) {
        p.vy -= 0.03;
      }

      // Magnetic Attraction
      if (this.mouse.active) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx += (dx / dist) * force * 0.85;
          p.vy += (dy / dist) * force * 0.85;

          // Draw attraction ray
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${force * 0.25})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }

        // Absorption Collision
        if (dist < 22) {
          this.createBurstSpark(p.x, p.y);
          this.addScore();
          this.particles[i] = this.createOrb();
          continue;
        }
      }

      // Apply Velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Bounce Off Boundaries
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Render Orb Glow & Core
      p.pulse += 0.04;
      const currentRadius = p.radius + Math.sin(p.pulse) * 1.2;

      this.ctx.save();
      this.ctx.shadowBlur = p.glow;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(1, currentRadius), 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render Sparks
    for (let i = this.burstEffects.length - 1; i >= 0; i--) {
      const s = this.burstEffects[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.04;

      if (s.alpha <= 0) {
        this.burstEffects.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = s.alpha;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}
