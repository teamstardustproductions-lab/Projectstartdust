/**
 * STARDUST CACHE & COOKIE QUALITY MANAGER
 * High-performance client-side asset caching & visual quality persistence engine
 *
 * Capabilities:
 * - Cache API (window.caches) for 3D GLTF model & texture binary caching (0ms network load)
 * - Persistent cookies with localStorage fallback for visual quality, motion modes, and returning visitor states
 * - GPU capability benchmarking & adaptive ultra-quality profile (high pixel ratio, max anisotropy, shader pre-warming)
 */

export class CacheQualityManager {
  constructor() {
    this.cacheName = 'stardust-optics-cache-v1';
    this.cookiesSupported = navigator.cookieEnabled;
    this.cacheSupported = 'caches' in window;
    
    this.qualityProfile = this.initQualityProfile();
    this.trackVisit();
  }

  /* ──────────────── COOKIE HELPERS ──────────────── */

  setCookie(name, value, days = 365) {
    try {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (e) {
      // Ignore cookie errors
    }
    // Fallback sync with localStorage
    try {
      localStorage.setItem(name, value);
    } catch (e) {}
  }

  getCookie(name) {
    try {
      const cookies = document.cookie.split(';');
      for (let c of cookies) {
        const [k, v] = c.trim().split('=');
        if (k === name) return decodeURIComponent(v);
      }
    } catch (e) {}
    // Fallback to localStorage
    try {
      return localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  }

  /* ──────────────── QUALITY PROFILE & GPU BENCHMARK ──────────────── */

  initQualityProfile() {
    // Check if user already has cached quality preference in cookies
    let savedQuality = this.getCookie('stardust_visual_quality');
    let motionMode = this.getCookie('stardust_motion_mode') || 'cinematic_slow';

    if (!savedQuality) {
      // Auto-benchmark device capabilities
      const dpr = window.devicePixelRatio || 1;
      const cores = navigator.hardwareConcurrency || 4;
      const memory = navigator.deviceMemory || 8;
      const isHighEnd = cores >= 4 && memory >= 4;

      savedQuality = isHighEnd ? 'ultra' : 'high';
      this.setCookie('stardust_visual_quality', savedQuality, 365);
      this.setCookie('stardust_motion_mode', motionMode, 365);
    }

    const isUltra = savedQuality === 'ultra';

    return {
      quality: savedQuality,
      motionMode: motionMode,
      // Enhanced pixel ratio for ultra-sharp optics without jank
      pixelRatio: isUltra ? Math.min(window.devicePixelRatio || 1, 2.5) : Math.min(window.devicePixelRatio || 1, 2.0),
      anisotropy: isUltra ? 16 : 8,
      lerpDamping: motionMode === 'cinematic_slow' ? 0.045 : 0.08,
      flyInScrub: 2.4, // Slower, weightier GSAP scrub
      isUltra
    };
  }

  trackVisit() {
    const visits = parseInt(this.getCookie('stardust_visits') || '0', 10) + 1;
    this.setCookie('stardust_visits', visits.toString(), 365);
    this.setCookie('stardust_last_active', new Date().toISOString(), 365);
  }

  /* ──────────────── 3D MODEL BINARY CACHE (CACHE STORAGE API) ──────────────── */

  /**
   * Fetches the 3D model with Cache Storage API.
   * If cached: returns binary ArrayBuffer immediately (0ms network latency).
   * If not: fetches from server, stores in Cache Storage, and sets cookie.
   *
   * @param {string} url - Model URL
   * @returns {Promise<{ arrayBuffer: ArrayBuffer, fromCache: boolean }>}
   */
  async fetchModelWithCache(url) {
    if (!this.cacheSupported) {
      // Cache API unsupported: direct fetch
      const resp = await fetch(url);
      const arrayBuffer = await resp.arrayBuffer();
      return { arrayBuffer, fromCache: false };
    }

    try {
      const cache = await caches.open(this.cacheName);
      let cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const arrayBuffer = await cachedResponse.arrayBuffer();
        this.setCookie('stardust_model_cache', 'hit', 30);
        return { arrayBuffer, fromCache: true };
      }

      // Not in cache: fetch and store
      const response = await fetch(url);
      if (response.ok) {
        // Clone for cache storage
        await cache.put(url, response.clone());
        this.setCookie('stardust_model_cache', 'stored', 30);
        const arrayBuffer = await response.arrayBuffer();
        return { arrayBuffer, fromCache: false };
      } else {
        throw new Error(`Failed to fetch model: ${response.status}`);
      }
    } catch (err) {
      console.warn('[Stardust Cache] Cache Storage fallback to direct fetch:', err);
      const fallbackResp = await fetch(url);
      const arrayBuffer = await fallbackResp.arrayBuffer();
      return { arrayBuffer, fromCache: false };
    }
  }

  /**
   * Applies enhanced visual quality & shader cache compilation to Three.js renderer
   */
  applyRendererQuality(renderer, scene, camera) {
    if (!renderer) return;

    // Apply benchmarked / cookie-stored pixel ratio
    renderer.setPixelRatio(this.qualityProfile.pixelRatio);
    renderer.toneMapping = 4; // THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.45;

    // Pre-compile all WebGL shaders to prevent frame drops during first movement
    if (scene && camera) {
      try {
        renderer.compile(scene, camera);
      } catch (e) {
        // Safe fallback
      }
    }
  }

  /**
   * Enhances model mesh materials with max anisotropic filtering
   */
  enhanceMaterials(model, renderer) {
    if (!model) return;
    const maxAnisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 16;
    const targetAnisotropy = Math.min(maxAnisotropy, this.qualityProfile.anisotropy);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (!mat) return;
          // Apply anisotropic filtering to all maps for razor-sharp engravings & reflections
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'envMap'].forEach((mapName) => {
            if (mat[mapName]) {
              mat[mapName].anisotropy = targetAnisotropy;
              mat[mapName].needsUpdate = true;
            }
          });
        });
      }
    });
  }
}

export default CacheQualityManager;
