/**
 * CUSTOM CURSOR
 * Project Stardust — Magnetic Cursor
 *
 * Features:
 * - Dot cursor that exactly follows mouse
 * - Follower ring that lags behind (spring physics simulation)
 * - Expands on hoverable elements
 * - Hides when mouse leaves window
 */

class Cursor {
  constructor() {
    this.dot = document.querySelector('.cursor');
    this.follower = document.querySelector('.cursor-follower');

    // Follower position (with lag)
    this.followerX = 0;
    this.followerY = 0;

    // Current mouse position
    this.mouseX = 0;
    this.mouseY = 0;

    // Speed of follower (0–1, lower = more lag)
    this.speed = 0.12;

    this.isVisible = false;
    this.rafId = null;

    if (!this.dot || !this.follower) return;

    // Only show on pointer devices
    if (window.matchMedia('(hover: none)').matches) return;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Move dot immediately
      this.dot.style.left = `${e.clientX}px`;
      this.dot.style.top  = `${e.clientY}px`;

      if (!this.isVisible) {
        this.isVisible = true;
        this.followerX = e.clientX;
        this.followerY = e.clientY;
        this.dot.style.opacity = '1';
        this.follower.style.opacity = '1';
      }
    });

    // Hide on mouse leave
    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity = '0';
      this.follower.style.opacity = '0';
      this.isVisible = false;
    });

    // Hover states on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, [data-cursor-hover], .project-card, .tabs__tab, .filter-btn, .play-btn, .reel-wrap'
    );

    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('is-hovering');
        this.follower.classList.add('is-hovering');
      });

      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('is-hovering');
        this.follower.classList.remove('is-hovering');
      });
    });

    // Link-specific hover
    const links = document.querySelectorAll('a, .play-btn, .reel-wrap');
    links.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.follower.classList.add('is-link');
      });

      el.addEventListener('mouseleave', () => {
        this.follower.classList.remove('is-link');
      });
    });
  }

  loop() {
    // Spring physics: lerp follower toward mouse
    this.followerX += (this.mouseX - this.followerX) * this.speed;
    this.followerY += (this.mouseY - this.followerY) * this.speed;

    this.follower.style.left = `${this.followerX}px`;
    this.follower.style.top  = `${this.followerY}px`;

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

export default Cursor;
