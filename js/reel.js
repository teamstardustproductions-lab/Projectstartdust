/**
 * SHOWREEL / VIDEO MODAL
 * Project Stardust — Video Modal Handler
 */

class Reel {
  constructor() {
    this.modal = document.querySelector('.video-modal');
    this.triggers = document.querySelectorAll('[data-reel-trigger]');
    this.closeBtn = document.querySelector('.video-modal__close');
    this.iframe = document.querySelector('.video-modal__iframe');
    this.videoSrc = '';

    if (!this.modal) return;
    this.init();
  }

  init() {
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const src = trigger.dataset.reelTrigger || trigger.getAttribute('href');
        this.open(src);
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(src) {
    this.videoSrc = src;
    if (this.iframe) {
      // For YouTube: add autoplay
      const embedUrl = this.formatUrl(src);
      this.iframe.src = embedUrl;
    }
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
    // Stop video by clearing src
    setTimeout(() => {
      if (this.iframe) this.iframe.src = '';
    }, 400);
  }

  formatUrl(url) {
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  }
}

export default Reel;
