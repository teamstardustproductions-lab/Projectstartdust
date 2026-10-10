/**
 * MAIN — Orchestrator
 * Project Stardust — Initializes all modules
 */

import Loader from './loader.js';
import Cursor from './cursor.js';
import Nav from './nav.js';
import ScrollAnimations from './scroll.js';
import Marquee from './marquee.js';
import Reel from './reel.js';
import Hero3D from './hero-3d.js';
import ProximityText from './proximity-text.js';
import CircularCarousel from './circular-carousel.js';
import CarouselEditor from './carousel-editor.js';
import { MaintenanceGame } from './maintenance-game.js';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Core Modules ─── */
  const loader = new Loader();
  const nav = new Nav();
  const scroll = new ScrollAnimations();
  const marquee = new Marquee();
  const reel = new Reel();
  const hero3d = new Hero3D();
  const maintenanceGame = new MaintenanceGame();
  
  /* ─── React Bits CircularCarousel Component ─── */
  const carouselItems = [
    { src: 'assets/images/project-1.png', alt: 'Mist drifting through a valley', title: 'VALLEY ODYSSEY', subtitle: 'Landscape Cinema' },
    { src: 'assets/images/project-2.png', alt: 'A studio portrait', title: 'STUDIO PORTRAIT', subtitle: '8K Master' },
    { src: 'assets/images/showreel-poster.png', alt: 'Glass towers from street level', title: 'GLASS TOWERS', subtitle: 'Architectural' },
    { src: 'assets/images/tropical_lagoon_preview.png', alt: 'A surfer carving inside a breaking wave', title: 'OCEAN SWELL', subtitle: 'Action Cinema' },
    { src: 'assets/images/spec-titanium-chassis.png', alt: 'An angular white building against the sky', title: 'TITANIUM FACADE', subtitle: 'Brand Film' },
    { src: 'assets/images/spec-lens-glass.png', alt: 'A model in striped trousers leaning on a wall', title: 'ANAMORPHIC LENS', subtitle: 'Optics Master' },
    { src: 'assets/images/spec-iris-aperture.png', alt: 'The Milky Way above snowy peaks', title: 'NIGHT SKY ARCHIVE', subtitle: 'Astrophotography' },
    { src: 'assets/images/project-1.png', alt: 'Mountains mirrored in a still lake', title: 'MIRROR REFLECTION', subtitle: 'Feature Film' }
  ];

  const circularCarousel = new CircularCarousel('#circular-carousel-mount', {
    items: carouselItems,
    preset: 'cylinder',
    intro: 'rise',
    cardWidth: 240,
    aspectRatio: 1,
    speed: 14,
    captions: true,
    fadeColor: '#F4F3ED',
    innerShade: 0.15,
    cornerRadius: 14
  });

  /* ─── Carousel Studio 3D Editor ─── */
  const carouselEditor = new CarouselEditor(circularCarousel, '#paper-reveal');
  const proximityText = new ProximityText({
    selector: '.portfolio-title',
    containerSelector: '.cinematic-widescreen-frame',
    radius: 240,
    minWeight: 400,
    maxWeight: 900,
    maxScale: 1.25,
    maxLift: -8,
    lerpAmount: 0.14
  });

  /* ─── Service Tabs ─── */
  initTabs();

  /* ─── Testimonial Carousel ─── */
  initTestimonials();

  /* ─── Hero Stars ─── */
  initHeroStars();

  /* ─── Work Filter (work.html) ─── */
  initWorkFilter();

  /* ─── Contact Form ─── */
  initContactForm();

  /* ─── Smooth Anchor Scroll ─── */
  initSmoothAnchors();

});

/* ─── Service Tabs ─── */
function initTabs() {
  const tabs = document.querySelectorAll('.tabs__tab');
  const panels = document.querySelectorAll('.tabs__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panel
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.dataset.panel === target) {
          panel.classList.add('active');
        }
      });
    });
  });
}

/* ─── Testimonial Carousel ─── */
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!slides.length) return;

  let currentSlide = 0;
  let autoplayInterval;

  function goTo(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      goTo(currentSlide + 1);
    }, 5000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(autoplayInterval);
      goTo(i);
      startAutoplay();
    });
  });

  startAutoplay();
}

/* ─── Hero Stars ─── */
function initHeroStars() {
  const container = document.querySelector('.hero__stars');
  if (!container) return;

  const count = 30;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('hero__star');
    const size = Math.random() * 3 + 1;
    const dur = (Math.random() * 4 + 2).toFixed(1);
    const delay = (Math.random() * 3).toFixed(1);
    const floatDur = (Math.random() * 8 + 6).toFixed(1);
    const floatDelay = (Math.random() * 4).toFixed(1);

    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 70}%;
      --dur: ${dur}s;
      --delay: ${delay}s;
      --float-dur: ${floatDur}s;
      --float-delay: ${floatDelay}s;
    `;
    container.appendChild(star);
  }
}

/* ─── Work Filter ─── */
function initWorkFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card[data-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      cards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        if (show) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = 'all';
        } else {
          card.style.opacity = '0.2';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
}

/* ─── Contact Form ─── */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate send (replace with actual endpoint)
    setTimeout(() => {
      submitBtn.textContent = 'Message Sent ✓';
      form.reset();
    }, 1500);
  });
}

/* ─── Smooth Anchor Scroll ─── */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
