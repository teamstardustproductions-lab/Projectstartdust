/**
 * HERO 3D CAMERA LENS ENGINE
 * Project Stardust — Interactive 3D Canvas
 * Model: assets/3dModel/camera_lens.glb
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import OpticsWheel from './optics-wheel.js';

/**
 * 3D LENS DIRECT AXIS, ROTATION & SCROLL ANIMATION CONFIGURATION
 * Direct access to position, scale, angles, spin speeds, pin scroll, and fade-out controls!
 */
export const LENS_CONFIG = {
  // 1. Model File Path
  modelPath: 'assets/3dModel/camera_lens.glb',

  // 2. Model Scale / Size (Hero section baseline size)
  scale: 3.1,

  // 3. Camera Distance / Zoom (Smaller = Closer / Zoomed In, Larger = Farther / Zoomed Out)
  cameraDistance: 4.3,

  // 4. HERO SECTION Position (X: Left/Right, Y: Up/Down, Z: Depth)
  heroPosition: {
    x: 0.0,   // Move Left (-) / Right (+)
    y: -1.9,  // Move Down (-) / Up (+)
    z: 0.7    // Move Back (-) / Front (+)
  },

  // 5. HERO SECTION Initial Standing Angles (in Degrees)
  // X = Pitch tilt (Front tilt), Y = Yaw turn, Z = Roll tilt
  initialRotationDeg: {
    x: 20,   // Pitch front tilt angle (degrees forward tilt towards viewer)
    y: 0,    // Yaw turn angle
    z: -90   // Roll tilt angle
  },

  // 6. CONTINUOUS SPIN SPEED & DIRECTION for EACH AXIS (Hero section)
  // Positive = Clockwise / Forward, Negative = Counter-Clockwise, 0 = Disabled
  spinAxisSpeed: {
    x: 0.0,   // Spin around Pitch X-axis
    y: 0.01,  // Spin around Vertical Y-axis (turntable spin)
    z: 0.0    // Spin around Optical Barrel Z-axis
  },

  // 7. SECTION 2 (OPTICS SHOWCASE) Target Position & Scale
  section2Position: {
    x: -1.35, // Left side target circle position
    y: -0.05, // Centered vertically inside HUD ring
    z: 0.2    // Depth position
  },
  section2Scale: 2.0, // Scale when arrived at Section 2

  // 8. SECTION 2 — ARRIVAL ROTATION (Pose when lens first arrives at Section 2)
  // Angles in Degrees before pin scroll starts
  section2InitialRotation: {
    x: 100,   // Initial pitch tilt on arrival
    y: -15,  // Initial yaw turn on arrival
    z: -60   // Initial roll tilt on arrival
  },

  // 9. SECTION 2 — PINNED SCROLL FINAL ROTATION (Pose after all orbit cards reveal)
  // Angles in Degrees at the end of section 2 pin scroll
  section2RotationDeg: {
    x: 75,   // Final pitch tilt (circular optical front ring faces user)
    y: 90,    // Final yaw turn
    z: -90   // Final upright roll angle
  },

  // 10. SECTION 2 — EXTRA SPIN DURING PIN SCROLL (Additional spin accumulated while scrolling)
  // Add degrees here for extra spin motion (e.g. { x: 0, y: 180, z: 360 } for a full spin/roll)
  pinExtraSpin: {
    x: 0,    // Additional Pitch spin degrees over pin scroll
    y: 0,    // Additional Yaw spin degrees over pin scroll
    z: 0     // Additional Roll spin degrees over pin scroll (e.g. 180 or 360 for barrel roll)
  },

  // 11. SCROLL TIMING & SCRUB SMOOTHNESS CONTROL
  cardScrollDistance: 450, // Scroll height (px) per card during Section 2 pin lock
  flyInScrub: 1.2,        // Hero -> Sec 2 transition scrub smoothness (higher = smoother lerp)
  pinScrub: 1.5,          // Section 2 pin scroll scrub smoothness
  scrollRollSpinIntensity: 0.0, // Stable roll transition during hero -> sec 2 fly-in (no tilt action)

  // 12. SECTION 3 (SHOWREEL) FADE-OUT CONTROLS
  fadeOutOnNextSection: true,  // Automatically fade lens out when scrolling to Showreel section
  fadeOutStart: 'top 80%',    // When Showreel section top reaches 80% of viewport, fade begins
  fadeOutEnd: 'top 25%',      // When Showreel section top reaches 25% of viewport, lens is 100% hidden
  canvasFadeScrub: 1.0,       // Smoothness of opacity fade-out transition

  // 13. WOBBLE & PARALLAX PHYSICS
  enableWobble: false,
  wobbleIntensity: 0.00,
  wobbleSpeed: 0.4,
  enableMouseParallax: true,
  mouseSensitivityX: 0.18,
  mouseSensitivityY: 0.10,

  // 14. STUDIO LIGHTING & EXPOSURE
  ambientBrightness: 1.4,
  keyLightBrightness: 5.0,
  fillLightBrightness: 2.5,
  rimLightBrightness: 3.5,
  rimLightColor: 0xd4af37,
  exposure: 1.45,

  // 15. SOLID OPAQUE FINISH & SPIN CONTROL
  // stopSpinOnScroll: false → lens rotates CONTINUOUSLY until the off-white paper section covers it
  stopSpinOnScroll: false,


  isSolid: true,

  // 16. SECTION 2 SPLIT BACKGROUND CURVE CONFIGURATION
  // Adjust these values to easily customize the right-curving arc boundary!
  // Increase centerCurveX for a deeper curve; decrease towards topStartX for a flatter curve.
  bgCurve: {
    topStartX: 480,     // Top edge X position (0-1000 scale, 480 = 48%)
    bottomEndX: 480,    // Bottom edge X position (0-1000 scale, 480 = 48%)
    centerCurveX: 570,  // Max right curve bulge position (535 = subtle curve, 600+ = deeper curve)
    topControlY: 280,   // Top Bezier control height (0-1000)
    bottomControlY: 720 // Bottom Bezier control height (0-1000)
  }
};

export class Hero3D {
  constructor(config = LENS_CONFIG) {
    this.config = config;
    this.container = document.querySelector('#hero-3d-container');
    this.canvas = document.querySelector('#hero-lens-canvas');

    if (!this.container || !this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pivotGroup = null;
    this.lensModel = null;
    this.animFrameId = null;

    // Direct axis spin accumulators
    this.spinAngleX = 0;
    this.spinAngleY = 0;
    this.spinAngleZ = 0;

    // Scroll progress trackers (Target & Smoothly Lerped Current)
    this.scrollProgress = 0;       // Hero → Section 2 fly-in target
    this.currentScrollProgress = 0; // Lerped value for buttery smooth frames

    this.pinScrollProgress = 0;    // Section 2 pin scroll target
    this.currentPinProgress = 0;   // Lerped value for pin scroll

    this.targetCanvasOpacity = 1.0; // Section 3 fade target (1 = visible, 0 = hidden)
    this.currentCanvasOpacity = 1.0;

    // How much the paper-reveal section has covered Section 2 (0 = not covered, 1 = fully covered)
    this.coverProgress = 0;
    this.currentCoverProgress = 0;

    // Mouse parallax tracking
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.currentMouseX = 0;
    this.currentMouseY = 0;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.loadModel();
    this.bindEvents();
    this.updateBgCurve();
    this.opticsWheel = new OpticsWheel();
    this.setupScrollTrigger();
    this.animate();
  }

  /**
   * Dynamically applies the bgCurve parameters from LENS_CONFIG onto the SVG path.
   * Customize bgCurve in LENS_CONFIG (at top of file) to tweak curvature anytime!
   */
  updateBgCurve() {
    const curvePath = document.querySelector('#optics-bg-curve-path');
    if (!curvePath || !this.config.bgCurve) return;
    const { topStartX, bottomEndX, centerCurveX, topControlY, bottomControlY } = this.config.bgCurve;
    const pathD = `M 0,0 L ${topStartX},0 C ${centerCurveX},${topControlY} ${centerCurveX},${bottomControlY} ${bottomEndX},1000 L 1000,1000 L 1000,0 Z`;
    curvePath.setAttribute('d', pathD);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.pivotGroup = new THREE.Group();
    this.scene.add(this.pivotGroup);
  }

  setupCamera() {
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, this.config.cameraDistance || 4.3);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.exposure;
  }

  setupLights() {
    // 1. Soft Ambient Base
    const ambientLight = new THREE.AmbientLight(0xffffff, this.config.ambientBrightness);
    this.scene.add(ambientLight);

    // 2. Top Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, this.config.keyLightBrightness);
    keyLight.position.set(0, 8, 4);
    this.scene.add(keyLight);

    // 3. Front Fill Light
    const frontLight = new THREE.DirectionalLight(0xe4e4e7, this.config.fillLightBrightness);
    frontLight.position.set(0, 2, 6);
    this.scene.add(frontLight);

    // 4. Gold Rim Accent Light
    const rimLight = new THREE.DirectionalLight(this.config.rimLightColor, this.config.rimLightBrightness);
    rimLight.position.set(-5, 3, -2);
    this.scene.add(rimLight);

    // 5. Specular Glare Point Light
    const glassGlare = new THREE.PointLight(0xffffff, 4.0, 10);
    glassGlare.position.set(0, 1.5, 3);
    this.scene.add(glassGlare);
  }

  loadModel() {
    const loader = new GLTFLoader();
    const modelUrl = this.config.modelPath;

    loader.load(
      modelUrl,
      (gltf) => {
        this.lensModel = gltf.scene;

        // Center model inside pivot safely
        const box = new THREE.Box3().setFromObject(this.lensModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        if (Number.isFinite(center.x) && Number.isFinite(center.y) && Number.isFinite(center.z)) {
          this.lensModel.position.set(-center.x, -center.y, -center.z);
        } else {
          this.lensModel.position.set(0, 0, 0);
        }

        // Scale model based on LENS_CONFIG safely
        const maxDim = Math.max(size.x || 0, size.y || 0, size.z || 0);
        this.baseScaleFactor = (maxDim > 0 && Number.isFinite(maxDim)) ? (1.0 / maxDim) : 1.0;
        const initialScale = (this.config.scale || 3.1) * this.baseScaleFactor;
        this.lensModel.scale.set(initialScale, initialScale, initialScale);

        // Adjust materials for solid finish
        this.lensModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (!mat) return;
              try {
                if (this.config.isSolid !== false) {
                  mat.transparent = false;
                  mat.opacity = 1.0;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.side = THREE.DoubleSide;
                }
                if (typeof mat.roughness === 'number') mat.roughness = 0.25;
                if (typeof mat.metalness === 'number') mat.metalness = 0.85;
                mat.needsUpdate = true;
              } catch (matErr) {
                console.warn('Material adjustment notice:', matErr);
              }
            });
          }
        });

        // Add model inside pivot group
        this.pivotGroup.add(this.lensModel);

        // Set initial position from heroPosition config
        const startX = this.config.heroPosition?.x || 0;
        const startY = this.config.heroPosition?.y || 0;
        const startZ = this.config.heroPosition?.z || 0;
        this.pivotGroup.position.set(startX, startY, startZ);

        // Convert initial rotation angles from degrees to radians
        this.baseRadX = (this.config.initialRotationDeg.x * Math.PI) / 180;
        this.baseRadY = (this.config.initialRotationDeg.y * Math.PI) / 180;
        this.baseRadZ = (this.config.initialRotationDeg.z * Math.PI) / 180;

        this.pivotGroup.rotation.set(this.baseRadX, this.baseRadY, this.baseRadZ);

        this.container.classList.add('is-loaded');
      },
      undefined,
      (err) => {
        console.warn('3D Lens Model loading fallback:', err);
      }
    );
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width && height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
  }

  setupScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // ── PHASE 1: Hero → Section 2 fly-in scroll progress ──────────────────────
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom 90%',
      endTrigger: '#optics-showcase',
      end: 'top 30%',
      scrub: this.config.flyInScrub ?? 1.2,
      onUpdate: (self) => {
        this.scrollProgress = self.progress;
      }
    });

    // ── PHASE 2 & 3: Section 2 PIN & Paper Reveal Overlay ───────────────────
    const wheelItems = document.querySelectorAll('.wheel-item');
    const numCards = wheelItems.length || 5;
    const cardScrollDistance = this.config.cardScrollDistance || 450;
    const paperRevealDistance = window.innerHeight; // 1 viewport height for off-white paper reveal
    const totalPinDistance = (numCards * cardScrollDistance) + paperRevealDistance;
    const cardFraction = (numCards * cardScrollDistance) / totalPinDistance;

    // GSAP timeline for the pinned section
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#optics-showcase',
        start: 'top top',
        end: `+=${totalPinDistance}`,
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const rawP = self.progress;
          if (rawP <= cardFraction) {
            // Cards active phase
            this.pinScrollProgress = rawP / cardFraction;
            this.coverProgress = 0.0;
            this.targetCanvasOpacity = 1.0;
            if (this.opticsWheel) {
              this.opticsWheel.updateProgress(this.pinScrollProgress);
            }
          } else {
            // Paper reveal overlay phase
            this.pinScrollProgress = 1.0;
            if (this.opticsWheel) {
              this.opticsWheel.updateProgress(1.0);
            }
            const paperCoverP = (rawP - cardFraction) / (1.0 - cardFraction);
            this.coverProgress = Math.min(1.0, Math.max(0.0, paperCoverP));
            this.targetCanvasOpacity = 1.0 - this.coverProgress;
          }
        }
      }
    });
  }

  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Update circular optics wheel smooth lerp
    if (this.opticsWheel) {
      this.opticsWheel.updateWheel(0.12);
    }

    // Smooth Lerp Damping for scroll progress values (gives 60fps cinematic fluidity)
    this.currentScrollProgress += (this.scrollProgress - this.currentScrollProgress) * 0.08;
    this.currentPinProgress += (this.pinScrollProgress - this.currentPinProgress) * 0.08;
    this.currentCoverProgress += (this.coverProgress - this.currentCoverProgress) * 0.08;
    this.currentCanvasOpacity += (this.targetCanvasOpacity - this.currentCanvasOpacity) * 0.08;

    // Animate Section 2 split background right-curved reveal on Hero -> Sec 2 scroll transition
    const bgRightWrap = document.querySelector('#optics-bg-right-wrap');
    if (bgRightWrap) {
      const scrollP = Math.max(0, Math.min(1, this.currentScrollProgress));
      const translateX = (1 - scrollP) * 100;
      bgRightWrap.style.transform = `translateX(${translateX.toFixed(2)}%)`;
      bgRightWrap.style.opacity = `${Math.min(1, scrollP * 1.5).toFixed(3)}`;
    }

    // Apply smooth opacity to 3D Canvas element
    if (this.canvas) {
      const alpha = Math.max(0, Math.min(1, this.currentCanvasOpacity));
      this.canvas.style.opacity = alpha.toFixed(4);
      if (alpha < 0.005) {
        this.canvas.style.visibility = 'hidden';
      } else {
        this.canvas.style.visibility = 'visible';
      }
    }

    // Smooth Lerp Damping for mouse parallax
    this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.05;
    this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.05;

    if (this.pivotGroup && this.lensModel) {
      const scrollP = this.currentScrollProgress;
      const pinP = this.currentPinProgress;

      // Continuous spin factor: keeps rotating until paper-reveal section fully covers it
      // coverProgress = 0 → full spin; coverProgress = 1 → paper has covered, stop makes sense
      const spinFactor = this.config.stopSpinOnScroll
        ? Math.max(0, 1 - this.currentCoverProgress * 1.2)
        : 1.0;

      // Accumulate direct axis spin based on LENS_CONFIG
      const speedX = (this.config.spinAxisSpeed.x || 0) * spinFactor;
      const speedY = (this.config.spinAxisSpeed.y || 0) * spinFactor;
      const speedZ = (this.config.spinAxisSpeed.z || 0) * spinFactor;

      this.spinAngleX += speedX;
      this.spinAngleY += speedY;
      this.spinAngleZ += speedZ;

      // Precession wobble if enabled
      const wobbleX = this.config.enableWobble ? Math.sin(time * this.config.wobbleSpeed) * this.config.wobbleIntensity * spinFactor : 0;
      const wobbleZ = this.config.enableWobble ? Math.cos(time * this.config.wobbleSpeed) * this.config.wobbleIntensity * spinFactor : 0;

      // Mouse parallax offsets
      const yawOffset = this.config.enableMouseParallax ? this.currentMouseX * this.config.mouseSensitivityX : 0;
      const pitchOffset = this.config.enableMouseParallax ? this.currentMouseY * this.config.mouseSensitivityY : 0;

      // Section 2 Initial (Arrival) Rotation in Radians
      const sec2ArrX = ((this.config.section2InitialRotation?.x ?? 55) * Math.PI) / 180;
      const sec2ArrY = ((this.config.section2InitialRotation?.y ?? -15) * Math.PI) / 180;
      const sec2ArrZ = ((this.config.section2InitialRotation?.z ?? -60) * Math.PI) / 180;

      // Section 2 Final Target Rotation in Radians
      const sec2FinalX = ((this.config.section2RotationDeg?.x ?? 75) * Math.PI) / 180;
      const sec2FinalY = ((this.config.section2RotationDeg?.y ?? 0) * Math.PI) / 180;
      const sec2FinalZ = ((this.config.section2RotationDeg?.z ?? -90) * Math.PI) / 180;

      // Extra spin accumulated during pin scroll
      const extraSpinX = (((this.config.pinExtraSpin?.x || 0) * Math.PI) / 180) * pinP;
      const extraSpinY = (((this.config.pinExtraSpin?.y || 0) * Math.PI) / 180) * pinP;
      const extraSpinZ = (((this.config.pinExtraSpin?.z || 0) * Math.PI) / 180) * pinP;

      const baseRadX = ((this.config.initialRotationDeg?.x || 0) * Math.PI) / 180;
      const baseRadY = ((this.config.initialRotationDeg?.y || 0) * Math.PI) / 180;
      const baseRadZ = ((this.config.initialRotationDeg?.z || 0) * Math.PI) / 180;

      // Phase 1: Hero standing pose -> Section 2 arrival pose (fly-in)
      const arrivalX = THREE.MathUtils.lerp(baseRadX + this.spinAngleX + wobbleX + pitchOffset, sec2ArrX + pitchOffset, scrollP);
      const arrivalY = THREE.MathUtils.lerp(baseRadY + this.spinAngleY + yawOffset, sec2ArrY + yawOffset, scrollP);
      const rollSpinIntensity = this.config.scrollRollSpinIntensity ?? 0.75;
      const rollTransition = Math.sin(scrollP * Math.PI) * rollSpinIntensity;
      const arrivalZ = THREE.MathUtils.lerp(baseRadZ + wobbleZ, sec2ArrZ, scrollP) + rollTransition;

      // Phase 2: Section 2 arrival pose -> Section 2 final target pose + pin extra spin
      const pitchRad = THREE.MathUtils.lerp(arrivalX, sec2FinalX + pitchOffset, pinP) + extraSpinX;
      const yawRad = THREE.MathUtils.lerp(arrivalY, sec2FinalY + yawOffset, pinP) + extraSpinY;
      const rollRad = THREE.MathUtils.lerp(arrivalZ, sec2FinalZ, pinP) + extraSpinZ;

      this.pivotGroup.rotation.set(pitchRad, yawRad, rollRad);

      // Dynamic Scale lerp between Hero Scale and Section 2 Scale
      const heroScale = this.config.scale || 3.1;
      const sec2Scale = this.config.section2Scale ?? heroScale;
      const currentScale = THREE.MathUtils.lerp(heroScale, sec2Scale, scrollP);
      const baseScale = this.baseScaleFactor || (1 / 2.1);
      const finalModelScale = baseScale * currentScale;

      this.lensModel.scale.set(finalModelScale, finalModelScale, finalModelScale);

      // Interpolate X, Y, Z position between Hero position and Section 2 position
      const heroX = this.config.heroPosition?.x || 0;
      const heroY = this.config.heroPosition?.y || 0;
      const heroZ = this.config.heroPosition?.z || 0;

      const sec2X = this.config.section2Position?.x ?? -1.35;
      const sec2Y = this.config.section2Position?.y ?? -0.05;
      const sec2Z = this.config.section2Position?.z ?? 0.2;

      const posX = THREE.MathUtils.lerp(heroX, sec2X, scrollP);
      const posY = THREE.MathUtils.lerp(heroY, sec2Y, scrollP) + ((1 - scrollP) * Math.sin(time * 1.2) * 0.02);
      const posZ = THREE.MathUtils.lerp(heroZ, sec2Z, scrollP);

      this.pivotGroup.position.set(posX, posY, posZ);
    }

    // Section 2 to 3 Transition: Animate background curve to completely fill screen with white
    const bgCurvePath = document.getElementById('optics-bg-curve-path');
    if (bgCurvePath && this.config.bgCurve) {
      const baseTopX = this.config.bgCurve.topStartX ?? 480;
      const baseBottomX = this.config.bgCurve.bottomEndX ?? 480;
      const baseCenterX = this.config.bgCurve.centerCurveX ?? 570;
      const cTopY = this.config.bgCurve.topControlY ?? 280;
      const cBotY = this.config.bgCurve.bottomControlY ?? 720;
      
      // As coverProgress goes 0 -> 1, the curve moves completely to 0 (filling screen with white)
      const currentTopX = baseTopX * (1 - this.currentCoverProgress);
      const currentBottomX = baseBottomX * (1 - this.currentCoverProgress);
      const currentCenterX = baseCenterX * (1 - this.currentCoverProgress);

      bgCurvePath.setAttribute('d', `M 0,0 L ${currentTopX},0 C ${currentCenterX},${cTopY} ${currentCenterX},${cBotY} ${currentBottomX},1000 L 1000,1000 L 1000,0 Z`);
    }

    // Fade out Section 2 UI content as paper reveal happens
    const opticsGrid = document.querySelector('.optics-grid');
    if (opticsGrid) {
      opticsGrid.style.opacity = (1 - this.currentCoverProgress).toFixed(3);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default Hero3D;
