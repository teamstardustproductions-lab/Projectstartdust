/**
 * PRELOADER / PAGE ENTRY
 * Project Stardust — Loader Animation
 *
 * Sequence:
 * 1. Letters animate in one by one
 * 2. Gold line sweeps across
 * 3. Counter counts to 100
 * 4. Clip-path swipe exits loader
 * 5. Hero content begins animating
 */

class Loader {
  constructor() {
    this.el = document.querySelector('.preloader');
    this.letters = document.querySelectorAll('.preloader__letter');
    this.counter = document.querySelector('.preloader__counter');
    this.stars = document.querySelector('.preloader__stars');
    this.duration = 2800; // total loader time in ms
    this.hasRun = sessionStorage.getItem('loaderHasRun');

    if (!this.el) return;
    this.init();
  }

  init() {
    // Skip on repeat visits within same session
    if (this.hasRun) {
      this.skipLoader();
      return;
    }

    this.createStars();
    this.animateLetters();
    this.animateCounter();
    this.scheduleExit();
  }

  createStars() {
    if (!this.stars) return;
    const count = 40;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('preloader__star');
      const size = Math.random() * 2.5 + 1;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --dur: ${(Math.random() * 3 + 1.5).toFixed(1)}s;
        --delay: ${(Math.random() * 2).toFixed(1)}s;
        opacity: 0;
        animation: starTwinkle var(--dur) ease-in-out var(--delay) infinite;
      `;
      this.stars.appendChild(star);

      // Fade stars in after a short delay
      setTimeout(() => {
        star.style.transition = 'opacity 0.5s ease';
        star.style.opacity = '0.6';
      }, i * 30 + 400);
    }
  }

  animateLetters() {
    this.letters.forEach((letter, i) => {
      letter.style.animationDelay = `${i * 60 + 200}ms`;
    });
  }

  animateCounter() {
    if (!this.counter) return;
    let count = 0;
    const target = 100;
    const step = target / (this.duration * 0.9 / 16); // ~60fps

    const tick = () => {
      count = Math.min(count + step, target);
      this.counter.textContent = `${Math.floor(count).toString().padStart(3, '0')} / 100`;
      if (count < target) requestAnimationFrame(tick);
    };

    setTimeout(() => requestAnimationFrame(tick), 300);
  }

  scheduleExit() {
    setTimeout(() => {
      this.exit();
    }, this.duration);
  }

  exit() {
    if (!this.el) return;
    this.el.classList.add('exit');
    sessionStorage.setItem('loaderHasRun', 'true');

    // After exit animation completes, reveal body content
    setTimeout(() => {
      this.el.style.display = 'none';
      document.dispatchEvent(new CustomEvent('loaderComplete'));
    }, 1200); // matches CSS transition duration
  }

  skipLoader() {
    if (!this.el) return;
    this.el.style.display = 'none';
    document.dispatchEvent(new CustomEvent('loaderComplete'));
  }
}

export default Loader;
