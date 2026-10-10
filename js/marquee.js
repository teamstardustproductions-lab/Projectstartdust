/**
 * MARQUEE
 * Project Stardust — CSS-based infinite scroll marquee
 * Inspired by Osmo Supply marquee implementation
 */

class Marquee {
  constructor() {
    this.tracks = document.querySelectorAll('.marquee-track');
    if (!this.tracks.length) return;
    this.init();
  }

  init() {
    // Clone items for seamless loop — CSS animation handles the rest
    // This is for JS-driven marquees (if used)
    this.tracks.forEach(track => {
      if (track.dataset.jsMarquee) {
        this.initJsMarquee(track);
      }
    });
  }

  initJsMarquee(track) {
    // Clone items for JS-driven track
    const items = Array.from(track.children);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }
}

export default Marquee;
