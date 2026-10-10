/**
 * SCROLL ANIMATIONS
 * Project Stardust — Intersection Observer-based scroll reveals
 *
 * Features:
 * - Watches .reveal, .reveal-right, .reveal-left, .reveal-scale elements
 * - Adds .revealed class when element enters viewport
 * - Number counter animation for stat elements
 * - Hero content reveal on loader complete
 */

class ScrollAnimations {
  constructor() {
    this.threshold = 0.15; // how much of element must be visible
    this.rootMargin = '0px 0px -60px 0px';

    this.init();
  }

  init() {
    this.initLenis();
    this.initRevealObserver();
    this.initCounterObserver();
    this.initHeroReveal();
    this.initSection3PinSpacer();
    this.initSection4TitlePinAnimation();
    this.initSection5ProcessPinAnimation();
  }

  /* ─── Section 5 Pinned Scroll Step-By-Step Animation (Monochrome PinSpacer) ─── */
  initSection5ProcessPinAnimation() {
    const section = document.querySelector('#process');
    if (!section) return;

    const cards = section.querySelectorAll('.process-stage-card');
    const navItems = section.querySelectorAll('.process-nav-item');
    const progressBar = section.querySelector('#process-progress-bar');
    const counter = section.querySelector('#process-step-counter');

    if (!cards.length) return;

    const setupSec5PinAnim = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      const totalSteps = cards.length;

      const updateActiveStep = (index) => {
        cards.forEach((card, i) => {
          if (i === index) {
            card.classList.add('is-active');
          } else {
            card.classList.remove('is-active');
          }
        });

        navItems.forEach((item, i) => {
          if (i === index) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });

        if (progressBar) {
          const stepPercent = 100 / totalSteps;
          progressBar.style.width = `${stepPercent}%`;
          progressBar.style.left = `${index * stepPercent}%`;
        }

        if (counter) {
          counter.textContent = `STEP 0${index + 1} / 05`;
        }
      };

      // Create GSAP ScrollTrigger Timeline with Pin Spacer
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: '+=220%',
          scrub: 0.8,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const stepIndex = Math.min(
              totalSteps - 1,
              Math.floor(progress * totalSteps)
            );
            updateActiveStep(stepIndex);
          }
        }
      });

      // Enable click navigation on progress pills
      navItems.forEach((navBtn, i) => {
        navBtn.addEventListener('click', () => {
          updateActiveStep(i);
        });
      });
    };

    if (document.readyState === 'complete') {
      setTimeout(setupSec5PinAnim, 650);
    } else {
      window.addEventListener('load', () => setTimeout(setupSec5PinAnim, 650));
    }
  }

  /* ─── Section 4 Title Blur-In, Split Slide Up & Pin Spacer Animation ─── */
  initSection4TitlePinAnimation() {
    const section = document.querySelector('#services');
    if (!section) return;

    const topbar = section.querySelector('.persona-topbar');
    const asterisk = section.querySelector('.persona-asterisk');
    const row1 = section.querySelector('.poster-row-1');
    const row2 = section.querySelector('.poster-row-2');
    const row3 = section.querySelector('.poster-row-3');
    const cardsWrapper = section.querySelector('#persona-cards-wrapper');

    const setupSec4Anim = () => {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      // 1. Initial State: blurred, transparent, shifted down
      if (topbar) gsap.set(topbar, { opacity: 0, y: 30, filter: 'blur(10px)' });
      if (asterisk) gsap.set(asterisk, { opacity: 0, scale: 0.5, filter: 'blur(12px)' });
      if (row1) gsap.set(row1, { opacity: 0, y: 80, filter: 'blur(20px)' });
      if (row2) gsap.set(row2, { opacity: 0, y: 110, filter: 'blur(24px)' });
      if (row3) gsap.set(row3, { opacity: 0, y: 140, filter: 'blur(28px)' });
      if (cardsWrapper) gsap.set(cardsWrapper, { opacity: 0, y: 75, filter: 'blur(18px)' });

      // 2. Create GSAP ScrollTrigger Timeline with Pin Spacer
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: '+=150%',
          scrub: 1.2,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true
        }
      });

      // Step A: Topbar & Asterisk unblur & fade in
      if (topbar) {
        tl.to(topbar, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.35 }, 0);
      }
      if (asterisk) {
        tl.to(asterisk, { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.35 }, 0);
      }

      // Step B: Row 1 ("Systems that"): split slide up & unblur
      if (row1) {
        tl.to(row1, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.55 }, 0.05);
      }

      // Step C: Row 2 ("connect" + Note 1): staggered split slide up & unblur
      if (row2) {
        tl.to(row2, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.55 }, 0.22);
      }

      // Step D: Row 3 (Note 2 + "people"): staggered split slide up & unblur
      if (row3) {
        tl.to(row3, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.55 }, 0.38);
      }

      // Step E: Revealed Cards & Metrics Pop Up smoothly after poster title settles
      if (cardsWrapper) {
        tl.to(cardsWrapper, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          duration: 0.6,
          onStart: () => cardsWrapper.classList.add('is-visible')
        }, 0.58);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(setupSec4Anim, 600);
    } else {
      window.addEventListener('load', () => setTimeout(setupSec4Anim, 600));
    }
  }

  /* ─── Lenis Smooth Scroll Engine ─── */
  initLenis() {
    if (typeof Lenis === 'undefined') return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      this.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  /* ─── Reveal Observer ─── */
  initRevealObserver() {
    const options = {
      threshold: this.threshold,
      rootMargin: this.rootMargin,
    };

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, no need to keep observing
          this.revealObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all reveal elements
    const selectors = '.reveal, .reveal-right, .reveal-left, .reveal-scale, .word-inner';
    document.querySelectorAll(selectors).forEach(el => {
      this.revealObserver.observe(el);
    });
  }

  /* ─── Refresh (call after dynamic content added) ─── */
  refresh() {
    const selectors = '.reveal:not(.revealed), .reveal-right:not(.revealed), .reveal-left:not(.revealed), .reveal-scale:not(.revealed), .word-inner:not(.revealed)';
    document.querySelectorAll(selectors).forEach(el => {
      this.revealObserver.observe(el);
    });
  }

  /* ─── Number Counter Animation ─── */
  initCounterObserver() {
    const counterOptions = {
      threshold: 0.5,
    };

    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.counterObserver.unobserve(entry.target);
        }
      });
    }, counterOptions);

    document.querySelectorAll('[data-counter]').forEach(el => {
      this.counterObserver.observe(el);
    });
  }

  animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const isFloat = el.dataset.float === 'true';
    const start = performance.now();

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = target * eased;

      el.textContent = `${prefix}${isFloat ? current.toFixed(1) : Math.floor(current)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }

  /* ─── Hero Reveal ─── */
  initHeroReveal() {
    const heroInners = document.querySelectorAll('.hero__title-inner');
    const heroDesc = document.querySelector('.hero__desc');
    const heroActions = document.querySelector('.hero__actions');

    // Reveal function called after loader exits
    const revealHero = () => {
      // Stagger the title lines
      heroInners.forEach((inner, i) => {
        setTimeout(() => {
          inner.classList.add('revealed');
        }, i * 120);
      });

      // Desc and actions get classes (CSS handles delays via transition-delay)
      setTimeout(() => {
        if (heroDesc) heroDesc.classList.add('revealed');
      }, 300);
      setTimeout(() => {
        if (heroActions) heroActions.classList.add('revealed');
      }, 500);
    };

    // Listen for loader complete event
    document.addEventListener('loaderComplete', revealHero);

    // Fallback: if loader already done (session repeat)
    if (sessionStorage.getItem('loaderHasRun')) {
      setTimeout(revealHero, 100);
    }
  }

  /* ─── Section 3 Pin Spacer & Motion Transformation ─── */
  initSection3PinSpacer() {
    const section = document.querySelector('#paper-reveal');
    const focalDot = document.querySelector('#sec3-focal-dot');
    const whiteFrame = document.querySelector('.cine-frame-white');
    const darkScreen = document.querySelector('#sec3-dark-screen');

    if (!section || !whiteFrame || !darkScreen) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Defer until after Section 2 pin spacer (hero-3d.js) registers its ScrollTriggers
    // so GSAP can correctly calculate Section 3's actual scroll offset.
    const setupSec3Pin = () => {
      const frameInner = whiteFrame.querySelectorAll('.cine-frame-topbar, .cine-frame-body, .cine-frame-footer, .reticle');
      const cardMedia = whiteFrame.querySelector('.cine-frame-card-media');
      const carouselMount = document.querySelector('#circular-carousel-mount');
      const carouselRoot = carouselMount ? carouselMount.querySelector('.circular-carousel') : null;

      // The carousel card[0] at angle=0, cylinder preset (axis=Y):
      // camera: translate3d(0,0,-R) → card[0]: rotateY(0) translateZ(R) → net Z = 0
      // So card[0] ALWAYS projects at the GEOMETRIC CENTER of the carousel stage.
      // We need the center of the carousel container in viewport space,
      // then snap whiteFrame into that exact pixel position (same size as cardW x cardH = 240x240).

      // Carousel card dimensions (must match main.js CircularCarousel options)
      const CARD_W = 240;
      const CARD_H = 240;

      // getBoundingClientRect gives viewport-relative coordinates.
      // Since the section is position:relative, we compute element centers
      // relative to the section's top-left corner (already viewport-relative at setup time).
      const frameRect   = whiteFrame.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      // Initial anchor = widescreen frame's center in section-relative coords
      const frameInitCx = frameRect.left + frameRect.width  / 2 - sectionRect.left;
      const frameInitCy = frameRect.top  + frameRect.height / 2 - sectionRect.top;

      // Target anchor = carousel mount center in section-relative coords
      // At angle=0 (cylinder preset), card[0] always projects at the mount's geometric center
      let targetCx = sectionRect.width  / 2;
      let targetCy = sectionRect.height / 2;
      if (carouselMount) {
        const ccRect = carouselMount.getBoundingClientRect();
        targetCx = ccRect.left + ccRect.width  / 2 - sectionRect.left;
        targetCy = ccRect.top  + ccRect.height / 2 - sectionRect.top;
      } else {
        // Fallback: dark screen center
        const dsRect = darkScreen.getBoundingClientRect();
        targetCx = dsRect.left + dsRect.width  / 2 - sectionRect.left;
        targetCy = dsRect.top  + dsRect.height / 2 - sectionRect.top;
      }

      // Reparent whiteFrame into section (position: relative) so absolute coords work
      // (it currently lives inside .center-portfolio-wrap inside .grid-section-container)
      section.appendChild(whiteFrame);

      // Add morph class: disables hover transform & dotted line pseudo-elements
      whiteFrame.classList.add('is-morphing');

      // Place frame at its original center position, absolutely within section
      gsap.set(whiteFrame, {
        position:     'absolute',
        left:         frameInitCx + 'px',
        top:          frameInitCy + 'px',
        xPercent:     -50,
        yPercent:     -50,
        width:        frameRect.width  + 'px',
        height:       frameRect.height + 'px',
        maxWidth:     'none',
        borderRadius: '0px',
        padding:      '1.6rem 3rem',
        boxShadow:    '0 30px 80px rgba(0, 0, 0, 0.06)',
        opacity:      1,
        zIndex:       30,
        clearProps:   'none'
      });

      if (frameInner.length) gsap.set(frameInner, { opacity: 1, scale: 1 });
      if (cardMedia)         gsap.set(cardMedia,   { opacity: 0 });

      // Hold original wrap height so dotted lines don't collapse when frame goes absolute
      const centerWrap = document.querySelector('.center-portfolio-wrap');
      if (centerWrap) gsap.set(centerWrap, { minHeight: frameRect.height + 'px' });

      // Carousel is pre-rendered & visible behind whiteFrame
      gsap.set(darkScreen, { opacity: 1, scale: 1, pointerEvents: 'auto' });
      if (focalDot) gsap.set(focalDot, { left: '50%', bottom: '-16px', top: 'auto', xPercent: -50, yPercent: 0 });

      ScrollTrigger.refresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: '+=170%',
          scrub: 1.2,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true
        }
      });

      // 1. Blue Focal Dot: bottom-center → top-left (if present)
      if (focalDot) {
        tl.to(focalDot, {
          left: '1.5rem',
          top:  '-0.25rem',
          bottom: 'auto',
          xPercent: 0,
          ease: 'power2.inOut',
          duration: 0.9
        }, 0);
      }

      // 2. Frame inner content (text, topbar, footer, reticles) fade out & scale down
      tl.to(frameInner, {
        opacity: 0,
        scale: 0.6,
        ease: 'power2.in',
        duration: 0.3
      }, 0);

      // 3. Card image fades in INSIDE the shrinking frame
      if (cardMedia) {
        tl.to(cardMedia, {
          opacity: 1,
          ease: 'power2.out',
          duration: 0.3
        }, 0.15);
      }

      // 4. PHYSICAL MORPH: resize width + height AND slide to carousel card[0] center position
      tl.to(whiteFrame, {
        left:         targetCx + 'px',
        top:          targetCy + 'px',
        width:        CARD_W   + 'px',
        height:       CARD_H   + 'px',
        padding:      '0px',
        borderRadius: '14px',
        boxShadow:    '0 20px 50px rgba(0, 0, 0, 0.18)',
        ease: 'power2.inOut',
        duration: 0.8
      }, 0.05);

      // 5. Once frame is perfectly over card[0], fade it out for seamless handoff to real carousel
      tl.to(whiteFrame, {
        opacity: 0,
        ease: 'power1.out',
        duration: 0.1
      }, 0.85);
    };

    // Delay to ensure hero-3d.js ScrollTriggers are registered first
    if (document.readyState === 'complete') {
      setTimeout(setupSec3Pin, 500);
    } else {
      window.addEventListener('load', () => setTimeout(setupSec3Pin, 500));
    }
  }
}

export default ScrollAnimations;
