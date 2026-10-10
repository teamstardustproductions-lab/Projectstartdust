/**
 * NAVIGATION — High-Fashion Editorial Motion Overlay System
 * Project Stardust
 */

class Nav {
  constructor() {
    this.hamburger = document.querySelector('#nav-hamburger');
    this.overlay = document.querySelector('#stardust-nav-overlay');
    this.closeIcon = document.querySelector('#nav-overlay-close-icon');
    this.cancelBtn = document.querySelector('#nav-overlay-cancel-btn');
    this.blendCircle = document.querySelector('#nav-blend-circle');
    this.menuItems = document.querySelectorAll('.editorial-menu-item');
    this.topbarElements = document.querySelectorAll('.nav-editorial-topbar > *');
    this.isOpen = false;
    this.animating = false;

    this.init();
  }

  init() {
    if (!this.hamburger || !this.overlay) return;

    // Ensure menu is cleanly closed on load without flash
    this.closeMenuImmediate();

    this.hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    const closeElements = [this.closeIcon, this.cancelBtn].filter(Boolean);
    closeElements.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Close overlay when clicking menu links
    const links = this.overlay.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Mouse tracking for difference-blend spotlight circle
    if (this.blendCircle) {
      if (typeof gsap !== 'undefined') {
        gsap.set(this.blendCircle, { xPercent: -50, yPercent: -50 });
      }

      this.overlay.addEventListener('mousemove', (e) => {
        const rect = this.overlay.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (typeof gsap !== 'undefined') {
          gsap.to(this.blendCircle, {
            x: x,
            y: y,
            duration: 0.18,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          this.blendCircle.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1)`;
        }
      });

      // Expand circle on hovering editorial menu links
      this.menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
          if (typeof gsap !== 'undefined') {
            gsap.to(this.blendCircle, { scale: 1.65, duration: 0.3, ease: 'power2.out' });
          }
        });
        item.addEventListener('mouseleave', () => {
          if (typeof gsap !== 'undefined') {
            gsap.to(this.blendCircle, { scale: 1.0, duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    }
  }

  toggleMenu() {
    if (this.animating) return;
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.animating = true;
    document.body.classList.add('is-menu-open');

    if (this.overlay) {
      this.overlay.classList.add('active');
    }
    if (this.hamburger) {
      this.hamburger.classList.add('active');
      this.hamburger.setAttribute('aria-expanded', 'true');
    }

    // GSAP Kinetic Entrance Motion
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          this.animating = false;
        }
      });

      // Reset initial states
      gsap.set(this.overlay, { opacity: 0, display: 'flex', visibility: 'visible', pointerEvents: 'auto' });
      if (this.topbarElements.length) gsap.set(this.topbarElements, { opacity: 0, y: -20 });
      if (this.menuItems.length) gsap.set(this.menuItems, { opacity: 0, y: 60, rotationX: -12 });
      if (this.blendCircle) gsap.set(this.blendCircle, { opacity: 0, scale: 0.4, xPercent: -50, yPercent: -50 });

      // Animate overlay backdrop
      tl.to(this.overlay, {
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out'
      });

      // Animate topbar items
      if (this.topbarElements.length) {
        tl.to(this.topbarElements, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out'
        }, '-=0.25');
      }

      // Animate monumental typographic items stagger
      if (this.menuItems.length) {
        tl.to(this.menuItems, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.75,
          stagger: 0.09,
          ease: 'power4.out',
          clearProps: 'transform,rotationX'
        }, '-=0.35');
      }

      // Animate blend spotlight circle
      if (this.blendCircle) {
        tl.to(this.blendCircle, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.4)'
        }, '-=0.5');
      }
    } else {
      this.animating = false;
    }
  }

  closeMenu() {
    if (!this.isOpen) return;
    this.animating = true;
    this.isOpen = false;
    document.body.classList.remove('is-menu-open');

    if (this.hamburger) {
      this.hamburger.classList.remove('active');
      this.hamburger.setAttribute('aria-expanded', 'false');
    }

    // GSAP Kinetic Exit Motion
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          this.closeMenuImmediate();
          this.animating = false;
        }
      });

      if (this.menuItems.length) {
        tl.to(this.menuItems, {
          opacity: 0,
          y: -40,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power3.in'
        });
      }

      if (this.topbarElements.length) {
        tl.to(this.topbarElements, {
          opacity: 0,
          y: -15,
          duration: 0.3,
          ease: 'power3.in'
        }, '-=0.2');
      }

      if (this.blendCircle) {
        tl.to(this.blendCircle, {
          opacity: 0,
          scale: 0.3,
          duration: 0.25,
          ease: 'power2.in'
        }, '-=0.25');
      }

      tl.to(this.overlay, {
        opacity: 0,
        duration: 0.35,
        ease: 'power3.inOut'
      }, '-=0.2');
    } else {
      this.closeMenuImmediate();
      this.animating = false;
    }
  }

  closeMenuImmediate() {
    this.isOpen = false;
    document.body.classList.remove('is-menu-open');
    if (this.overlay) {
      this.overlay.classList.remove('active');
      if (typeof gsap !== 'undefined') {
        gsap.set(this.overlay, { opacity: 0, display: 'none', visibility: 'hidden', pointerEvents: 'none' });
      }
    }
    if (this.hamburger) {
      this.hamburger.classList.remove('active');
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
  }
}

export default Nav;

