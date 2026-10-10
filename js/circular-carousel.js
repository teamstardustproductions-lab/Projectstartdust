/**
 * CircularCarousel — Vanilla JS implementation of React Bits CircularCarousel
 * Supporting Presets ('cylinder', 'orbit', 'wheel', 'panorama'), Intros ('rise', 'assemble', 'spin', 'none'),
 * 3D Curved Slicing (Tiles), Drag/Fling Physics, Wheel Scroll, Captions with Animated Reel Digits.
 */

const photo = id => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=max&sat=-100`;

const DEFAULT_ITEMS = [
  {
    src: photo('photo-1506744038136-46273834b3fb'),
    alt: 'Mist drifting through a mountain valley',
    title: 'Valley',
    subtitle: 'Landscape'
  },
  {
    src: photo('photo-1524504388940-b1c1722653e1'),
    alt: 'A woman with long hair in soft studio light',
    title: 'Portrait',
    subtitle: 'Studio'
  },
  {
    src: photo('photo-1486406146926-c627a92ad1ab'),
    alt: 'Glass towers seen from street level',
    title: 'Towers',
    subtitle: 'Architecture'
  },
  {
    src: photo('photo-1502680390469-be75c86b636f'),
    alt: 'A surfer carving inside a breaking wave',
    title: 'Swell',
    subtitle: 'Ocean'
  },
  {
    src: photo('photo-1487958449943-2429e8be8625'),
    alt: 'An angular white building against the sky',
    title: 'Facade',
    subtitle: 'Architecture'
  },
  {
    src: photo('photo-1509631179647-0177331693ae'),
    alt: 'A model in striped trousers leaning on a wall',
    title: 'Pose',
    subtitle: 'Editorial'
  },
  {
    src: photo('photo-1519681393784-d120267933ba'),
    alt: 'The Milky Way above snowy peaks',
    title: 'Night',
    subtitle: 'Sky'
  },
  {
    src: photo('photo-1485968579580-b6d095142e6e'),
    alt: 'A woman in a long coat on a city street',
    title: 'Street',
    subtitle: 'Editorial'
  },
  {
    src: photo('photo-1493246507139-91e8fad9978e'),
    alt: 'Mountains mirrored in a still lake',
    title: 'Mirror',
    subtitle: 'Landscape'
  },
  {
    src: photo('photo-1511818966892-d7d671e672a2'),
    alt: 'A glass skyscraper under a cloudy sky',
    title: 'Glass',
    subtitle: 'Architecture'
  }
];

const PRESETS = {
  cylinder: {
    axis: 'y',
    tilt: -5,
    perspective: 2500,
    curve: 1,
    spread: 1,
    inward: false,
    billboard: false,
    backfaces: true,
    window: 0
  },
  orbit: {
    axis: 'y',
    tilt: -16,
    perspective: 1500,
    curve: 0,
    spread: 1.45,
    inward: false,
    billboard: true,
    backfaces: false,
    window: 0
  },
  wheel: {
    axis: 'x',
    tilt: 0,
    perspective: 1800,
    curve: 0,
    spread: 1,
    inward: false,
    billboard: false,
    backfaces: true,
    window: 1.7
  },
  panorama: {
    axis: 'y',
    tilt: 0,
    perspective: 0,
    curve: 1,
    spread: 1,
    inward: true,
    billboard: false,
    backfaces: false,
    window: 0
  }
};

const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
const TILES = 8;
const OVERLAP = 2.5;
const DRAG_THRESHOLD = 5;
const SPRING = 118;
const SETTLE_SPEED = 9;
const CAPTION_SPACE = 76;
const TO_RAD = Math.PI / 180;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = degrees => ((((degrees + 180) % 360) + 360) % 360) - 180;
const easeOut = t => 1 - Math.pow(1 - t, 4);
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);

const rotateX = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
};

const rotateY = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};

export default class CircularCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      items: options.items && options.items.length ? options.items : DEFAULT_ITEMS,
      preset: options.preset || 'cylinder',
      intro: options.intro || 'rise',
      cardWidth: options.cardWidth ?? 220,
      aspectRatio: options.aspectRatio ?? 1,
      gap: options.gap ?? 25,
      curve: options.curve,
      tilt: options.tilt,
      perspective: options.perspective,
      autoplay: options.autoplay || 'drift',
      speed: options.speed ?? 14,
      interval: options.interval ?? 3,
      direction: options.direction || 'left',
      draggable: options.draggable ?? true,
      momentum: options.momentum ?? 0.6,
      snap: options.snap ?? true,
      pauseOnHover: options.pauseOnHover ?? true,
      focusOnClick: options.focusOnClick ?? true,
      parallax: options.parallax ?? 0.3,
      stretch: options.stretch ?? 0.5,
      depthFade: options.depthFade ?? 0.55,
      fadeColor: options.fadeColor || '#000000',
      innerShade: options.innerShade ?? 0.6,
      cornerRadius: options.cornerRadius ?? 12,
      captions: options.captions ?? false,
      onChange: options.onChange || null,
      onItemClick: options.onItemClick || null,
      className: options.className || '',
      style: options.style || null
    };

    this.list = this.options.items;
    this.count = this.list.length;
    this.shape = PRESETS[this.options.preset] ? this.options.preset : 'cylinder';
    this.layout = PRESETS[this.shape];
    this.axis = this.layout.axis;
    this.tiltValue = this.options.tilt ?? this.layout.tilt;
    this.tiltYValue = this.options.tiltY ?? 0;
    this.cardTiltValue = this.options.cardTilt ?? 0;
    this.cardRollValue = this.options.cardRoll ?? 0;
    this.spreadValue = this.options.spread ?? this.layout.spread;
    this.curveValue = this.layout.billboard ? 0 : clamp(this.options.curve ?? this.layout.curve, 0, 1);
    
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reduced = Boolean(query?.matches);

    this.cardW = Math.max(40, this.options.cardWidth);
    this.cardH = this.cardW / clamp(this.options.aspectRatio, 0.2, 5);
    this.along = this.axis === 'x' ? this.cardH : this.cardW;
    this.step = 360 / this.count;

    this.radius = this.calculateRadius();
    this.tiles = this.generateTiles();

    this.active = 0;
    this.activeRef = 0;
    this.ready = false;
    this.dragging = false;

    this.state = {
      angle: 0,
      velocity: 0,
      target: null,
      dir: (this.options.direction === 'right' ? 1 : -1) * (this.layout.inward ? -1 : 1),
      press: null,
      drag: false,
      hover: false,
      pointer: { inside: false, x: 0, y: 0 },
      yaw: 0,
      pitch: 0,
      intro: null,
      introDone: false,
      holdUntil: 0,
      stepAt: 0,
      suppressClick: false,
      wheelTimer: 0,
      fit: 1,
      shift: 0,
      drop: 0,
      last: 0
    };

    this.cardElements = [];
    this.rafId = 0;
    this.isVisible = true;

    this.init();
  }

  calculateRadius() {
    const n = Math.max(this.count, 3);
    const pitch = (this.along + this.options.gap) * (this.spreadValue ?? this.layout.spread);
    const chord = pitch / (2 * Math.sin(Math.PI / n));
    const arc = (n * pitch) / (2 * Math.PI);
    return Math.max(chord + (arc - chord) * this.curveValue, this.along * 0.6);
  }

  generateTiles() {
    const total = this.curveValue > 0.001 ? TILES : 1;
    const length = this.along / total;
    const bend = this.curveValue > 0.001 ? this.radius / this.curveValue : 0;

    return Array.from({ length: total }, (_, index) => {
      const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
      const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
      const center = (start + end) / 2 - this.along / 2;
      const alpha = bend ? center / bend : 0;
      const shift = bend ? bend * Math.sin(alpha) : center;
      const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
      const depth = this.layout.inward ? sink : -sink;
      const turn = ((this.layout.inward ? -alpha : alpha) * 180) / Math.PI;
      const move =
        this.axis === 'x'
          ? `translate3d(0px, ${shift}px, ${depth}px) rotateX(${-turn}deg)`
          : `translate3d(${shift}px, 0px, ${depth}px) rotateY(${turn}deg)`;
      return { index, total, start, end, size: end - start, move };
    });
  }

  init() {
    this.buildDOM();
    this.bindEvents();
    this.preloadImages();
  }

  buildDOM() {
    this.root = document.createElement('div');
    this.root.className = `circular-carousel ${this.options.className}`.trim();
    if (this.options.style) {
      Object.assign(this.root.style, this.options.style);
    }
    this.root.style.setProperty('--cc-fade', this.options.fadeColor);
    this.root.style.setProperty('--cc-radius', `${Math.max(0, this.options.cornerRadius)}px`);
    this.root.style.setProperty('--cc-inner', (1 - clamp(this.options.innerShade, 0, 1)).toFixed(3));
    
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-roledescription', 'carousel');
    this.root.setAttribute('aria-label', 'Image carousel');
    this.root.setAttribute('tabindex', '0');
    this.root.setAttribute('data-axis', this.axis);
    this.root.setAttribute('data-shape', this.shape);
    if (this.options.draggable) {
      this.root.setAttribute('data-draggable', '');
    }

    this.view = document.createElement('div');
    this.view.className = 'circular-carousel__view';

    this.stage = document.createElement('div');
    this.stage.className = 'circular-carousel__stage';

    this.camera = document.createElement('div');
    this.camera.className = 'circular-carousel__camera';

    this.ring = document.createElement('div');
    this.ring.className = 'circular-carousel__ring';

    this.cardElements = [];

    this.list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'circular-carousel__card';
      card.setAttribute('data-cc-index', index);
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${item.title || item.alt || `Image ${index + 1}`}, ${index + 1} of ${this.count}`);

      this.tiles.forEach(tile => {
        card.appendChild(this.createTileElement(item, tile, false, index));
      });

      if (this.layout.backfaces) {
        this.tiles.forEach(tile => {
          card.appendChild(this.createTileElement(item, tile, true, index));
        });
      }

      this.ring.appendChild(card);
      this.cardElements.push(card);
    });

    this.camera.appendChild(this.ring);
    this.stage.appendChild(this.camera);
    this.view.appendChild(this.stage);
    this.root.appendChild(this.view);

    if (this.options.captions) {
      this.createCaptionDOM();
    }

    this.live = document.createElement('div');
    this.live.className = 'circular-carousel__live';
    this.live.setAttribute('aria-live', 'polite');
    this.live.setAttribute('aria-atomic', 'true');
    this.root.appendChild(this.live);

    this.container.appendChild(this.root);
  }

  createTileElement(item, tile, back, index) {
    const strip = back ? tile.total - 1 - tile.index : tile.index;
    const first = strip === 0;
    const last = strip === tile.total - 1;
    const r = 'var(--cc-radius)';
    const frameRadius =
      this.axis === 'x'
        ? `${first ? r : 0} ${first ? r : 0} ${last ? r : 0} ${last ? r : 0}`
        : `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`;
    const offset = back ? this.along - tile.end : tile.start;
    const size = tile.size;
    const box =
      this.axis === 'x'
        ? { left: `${-this.cardW / 2}px`, top: `${-size / 2}px`, width: `${this.cardW}px`, height: `${size}px` }
        : { left: `${-size / 2}px`, top: `${-this.cardH / 2}px`, width: `${size}px`, height: `${this.cardH}px` };
    const photoStyle =
      this.axis === 'x'
        ? { left: '0px', top: `${-offset}px`, width: `${this.cardW}px`, height: `${this.cardH}px` }
        : { left: `${-offset}px`, top: '0px', width: `${this.cardW}px`, height: `${this.cardH}px` };
    const flip = this.axis === 'x' ? ' rotateX(180deg)' : ' rotateY(180deg)';

    const tileEl = document.createElement('div');
    tileEl.className = 'circular-carousel__tile';
    Object.assign(tileEl.style, box);
    tileEl.style.transform = tile.move + (back ? flip : '');
    tileEl.setAttribute('aria-hidden', 'true');

    const frameEl = document.createElement('div');
    frameEl.className = 'circular-carousel__frame';
    frameEl.style.height = this.axis === 'x' ? `${size}px` : `${this.cardH}px`;
    frameEl.style.borderRadius = frameRadius;

    const img = document.createElement('img');
    img.className = 'circular-carousel__photo';
    img.src = item.src;
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    Object.assign(img.style, photoStyle);

    frameEl.appendChild(img);

    if (back) {
      const inner = document.createElement('div');
      inner.className = 'circular-carousel__inner';
      frameEl.appendChild(inner);
    }

    const shade = document.createElement('div');
    shade.className = 'circular-carousel__shade';
    frameEl.appendChild(shade);

    tileEl.appendChild(frameEl);
    return tileEl;
  }

  createCaptionDOM() {
    this.captionEl = document.createElement('div');
    this.captionEl.className = 'circular-carousel__caption';
    this.captionEl.setAttribute('aria-hidden', 'true');

    this.titleEl = document.createElement('span');
    this.titleEl.className = 'circular-carousel__title';

    this.countEl = document.createElement('span');
    this.countEl.className = 'circular-carousel__count';

    this.digitsEl = document.createElement('span');
    this.digitsEl.className = 'circular-carousel__digits';

    this.countEl.appendChild(this.digitsEl);
    
    const slash = document.createElement('span');
    slash.className = 'circular-carousel__slash';
    slash.textContent = '/';
    this.countEl.appendChild(slash);

    this.totalSpan = document.createElement('span');
    this.totalSpan.textContent = String(this.count).padStart(2, '0');
    this.countEl.appendChild(this.totalSpan);

    this.captionEl.appendChild(this.titleEl);
    this.captionEl.appendChild(this.countEl);
    this.root.appendChild(this.captionEl);

    this.updateCaptionText(0);
  }

  updateCaptionText(index) {
    if (!this.captionEl) return;
    const current = this.list[index] || this.list[0];
    if (!current) return;

    this.titleEl.textContent = '';
    const mainTitle = document.createTextNode(current.title || current.alt || '');
    this.titleEl.appendChild(mainTitle);

    if (current.subtitle) {
      const sub = document.createElement('span');
      sub.className = 'circular-carousel__subtitle';
      sub.textContent = current.subtitle;
      this.titleEl.appendChild(sub);
    }

    // Update digits
    const formatted = String(index + 1).padStart(2, '0');
    this.digitsEl.textContent = '';
    formatted.split('').forEach(digitStr => {
      const digitSpan = document.createElement('span');
      digitSpan.className = 'circular-carousel__digit';
      const reelSpan = document.createElement('span');
      reelSpan.className = 'circular-carousel__reel';
      reelSpan.style.transform = `translateY(${-Number(digitStr) * 10}%)`;

      '0123456789'.split('').forEach(n => {
        const numSpan = document.createElement('span');
        numSpan.textContent = n;
        reelSpan.appendChild(numSpan);
      });

      digitSpan.appendChild(reelSpan);
      this.digitsEl.appendChild(digitSpan);
    });

    const label = current.title || current.alt || `Image ${index + 1}`;
    if (this.live) {
      this.live.textContent = `${label}, ${index + 1} of ${this.count}`;
    }
  }

  preloadImages() {
    const sources = this.list.slice(0, 16).map(item => item.src);
    const load = src =>
      new Promise(resolve => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => (image.decode ? image.decode().then(resolve, resolve) : resolve());
        image.onerror = resolve;
        image.src = src;
      });
    const timeout = new Promise(resolve => setTimeout(resolve, 2400));
    Promise.race([Promise.all(sources.map(load)), timeout]).then(() => {
      this.ready = true;
      this.root.setAttribute('data-ready', '');
      this.measure();
      this.wake();
    });
  }

  measure() {
    const rect = this.root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const room = this.options.captions ? CAPTION_SPACE : 0;
    const width = rect.width * 0.94;
    const height = (rect.height - room) * 0.92;
    const P = this.layout.inward ? this.radius : (this.options.perspective ?? this.layout.perspective);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    if (this.layout.inward) {
      minX = -width / 2;
      maxX = width / 2;
      minY = -this.cardH / 2;
      maxY = this.cardH / 2;
    } else {
      const corners = [
        [-this.cardW / 2, -this.cardH / 2],
        [this.cardW / 2, -this.cardH / 2],
        [-this.cardW / 2, this.cardH / 2],
        [this.cardW / 2, this.cardH / 2]
      ];
      const limit = this.layout.window ? this.layout.window * this.step : 180;
      for (let a = -limit; a <= limit; a += limit / 24) {
        for (const [cx, cy] of corners) {
          let p;
          if (this.axis === 'x') {
            p = rotateY(rotateX([cx, cy, this.radius], -a), this.tiltValue);
          } else if (this.layout.billboard) {
            const c = rotateY([0, 0, this.radius], a);
            p = rotateX([c[0] + cx, cy, c[2]], this.tiltValue);
          } else {
            p = rotateX(rotateY([cx, cy, this.radius], a), this.tiltValue);
          }
          p = [p[0], p[1], p[2] - this.radius];
          if (p[2] >= P * 0.95) continue;
          const k = P / (P - p[2]);
          minX = Math.min(minX, p[0] * k);
          maxX = Math.max(maxX, p[0] * k);
          minY = Math.min(minY, p[1] * k);
          maxY = Math.max(maxY, p[1] * k);
        }
      }
    }

    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const fit = Math.min(1, width / spanX, height / spanY);
    this.state.fit = fit;
    this.state.shift = -((minY + maxY) / 2) * fit - room / 2;
    this.state.drop = this.axis === 'x' ? (rect.width / fit) * 0.55 + this.cardW : (rect.height / fit) * 0.55 + this.cardH;
    
    this.stage.style.perspective = `${P}px`;
    this.stage.style.transform = `translate3d(0, ${this.state.shift}px, 0) scale(${fit})`;
  }

  introCard(elapsed, landing) {
    if (!this.state.intro) return { radius: 1, lift: 0 };
    const type = this.state.intro.type;
    const reach = Math.abs(wrap(landing + this.state.angle));
    if (type === 'assemble') {
      const delay = (reach / 180) * 420;
      const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1));
      return { radius: 1 + 0.6 * (1 - p), lift: 0 };
    }
    if (type === 'rise') {
      const delay = (reach / 180) * 480;
      const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
      return { radius: 1, lift: (1 - p) * this.state.drop };
    }
    if (type === 'spin') {
      const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
      return { radius: 1 + 0.28 * (1 - p), lift: 0 };
    }
    return { radius: 1, lift: 0 };
  }

  advance(dt, now) {
    const state = this.state;
    const introType = this.reduced ? 'none' : (this.options.intro in INTRO_LENGTH ? this.options.intro : 'rise');
    const autoplay = this.reduced ? 'off' : this.options.autoplay;

    if (!state.introDone && this.ready) {
      if (!state.intro) {
        if (introType === 'none') state.introDone = true;
        else state.intro = { type: introType, start: now };
      }
      if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) {
        state.intro = null;
        state.introDone = true;
      }
    }

    const paused = (this.options.pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
    const cruise = autoplay === 'drift' && !paused && !state.intro ? this.options.speed * state.dir : 0;
    let busy = Boolean(state.intro) || state.drag;

    if (state.drag || state.intro) {
      state.velocity = state.drag ? state.velocity : 0;
    } else if (state.target !== null) {
      let remaining = dt;
      const damping = 2 * Math.sqrt(SPRING);
      while (remaining > 0) {
        const h = Math.min(remaining, 1 / 240);
        const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
        state.velocity += accel * h;
        state.angle += state.velocity * h;
        remaining -= h;
      }
      if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
        state.angle = state.target;
        state.velocity = 0;
        state.target = null;
      }
      busy = true;
    } else {
      const tau = 0.18 + this.options.momentum * 1.5;
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
      state.angle += state.velocity * dt;
      if (cruise === 0 && this.options.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
        state.target = this.nearest(state.angle);
      }
      busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
    }

    if (autoplay === 'step' && !paused && !state.intro && state.introDone) {
      if (!state.stepAt) state.stepAt = now + Math.max(0.5, this.options.interval) * 1000;
      if (now >= state.stepAt) {
        state.target = (state.target ?? this.nearest(state.angle)) + this.step * state.dir;
        state.stepAt = now + Math.max(0.5, this.options.interval) * 1000;
      }
      busy = true;
    } else {
      state.stepAt = 0;
    }

    if (now < state.holdUntil) busy = true;

    const parallaxVal = this.reduced ? 0 : clamp(this.options.parallax, 0, 1);
    const ease = 1 - Math.exp(-dt / 0.35);
    const aimYaw = state.pointer.inside ? state.pointer.x * parallaxVal * 9 : 0;
    const aimPitch = state.pointer.inside ? -state.pointer.y * parallaxVal * 6 : 0;
    state.yaw += (aimYaw - state.yaw) * ease;
    state.pitch += (aimPitch - state.pitch) * ease;
    if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true;

    return busy;
  }

  nearest(angle) {
    return Math.round(angle / this.step) * this.step;
  }

  render(now) {
    const state = this.state;
    const elapsed = state.intro ? now - state.intro.start : 0;
    const stretchVal = this.reduced ? 0 : clamp(this.options.stretch, 0, 1);
    const swell = 1 + stretchVal * 0.12 * Math.min(1, Math.abs(state.velocity) / 420);
    
    let spinOffset = 0;
    if (state.intro?.type === 'spin') {
      const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
      spinOffset = -300 * state.dir * (1 - p);
    } else if (state.intro?.type === 'assemble') {
      const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1));
      spinOffset = -32 * state.dir * (1 - p);
    }
    const angle = state.angle + spinOffset;
    const R = this.radius * swell;

    const perspectiveVal = this.layout.inward ? this.radius : (this.options.perspective ?? this.layout.perspective);

    if (this.axis === 'x') {
      this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${(this.tiltYValue || 0) + state.yaw}deg) rotateX(${this.tiltValue + state.pitch}deg)`;
      this.ring.style.transform = `rotateX(${-angle}deg)`;
    } else if (this.layout.inward) {
      this.camera.style.transform = `translate3d(0, 0, ${perspectiveVal - 1}px) rotateX(${this.tiltValue + state.pitch}deg) rotateY(${(this.tiltYValue || 0) + state.yaw}deg)`;
      this.ring.style.transform = `rotateY(${angle}deg)`;
    } else {
      this.camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${this.tiltValue + state.pitch}deg) rotateY(${(this.tiltYValue || 0) + state.yaw}deg)`;
      this.ring.style.transform = `rotateY(${angle}deg)`;
    }

    for (let index = 0; index < this.count; index++) {
      const card = this.cardElements[index];
      if (!card) continue;
      const base = index * this.step;
      const mod = this.introCard(elapsed, base);
      const r = R * mod.radius;
      let transform;
      if (this.axis === 'x') {
        transform = `rotateX(${-base}deg) translateZ(${r}px)`;
      } else if (this.layout.inward) {
        transform = `rotateY(${base}deg) translateZ(${-r}px)`;
      } else {
        transform = `rotateY(${base}deg) translateZ(${r}px)`;
        if (this.layout.billboard) transform += ` rotateY(${-(base + angle)}deg)`;
      }
      if (this.cardTiltValue) transform += ` rotateX(${this.cardTiltValue}deg)`;
      if (this.cardRollValue) transform += ` rotateZ(${this.cardRollValue}deg)`;
      if (mod.lift) transform += this.axis === 'x' ? ` translateX(${mod.lift}px)` : ` translateY(${mod.lift}px)`;
      card.style.transform = transform;

      const world = wrap(base + angle);
      const facing = Math.cos(world * TO_RAD);
      if (this.layout.inward) card.style.visibility = Math.abs(world) > 86 ? 'hidden' : '';
      const fade = clamp(this.options.depthFade, 0, 1) * Math.pow((1 - facing) / 2, 1.25);
      card.style.setProperty('--cc-depth', fade.toFixed(3));
    }

    const index = ((Math.round(-state.angle / this.step) % this.count) + this.count) % this.count || 0;
    if (index !== this.activeRef) {
      this.activeRef = index;
      this.active = index;
      if (this.options.captions) {
        this.updateCaptionText(index);
      }
      this.options.onChange?.(index);
    }
  }

  frame = now => {
    this.rafId = 0;
    const state = this.state;
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60;
    state.last = now;
    const busy = this.advance(dt, now);
    this.render(now);
    if (busy && this.isVisible && !document.hidden) {
      this.rafId = requestAnimationFrame(this.frame);
    } else {
      state.last = 0;
    }
  };

  wake() {
    if (!this.rafId && this.isVisible && !document.hidden) {
      this.rafId = requestAnimationFrame(this.frame);
    }
  }

  bindEvents() {
    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
      this.wake();
    });
    this.resizeObserver.observe(this.root);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible) this.wake();
      else {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this.state.last = 0;
      }
    });
    this.intersectionObserver.observe(this.root);

    this.onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this.state.last = 0;
      } else this.wake();
    };
    document.addEventListener('visibilitychange', this.onVisibility);

    this.onWheel = event => {
      if (!this.options.draggable) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
      if (!delta) return;
      event.preventDefault();
      const perPixel = 180 / (Math.PI * this.radius * this.state.fit);
      this.state.target = null;
      this.state.angle -= delta * perPixel * (this.layout.inward ? -1 : 1);
      this.state.velocity = -delta * perPixel * (this.layout.inward ? -1 : 1) * 30;
      this.state.holdUntil = performance.now() + 1600;
      clearTimeout(this.state.wheelTimer);
      this.state.wheelTimer = setTimeout(() => {
        if (this.options.snap) this.state.target = this.nearest(this.state.angle + this.state.velocity * 0.12);
        this.wake();
      }, 140);
      this.wake();
    };
    this.root.addEventListener('wheel', this.onWheel, { passive: false });

    // Pointer events
    this.root.addEventListener('pointerdown', this.handlePointerDown);
    this.root.addEventListener('pointermove', this.handlePointerMove);
    this.root.addEventListener('pointerup', this.releasePointer);
    this.root.addEventListener('pointercancel', this.releasePointer);
    this.root.addEventListener('pointerenter', this.handlePointerEnter);
    this.root.addEventListener('pointerleave', this.handlePointerLeave);
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('keydown', this.handleKeyDown);
  }

  updatePointer(event) {
    const rect = this.root.getBoundingClientRect();
    const pointer = this.state.pointer;
    pointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  }

  handlePointerDown = event => {
    this.state.suppressClick = false;
    if (!this.options.draggable || event.button !== 0) return;
    this.state.press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      angle: this.state.angle,
      moved: false,
      origin: 0,
      samples: [{ time: performance.now(), angle: this.state.angle }]
    };
  };

  handlePointerMove = event => {
    const state = this.state;
    if (event.pointerType === 'mouse') {
      state.pointer.inside = true;
      this.updatePointer(event);
    }
    const press = state.press;
    if (!press || press.id !== event.pointerId) {
      this.wake();
      return;
    }
    const delta = this.axis === 'x' ? event.clientY - press.y : event.clientX - press.x;
    const cross = this.axis === 'x' ? event.clientX - press.x : event.clientY - press.y;
    if (!press.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      if (Math.abs(cross) > Math.abs(delta) * 1.2 && event.pointerType !== 'mouse') {
        state.press = null;
        return;
      }
      press.moved = true;
      press.origin = delta;
      state.drag = true;
      state.target = null;
      state.velocity = 0;
      this.dragging = true;
      this.root.setAttribute('data-dragging', '');
      try {
        this.root.setPointerCapture(event.pointerId);
      } catch {}
    }
    const perPixel = 180 / (Math.PI * this.radius * state.fit);
    state.angle = press.angle + (delta - press.origin) * perPixel * (this.layout.inward ? -1 : 1);
    const now = performance.now();
    press.samples.push({ time: now, angle: state.angle });
    while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
    this.wake();
  };

  releasePointer = event => {
    const state = this.state;
    const press = state.press;
    if (!press || press.id !== event.pointerId) return;
    state.press = null;
    if (!press.moved) return;
    state.drag = false;
    this.dragging = false;
    this.root.removeAttribute('data-dragging');
    state.suppressClick = true;
    const first = press.samples[0];
    const last = press.samples[press.samples.length - 1];
    const span = (last.time - first.time) / 1000;
    const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
    state.velocity = velocity;
    if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity);
    const coasting = this.options.autoplay === 'drift' && !(this.options.pauseOnHover && state.hover && event.pointerType === 'mouse');
    if (this.options.snap && !coasting) {
      const tau = 0.18 + this.options.momentum * 1.5;
      state.target = Math.round((state.angle + velocity * tau * 0.55) / this.step) * this.step;
    }
    this.wake();
  };

  handlePointerEnter = event => {
    if (event.pointerType !== 'mouse') return;
    this.state.hover = true;
    this.wake();
  };

  handlePointerLeave = event => {
    if (event.pointerType === 'mouse') {
      this.state.hover = false;
      this.state.pointer.inside = false;
    }
    this.wake();
  };

  handleClick = event => {
    if (this.state.suppressClick) {
      this.state.suppressClick = false;
      return;
    }
    const card = event.target.closest?.('[data-cc-index]');
    if (!card) return;
    const index = Number(card.getAttribute('data-cc-index'));
    if (this.options.focusOnClick) this.focusIndex(index);
    this.options.onItemClick?.(this.list[index], index);
  };

  handleKeyDown = event => {
    const forward = this.axis === 'x' ? 'ArrowDown' : 'ArrowRight';
    const backward = this.axis === 'x' ? 'ArrowUp' : 'ArrowLeft';
    if (event.key === forward) this.stepBy(1);
    else if (event.key === backward) this.stepBy(-1);
    else if (event.key === 'Home') this.focusIndex(0);
    else if (event.key === 'End') this.focusIndex(this.count - 1);
    else if (event.key === 'Enter' || event.key === ' ') this.options.onItemClick?.(this.list[this.activeRef], this.activeRef);
    else return;
    event.preventDefault();
  };

  focusIndex(index) {
    let target = -index * this.step;
    target += 360 * Math.round((this.state.angle - target) / 360);
    this.state.target = target;
    this.state.holdUntil = performance.now() + 2800;
    this.wake();
  }

  stepBy(delta) {
    const base = this.state.target ?? Math.round(this.state.angle / this.step) * this.step;
    this.state.target = base - delta * this.step * (this.layout.inward ? -1 : 1);
    this.state.holdUntil = performance.now() + 2800;
    this.wake();
  }

  rebuildTiles() {
    this.cardElements.forEach((card, index) => {
      card.innerHTML = '';
      const item = this.list[index];
      this.tiles.forEach(tile => {
        card.appendChild(this.createTileElement(item, tile, false, index));
      });
      if (this.layout.backfaces) {
        this.tiles.forEach(tile => {
          card.appendChild(this.createTileElement(item, tile, true, index));
        });
      }
    });
  }

  updateOptions(newOptions = {}) {
    Object.assign(this.options, newOptions);

    if (newOptions.preset && PRESETS[newOptions.preset]) {
      this.shape = newOptions.preset;
      this.layout = PRESETS[this.shape];
      this.axis = this.layout.axis;
      this.root.setAttribute('data-axis', this.axis);
      this.root.setAttribute('data-shape', this.shape);
    }

    if (newOptions.tilt !== undefined) this.tiltValue = Number(newOptions.tilt);
    if (newOptions.tiltY !== undefined) this.tiltYValue = Number(newOptions.tiltY);
    if (newOptions.cardTilt !== undefined) this.cardTiltValue = Number(newOptions.cardTilt);
    if (newOptions.cardRoll !== undefined) this.cardRollValue = Number(newOptions.cardRoll);
    if (newOptions.spread !== undefined) this.spreadValue = Number(newOptions.spread);
    if (newOptions.curve !== undefined) {
      this.curveValue = this.layout.billboard ? 0 : clamp(Number(newOptions.curve), 0, 1);
    }
    if (newOptions.cornerRadius !== undefined) {
      this.root.style.setProperty('--cc-radius', `${Math.max(0, newOptions.cornerRadius)}px`);
    }
    if (newOptions.innerShade !== undefined) {
      this.root.style.setProperty('--cc-inner', (1 - clamp(newOptions.innerShade, 0, 1)).toFixed(3));
    }

    let rebuildNeeded = false;
    if (newOptions.cardWidth !== undefined && Number(newOptions.cardWidth) !== this.cardW) {
      this.cardW = Math.max(40, Number(newOptions.cardWidth));
      rebuildNeeded = true;
    }
    if (newOptions.aspectRatio !== undefined) {
      this.cardH = this.cardW / clamp(Number(this.options.aspectRatio), 0.2, 5);
      rebuildNeeded = true;
    }
    if (newOptions.gap !== undefined || newOptions.spread !== undefined || newOptions.curve !== undefined) {
      rebuildNeeded = true;
    }

    this.along = this.axis === 'x' ? this.cardH : this.cardW;
    this.radius = this.calculateRadius();

    if (rebuildNeeded) {
      this.tiles = this.generateTiles();
      this.rebuildTiles();
    }

    this.measure();
    this.wake();
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.root?.removeEventListener('wheel', this.onWheel);
    clearTimeout(this.state.wheelTimer);
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
  }
}
