# Design Language & Philosophy Documentation

*A comprehensive analysis of endarthur.github.io*

---

## Table of Contents

1. [Core Design Philosophy](#core-design-philosophy)
2. [Visual Design Language](#visual-design-language)
3. [Technical Architecture Philosophy](#technical-architecture-philosophy)
4. [Acknowledged Influences](#acknowledged-influences)
5. [Unacknowledged/Possible Influences](#unacknowledgedpossible-influences)
6. [Similar Projects & People to Know](#similar-projects--people-to-know)
7. [Tool Inventory & Analysis](#tool-inventory--analysis)
8. [Enhancement Proposals](#enhancement-proposals)

---

## Core Design Philosophy

### The "Computatro et Malleo" Ethos

Your site embodies a fusion of traditional geological fieldwork ("et Malleo" - and hammer) with computational methods ("Computatro"). This isn't just a tagline—it permeates every design decision:

1. **Tools over Content**: Unlike typical developer portfolios that showcase finished products, your site *is* the product. The index.html isn't a landing page—it's a functional geological compass.

2. **Educational Interactivity**: Every "article" is actually an interactive tool with embedded education. The desurvey page doesn't just explain the math—it lets you manipulate drillhole data in real-time.

3. **Domain-First Design**: The stereoplot on your homepage isn't decoration—it's the primary UI element. You've rejected the blog-with-sidebar paradigm in favor of domain-specific interfaces.

4. **Permanence & Archival Consciousness**: Following Gwern's methodology, you archive external links and timestamp everything. This reflects a long-term thinking approach rare in web development.

### Anti-Patterns You Reject

- **No tracking**: Explicitly stated, philosophically committed
- **No build systems**: Pure HTML/CSS/JS without npm, webpack, or transpilation
- **No frameworks**: Vanilla JS with IIFE module patterns
- **No CDN dependencies for core functionality**: Libraries are vendored locally
- **No comment systems**: GitHub issues for feedback (decentralized, persistent)

---

## Visual Design Language

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Headings | `#555f61` | Slate blue-gray, professional restraint |
| Body text | `#144270` | Deep blue, high readability |
| Links | `#704214` | Sepia brown, deliberately un-weblike |
| Accent/Error | `#e9162d` | Geological red (measurement indicators) |
| Data points | `#373d3f` | Charcoal, neutral emphasis |
| Line orientation | `#144270` | Matches body text |

This palette is *geological*—these are colors you'd find on a geological map (lithological units, structural symbols). The brown links evoke aged paper and field notebooks.

### Typography

- **Source Sans Pro** (300, 400 weights): A humanist sans-serif that balances technical clarity with warmth
- Light weight for elegant headings
- Regular weight for readable body text
- Monospace fallback for code contexts

### Layout Principles

1. **Grid-First**: CSS Grid with named areas (`stereo`, `intro`, `repos`, etc.)
2. **Content-Aware Responsiveness**: Portrait mode reorganizes for mobile field use
3. **SVG-Native Graphics**: Vector precision for scientific visualization
4. **Coordinate System Respect**: `transform: scale(100, -100)` to match geological convention (y-up)

### Iconography

Custom SVG icons for:
- Lock/unlock (measurement locking)
- Plane/line toggle (geological symbolism)
- Compass trigger (field-work metaphor)

These aren't generic icons—they're *domain-specific affordances*.

---

## Technical Architecture Philosophy

### The IIFE Module Pattern

```javascript
var Auttitude = (function () {
    // private implementation
    var Module = {};
    Module.degrees = degrees;
    // ...
    return Module;
})();
```

This pattern:
- Works without build tools
- Provides encapsulation
- Allows progressive enhancement
- Maintains IE11 compatibility (noted in meta tags)

### Progressive Enhancement Strategy

1. **Base layer**: Semantic HTML that works without JS
2. **Enhancement layer**: JavaScript adds interactivity
3. **Fallback layer**: GyroNorm → deviceorientation event

### Data Flow Architecture

```
User Input → Device Sensors → Math Library (autti.js) → SVG DOM Manipulation
                                    ↓
                              Projection Math
                                    ↓
                              Visual Feedback
```

### Storage Strategy

- **LocalForage**: IndexedDB wrapper for model persistence
- **LZ-String**: Compression for URL-shareable state
- **No server state**: Everything client-side

---

## Acknowledged Influences

From your `site.html`:

1. **Gwern Branwen** (gwern.net)
   - Archival methodology (Internet Archive links)
   - Long-form technical writing
   - Timestamp metadata
   - Dark theme aesthetic sensibility

2. **Alice Maz** (alicemaz.com)
   - Personal site as portfolio of thought
   - Technical depth with accessibility

3. **Daring Fireball** (John Gruber)
   - Footnote system implementation
   - Clean typography focus

4. **Movable Type Ltd** (movable-type.co.uk)
   - Interactive JavaScript calculators
   - Geodetic/geographic computation tutorials
   - Practical code examples with explanations

---

## Unacknowledged/Possible Influences

Based on your design patterns, I suspect resonance with:

### 1. **100 Rabbits** (100r.co)
*As I mentioned before—you'd love them*

- Minimal, tool-focused aesthetic
- Offline-first philosophy
- Custom domain-specific tools (Orca, Left, Nasu)
- Sailing + computation lifestyle
- They build tools for themselves first

**Why this fits**: Your compass app, ECMAltine, and location tools share their "useful artifact" philosophy.

### 2. **Bret Victor** (worrydream.com)
- Interactive explanations of complex concepts
- "Explorable explanations" genre
- Tools for thought

**Connection**: Your desurvey.html is essentially an explorable explanation. The interactive 3D visualization with live data editing embodies his "Inventing on Principle" talk.

### 3. **Mike Bostock / Observable** (observablehq.com)
- Data visualization as primary medium
- Reactive notebooks for exploration
- D3.js/SVG-native thinking

**Connection**: Your SVG stereoplot work and the auttiplot.js library follow similar principles.

### 4. **Edward Tufte**
- Information density without clutter
- Small multiples concept
- Chartjunk avoidance

**Connection**: Your stereoplot is pure Tufte—maximum data, minimum ink.

### 5. **Doug Engelbart / Alan Kay**
- "Augmenting Human Intellect"
- Tools that extend domain expertise

**Connection**: The compass app extends a geologist's cognition into digital space.

### 6. **Christopher Alexander** (A Pattern Language)
- Design patterns as solutions to recurring problems
- Human-centered design philosophy

**Connection**: Your reusable modules (autti.js, auttiplot.js, desurvey.js) are essentially pattern implementations.

### 7. **The Demo Scene / Retro Computing**
- Your CHIP-8 emulator reveals interest
- Constraint-based creativity
- Appreciation for computational history

**Connection**: "Necromancy or Raising the Soul of a (once) New Machine" section title

---

## Similar Projects & People to Know

### Geoscience + Web Development

1. **Software Underground** (softwareunderground.org)
   - Community of geoscience + code practitioners
   - TRANSFORM conference (you've presented!)
   - Agile Scientific adjacent

2. **Matt Hall / Agile Scientific** (agilescientific.com)
   - Python for geoscience
   - Bruges, welly, striplog libraries
   - Similar "tools for practitioners" philosophy

3. **Simon Willison** (simonwillison.net)
   - Datasette, sqlite-utils
   - "Small tools loosely joined"
   - TIL (Today I Learned) documentation style

4. **Tom MacWright** (macwright.com)
   - Simple, mapbox background
   - D3, documentation-focused
   - Big (presentation tool)

5. **Mapbox / Felt / deck.gl Community**
   - WebGL geospatial visualization
   - Your AR/XR work aligns

### Interactive Visualization

6. **Bartosz Ciechanowski** (ciechanow.ski)
   - Deep interactive technical explanations
   - Similar to your desurvey approach but even deeper

7. **Amit Patel / Red Blob Games** (redblobgames.com)
   - Interactive tutorials on algorithms
   - Procedural generation, pathfinding
   - Your interpolation work connects

8. **Nicky Case** (ncase.me)
   - Explorable explanations
   - "Seeing Theory" style

9. **Distill.pub** (now archived)
   - Academic interactive visualization
   - Machine learning explanations

### Toolmakers & Craftspeople

10. **Devine Lu Linvega** (xxiivv.com)
    - The 100 Rabbits co-founder
    - Uxn virtual machine
    - Personal wiki/knowledge base

11. **Andy Matuschak** (andymatuschak.org)
    - Tools for thought research
    - Evergreen notes concept
    - Your timestamp system connects

12. **Omar Rizwan** (omar.website)
    - TabFS, Screenotate
    - Unusual tool builder

13. **Maggie Appleton** (maggieappleton.com)
    - Visual essays
    - Digital gardening

### Domain-Specific Tool Builders

14. **Paul Shortino** (Visible Geology)
   - Web-based structural geology visualization
   - Similar domain!

15. **GemPy Team** (gempy.org)
   - You contribute to GemGIS
   - 3D geological modeling in Python

16. **Pyvista / Vista.js Community**
   - 3D visualization in browser
   - Your Three.js work aligns

### WebXR/AR Geospatial

17. **A-Frame Community** (aframe.io)
   - You're already using it
   - AR.js maintainers

18. **three.js Examples Gallery**
   - Your ECMAltine extends their patterns

---

## Tool Inventory & Analysis

### Core Libraries (Authored)

#### 1. autti.js (Attitude Library)
**Purpose**: Stereographic projection mathematics
**Quality**: Solid implementation

**Current capabilities**:
- Vector operations (dot, cross, norm, angle)
- Directional data conversions (trend/plunge ↔ direction cosines)
- Euler angle to direction cosines
- Equal-area projection
- Orientation tensor calculation
- Eigenvalue decomposition (3x3 symmetric)
- Great circle generation
- Arc interpolation

**Issues identified**:
- `readEqualArea()` has a bug: `point[0]` used twice instead of `point[0]` and `point[1]`
- No JSDoc documentation
- `orientationTensor()` has potential copy-paste error in `a11` calculation

#### 2. auttiplot.js
**Purpose**: SVG stereoplot visualization
**Status**: Referenced but not read in detail

#### 3. desurvey.js
**Purpose**: Drillhole geometry calculation
**Quality**: Well-implemented Three.js Curve extension

**Current capabilities**:
- Tangent method
- Spherical arc (minimum curvature)
- Segment extraction
- Three.js integration

### Tools (HTML Applications)

#### 1. index.html (Geological Compass)
**Status**: Functional, production-quality
**Platform**: Mobile (Android/iOS with sensors)

**Analysis**:
- Clean SVG-based UI
- GyroNorm integration with fallback
- Lock/toggle mechanics well-implemented
- Responsive grid layout

**Issues**:
- No calibration guidance for users
- No data export functionality
- No accuracy indicator

#### 2. tools/location.html (Location Sharing)
**Status**: Functional prototype
**Dependencies**: PeerJS, Leaflet

**Analysis**:
- P2P architecture (privacy-preserving)
- Web Share API integration
- Leaflet map with accuracy circles

**Issues**:
- `dataHook()` sends to localhost:8008 (hardcoded)
- No error handling for Share API rejection
- Missing connection status persistence

#### 3. tools/screen.html (Screen Sharing)
**Status**: Not reviewed in detail
**Dependencies**: PeerJS

#### 4. tools/ECMAltine.html (3D Geology Modeler)
**Status**: Advanced prototype
**Dependencies**: Three.js, CodeMirror, Tern.js

**Analysis**:
- Live code editing with 3D preview
- Custom DSL for geological modeling:
  - `Plane(dd, d)` - planar orientation
  - `PlanarSurface()` - distance function
  - `PlanarFault()` - fault displacement
  - `SinusoidalFold()` - fold geometry
  - `Lith()` - lithological unit
  - `Model()` - event sequence
- 3D texture (DataTexture3D) for volume rendering
- Transform controls for section manipulation

**Issues**:
- No error boundary for user code
- JSHint loaded from unpkg (external dependency)
- No save/load functionality
- Section selection UI is hidden until double-click

#### 5. writing/desurvey.html (Drillhole Visualizer)
**Status**: Production-quality educational tool
**Dependencies**: Three.js, MathJax, localforage, lz-string

**Analysis**:
- Excellent mathematical documentation
- Interactive data entry (Importabular)
- 3D visualization with OrbitControls
- GLTF export capability
- AR/XR launch integration

**Issues**:
- URL state compression commented out
- No undo/redo for data entry
- Missing keyboard shortcuts documentation

#### 6. AR Tools (ar.html, ar_load.html, xr_load.html, etc.)
**Status**: Various states of completion
**Dependencies**: A-Frame, AR.js, WebXR

**Analysis**:
- Marker-based AR (Hiro marker)
- Gesture handling for manipulation
- GLTF model loading from localforage

#### 7. writing/chip8.html (CHIP-8 Emulator)
**Status**: Educational/hobby project

#### 8. os.html (Stereoplot Viewer)
**Status**: Work in progress ("Missing a lot")

---

## Enhancement Proposals

### High Priority (Bug Fixes)

#### 1. Fix `readEqualArea()` in autti.js
```javascript
// Current (buggy):
function readEqualArea(point) {
    X = point[0] * sqrt2;
    Y = point[0] * sqrt2;  // BUG: should be point[1]
    // ...
}

// Fixed:
function readEqualArea(point) {
    const X = point[0] * sqrt2;
    const Y = point[1] * sqrt2;
    // ...
}
```

#### 2. Fix `orientationTensor()` in autti.js
```javascript
// Current (potential bug):
a11 += x[1]*x[2];  // Should this be x[1]*x[1]?

// Verify the tensor construction:
// [a00 a01 a02]   [xx xy xz]
// [a01 a11 a12] = [xy yy yz]
// [a02 a12 a22]   [xz yz zz]
```

#### 3. Remove hardcoded localhost in location.html
```javascript
// Make dataHook configurable or remove if unused
function dataHook(data) {
    const hookUrl = localStorage.getItem('locationHookUrl');
    if (!hookUrl) return;
    // ...
}
```

### Medium Priority (Improvements)

#### 4. Add JSDoc to autti.js
```javascript
/**
 * Project a 3D vector onto the equal-area stereonet
 * @param {Vector} vector - Unit vector to project
 * @returns {number[]} [x, y] coordinates on projection
 */
function projectEqualArea(vector) {
    // ...
}
```

#### 5. Add compass calibration UI
- Show magnetic declination warning
- Add "calibrate" gesture (figure-8)
- Display sensor accuracy indicator

#### 6. Add data export to compass
- Copy to clipboard button
- CSV download for session
- Share via Web Share API

#### 7. Modernize module pattern (optional)
If you ever want ES modules without breaking compatibility:
```javascript
// autti.js - dual format
var Auttitude = (function () {
    // ... existing code ...
    return Module;
})();

// For ES module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auttitude;
}
```

### Low Priority (Nice to Have)

#### 8. Add offline support (Service Worker)
Given your offline-first philosophy, a service worker would be valuable:
```javascript
// sw.js - cache essential assets
const CACHE_NAME = 'endarthur-v1';
const urlsToCache = [
    '/',
    '/endarthur.css',
    '/js/autti.js',
    '/js/gyronorm.complete.min.js'
];
```

#### 9. Add dark mode
Given your Gwern influence, a dark mode toggle would fit:
```css
@media (prefers-color-scheme: dark) {
    body { background-color: #1a1a1a; }
    h1, h2 { color: #a0a8ab; }
    p { color: #8cacca; }
    /* ... */
}
```

#### 10. ECMAltine improvements
- Add save/load to localforage
- Add example gallery
- Add error boundary with helpful messages
- Document the DSL

#### 11. Unified navigation
Consider a minimal header across all tools:
```html
<nav class="site-nav">
    <a href="/">compass</a> |
    <a href="/site.html">about</a> |
    <a href="/tools/">tools</a>
</nav>
```

### Documentation Suggestions

#### 12. Tool index page
Create `/tools/index.html` listing all tools with descriptions

#### 13. API documentation for autti.js
Either JSDoc or a simple markdown file

#### 14. Contributing guide
If you want community contributions to OpenStereo/GemGIS ecosystem

---

## Summary

Your site represents a distinctive approach to personal web presence:

**Strengths**:
- Domain expertise deeply integrated into design
- Privacy-respecting, future-proof architecture
- Interactive educational content
- Clean, intentional visual language
- No-nonsense technical implementation

**Philosophical Alignment**:
- Tools for thought movement
- Explorable explanations genre
- Small web / indie web values
- Scientific communication innovation

**Areas for Growth**:
- Bug fixes in core math library
- Documentation for reusability
- Offline-first completion (service worker)
- Tool discoverability (navigation)

Your work sits at an interesting intersection: geological domain expertise, web development craftsmanship, and educational tool design. The people and projects listed above share various aspects of this intersection and may offer inspiration, collaboration opportunities, or simply kindred spirits in the indie web.

---

*Generated 2024-12-01 | For endarthur.github.io*
