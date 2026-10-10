# PROJECT STARDUST — Master Blueprint & Build Workflow

> **Last Updated:** 2026-10-01
> **Status:** In Progress
> **Stack:** Vanilla HTML + CSS + JavaScript (no frameworks, pure craft)

---

## Brand Identity

| Property | Value |
|---|---|
| Company Name | Project Stardust |
| Industry | Video Production / Cinematography / Creative Studio |
| Personality | Minimal Noir, High-Fashion Cinematic, Pitch-Black Obsidian, Visionary |
| Target Audience | Premier Brands, A-list Directors, Agencies, Film Studios |
| Color Palette | Pitch-Black Noir #050508, Obsidian Charcoal #09090E, Minimal Card #0C0C12, Champagne Gold #D4AF37, Pure Platinum #F4F4F8 |
| Typography | Display: Cabinet Grotesk (modern grotesque, high fashion) / Noir Accent: Instrument Serif (sleek editorial italic) / Body: Plus Jakarta Sans / Mono: Space Grotesk |

---

## Reference Analysis

### WaveRun Media (waverunmedia.com)
- Key Patterns: Fullscreen hero video/reel, dark overlay compositions, service tabs with smooth transitions, strong typography hierarchy, scroll-triggered animations
- Borrowed: Tab-based service showcase, reel/showreel section, client logo strip, process timeline
- Animation Style: Smooth fade-in-bottom, staggered content reveals, CSS clip-path reveals

### Osmo Supply (osmo.supply)
- Key Patterns: CSS marquee ticker bar, custom cursor with drag state, page transitions, dark/light theme toggle, magnetic button hover effects, loading screen animation, scroll-based navbar transformation
- Borrowed: Custom cursor bubble, nav marquee bar, rotating button labels (double-label technique), hamburger overlay nav, loading/preloader animation, smooth scroll philosophy
- Notable Code: `.nfd-wb-fade-in-bottom` pattern, `clip-path: inset()` reveal, CSS marquee with `animation-duration` attribute

### CSS Design Awards (cssdesignawards.com)
- Key Patterns: Card grid with overlay hover states, minimal navigation, project thumbnails with meta overlay, clean section separation
- Borrowed: Project card hover overlay pattern, minimal top navigation, grid project showcase, editorial typography pairing

---

## Architecture

```
ProjectStarDust/
  BLUEPRINT.md              <- This file (always up to date)
  index.html                <- Main entry point (Home)
  work.html                 <- Portfolio / Work showcase
  about.html                <- About the studio
  contact.html              <- Contact page
  css/
    reset.css               <- CSS reset + base
    variables.css           <- Design tokens / custom properties
    typography.css          <- Font imports + typographic system
    animations.css          <- All keyframes + animation classes
    components.css          <- Reusable UI components
    layout.css              <- Grid + spacing system
    main.css                <- Page-specific styles + orchestration
  js/
    loader.js               <- Preloader / page entry animation
    cursor.js               <- Custom cursor logic
    nav.js                  <- Navigation (scroll, overlay, magnetic)
    scroll.js               <- Smooth scroll + scroll-triggered animations
    marquee.js              <- CSS/JS marquee logic
    reel.js                 <- Showreel modal/video logic
    main.js                 <- Orchestrator / init
  assets/
    images/                 <- Generated/placeholder images
    videos/                 <- Video placeholders
```

---

## Page Breakdown

### 1. index.html - Home Page
Sections (top to bottom):
1. Preloader - Full screen black with animated "STARDUST" text dissolve + star particle burst
2. Navbar - Fixed transparent -> blurred on scroll; logo left, nav links center, CTA right; hamburger for mobile
3. Marquee Strip - "We Craft Cinematic Excellence / Visual Stories That Move / " scrolling ticker
4. Hero - 100vh fullscreen; large editorial heading "WE MAKE THINGS MOVE"; animated gradient noise background; floating star particles; dual CTA buttons
5. Showreel - Dark section with blurred video thumbnail, play button, client list marquee below
6. Services - Tab-based service showcase: Film Production / Commercial / Brand Films / Music Videos / Documentary
7. Featured Work - 3-column grid of project cards with hover overlay (like CSSDA pattern)
8. Stats Bar - Horizontal ticker with numbers: "200+ Projects / 50+ Brands / 8 Awards"
9. Process - 4-step horizontal scroll / numbered cards
10. Testimonials - Rotating testimonial with client info
11. CTA Block - Full-width dark section "Ready to tell your story?" with magnetic button
12. Footer - Logo, nav links, socials, copyright

### 2. work.html - Portfolio
- Filterable project grid (All / Film / Commercial / Brand)
- Large project cards with hover overlay effect
- Project categories and descriptions

### 3. about.html - About
- Studio story section
- Team grid with hover effect
- Philosophy / values section
- Awards & recognition strip

### 4. contact.html - Contact
- Split layout (info left, form right)
- Animated form fields
- Location + social links

---

## Design System Tokens

### Colors
```
--color-bg-primary: #080810
--color-bg-secondary: #0D0D2B
--color-bg-card: #111124
--color-accent-gold: #C9A84C
--color-accent-gold-dim: rgba(201, 168, 76, 0.15)
--color-text-primary: #FAFAFA
--color-text-secondary: #A0A0B8
--color-text-dim: #5A5A7A
--color-border: rgba(255, 255, 255, 0.08)
--color-border-hover: rgba(201, 168, 76, 0.4)
```

### Typography Scale
```
--text-display: clamp(3.5rem, 8vw, 9rem)   Hero headlines
--text-hero: clamp(2.5rem, 5vw, 6rem)       Section titles
--text-xl: clamp(1.75rem, 3vw, 3rem)        Card titles
--text-lg: clamp(1.25rem, 2vw, 1.75rem)     Subheadings
--text-md: 1.125rem                          Body large
--text-base: 1rem                            Body
--text-sm: 0.875rem                          Captions, labels
--text-xs: 0.75rem                           Eyebrows, meta
```

### Motion System
```
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1)
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1)
--duration-fast: 200ms
--duration-normal: 400ms
--duration-slow: 700ms
--duration-cinematic: 1200ms
```

---

## Build Checklist

### Phase 1: Foundation
- [x] BLUEPRINT.md created
- [x] css/reset.css
- [x] css/variables.css
- [x] css/typography.css
- [x] css/animations.css
- [x] css/components.css
- [x] css/layout.css
- [x] css/main.css

### Phase 2: JavaScript Modules
- [x] js/loader.js
- [x] js/cursor.js
- [x] js/nav.js
- [x] js/scroll.js
- [x] js/marquee.js
- [x] js/reel.js
- [x] js/main.js

### Phase 3: Pages
- [x] index.html (Home - all 12 sections)
- [x] work.html (Portfolio with filter)
- [x] about.html (About with team, awards)
- [x] contact.html (Contact with form)

### Phase 4: Assets
- [x] Generate hero background texture (hero-bg.png)
- [x] Generate showreel poster image (showreel-poster.png)
- [x] Project card CSS gradient fallbacks
- [ ] Generate additional photography (quota limited — add later)

### Phase 5: Polish
- [x] Intersection Observer animations tuned
- [x] Custom cursor working across all pages
- [x] Smooth scroll behavior (native)
- [x] Mobile responsive (320px - 1920px) — breakpoints in layout.css
- [x] SEO meta tags all pages (OG, Twitter, description)
- [x] Preloader to hero transition logic complete
- [x] Grain film texture overlay (CSS SVG)
- [ ] Cross-browser test (pending user testing)

---

## Animation Inventory

| Element | Trigger | Animation |
|---|---|---|
| Preloader text | On load | Letter-by-letter opacity + Y translate |
| Star particles | On load | Scale + opacity burst from center |
| Preloader exit | After 2.5s | Clip-path swipe up (reveal site) |
| Navbar | Scroll >50px | Backdrop-filter + border-bottom fade in |
| Hero heading | On load (after preloader) | Staggered word slide-up |
| Hero subtext | On load (after heading) | Fade in with 300ms delay |
| Section headings | Scroll intersect | Slide-up + fade from below |
| Card hover | Mouse enter | Scale 1->1.02, overlay opacity 0->1 |
| Service tabs | Click | Content crossfade |
| Stats counter | Scroll intersect | Number count-up animation |
| Custom cursor | Mouse move | Magnetic lag follow |
| Cursor on link | Mouse enter link | Scale bubble expand |
| Marquee | Always | CSS translate3d loop |
| CTA button | Mouse enter | Text double-label slide effect |

---

## Development Notes

- No frameworks - Pure HTML/CSS/JS for maximum performance and craft
- Intersection Observer - Used for all scroll-triggered animations
- CSS custom properties - Full design token system, easy to theme
- Web fonts - Loaded via Google Fonts with display=swap for performance
- Images - Generated via AI for all visual assets, no placeholder rectangles
- Accessibility - ARIA labels, focus states, reduced motion support
- SEO - Full meta tags, Open Graph, semantic HTML5

---

## Update Log

| Date | Phase | Action |
|---|---|---|
| 2026-10-01 | Planning | Blueprint created, references analyzed |
| 2026-10-01 | Phase 1 | CSS foundation files created |
| 2026-10-01 | Phase 2 | JavaScript modules created |
| 2026-10-01 | Phase 3 | index.html Home page created |
| 2026-10-01 | Phase 5 | Redesigned with Minimal Noir aesthetic: Cabinet Grotesk font + Instrument Serif Noir italic accents + Plus Jakarta Sans + Space Grotesk |
| 2026-10-01 | Phase 5 | Implemented Osmo Floating Pill Navigation bar (`.nav-pill`) + attached sub-ticker strip (`.nav-ticker`) across all 4 pages |
| 2026-10-01 | Phase 5 | Fixed layout issues: restored `.nav-overlay` hidden overlay rules, increased hero top clearance, & tuned title line-height |
| 2026-10-01 | Phase 5 | Implemented Osmo Floating Mega-Menu Container Expansion with 3-column structured grid + snappy motion graphics keyframe scaling (`sharpScaleIn`) |
| 2026-10-01 | Phase 5 | Fixed menu blur issue: removed double backdrop-filter blur and applied solid opaque container `#121214` for 100% razor-sharp menu text |
| 2026-10-01 | Phase 5 | Perfected menu contrast & backdrop blur: applied soft 10px page backdrop blur behind navbar, solid dark card `#18181C` / `#222228`, and bright `#FFFFFF` & `#E4E4E7` crisp text |
| 2026-10-01 | Phase 5 | Shifted blur target directly to `<main>` (`filter: blur(14px) brightness(0.65) scale(0.985)` when `body.is-menu-open`), keeping header & mega-menu 100% crystal-clear |
| 2026-10-01 | Phase 5 | Redesigned Hero section to Minimal Film Poster layout: split CLEAN/DUST texture background, monumental `STARDUST` headline with Noir italic accent, top studio header, and authentic movie billing block credits |
| 2026-10-01 | Phase 5 | Updated Hero movie billing block credits: Director, Editor, Sound Design (`JOEFOS`) & Cinematography, Written By, Gaffer (`JIYAD`) |
| 2026-10-01 | Phase 5 | Made `.nav-ticker` animatable: hardware-accelerated infinite 60fps marquee, hover pause & glow `#d9fb77`, pulsing star separators `✦`, and smooth-scroll click navigation |
| 2026-10-01 | Phase 5 | Redesigned Hero page with interactive 3D Camera Lens (`assets/3dModel/camera_lens.glb`) rendered via Three.js: continuous Y-axis rotation, floating sine wave oscillation, cursor parallax tilt, specular studio rim lighting, and cine optics spec overlay badge |
| 2026-10-02 | Phase 5 | Implemented Variable Proximity Text Animation (`js/proximity-text.js`) on Section 3 title (`.portfolio-title`): character splitting, dynamic Cabinet Grotesk variable font weight (`wght` 400->900), scale (1->1.28), vertical lift (-10px), and Champagne Gold color glow (`#D4AF37`) scoped exclusively to mouse hover over `.cinematic-widescreen-frame` |
| 2026-10-06 | Phase 5 | Added Section 3 PinSpacer GSAP ScrollTrigger timeline animation: pins `#paper-reveal` in viewport, smoothly animates blue focal dot indicator from bottom-center to top-left corner above `[ STARDUST STUDIO / 03 ]`, fades out white Selected Portfolio frame, and reveals pitch-black obsidian cine screen showcase in center |
