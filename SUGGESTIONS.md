# General Suggestions & Ideas

*Thoughts on directions, experiments, and possibilities*

---

## 1. Unifying Your Tools Under a Concept

Your tools share a common thread that's not explicitly named: **field-to-digital bridges**. The compass, location sharing, AR desurvey viewer, stereoplot—they all translate between physical fieldwork and digital representation.

**Suggestion**: Consider framing this as a coherent project. Something like:

> **"Campo"** (field in Portuguese/Spanish) — A suite of browser-based tools for field geoscientists

This could:
- Give your scattered tools a home and identity
- Make them more discoverable
- Encourage contributions from the Software Underground community
- Provide a narrative arc for conference talks

A simple `campo.html` landing page linking all field-related tools with a brief manifesto would do it.

---

## 2. The "Explorable Paper" Format

Your desurvey page is already close to what Bret Victor and Distill.pub pioneered: papers where the figures are interactive and the reader can manipulate the data.

**Suggestion**: Formalize this as a format you consciously develop. Your next technical write-up could be structured as:

```
Abstract (static)
    ↓
Interactive Demonstration (play first)
    ↓
Theory (with manipulable equations)
    ↓
Implementation (live code)
    ↓
Your Data (import your own)
```

This inverts the typical paper structure—let people *experience* before they *read*.

Potential topics that would work beautifully in this format:
- Stress tensor visualization (Angelier method)
- Fold geometry classification
- Kriging/variogram exploration
- Paleostress analysis

---

## 3. A "Geological Notation" for the Web

You've built `autti.js` for attitudes and projections. There's an opportunity to create something like **MathJax but for geological notation**—a micro-library that renders:

- Strike/dip symbols: `<geo-attitude dd="120" d="45">` → ⊥ with appropriate symbol
- Stereonet thumbnails: `<stereo-net>` with CSV content → inline SVG
- Structural symbols: `<geo-fold type="antiform" plunge="30">` → standard map symbol

This could be a tiny library (~5KB) that geoscience bloggers/educators could drop into any page. It fills a gap—there's no easy way to put geological notation in web content.

### `<stereo-net>` Custom Element Specification

The simplest, most useful version: a tag whose content is treated as attitude data in CSV-like format:

```html
<stereo-net>
120/45
090/30
045/60, line
270/15, line
</stereo-net>
```

Renders as an inline SVG stereonet with:
- `120/45` and `090/30` as planes (great circles + poles)
- `045/60` and `270/15` as lineations (points only)

#### Full Syntax

```html
<stereo-net
  width="200"
  height="200"
  projection="equal-area"
  grid="true"
  hemisphere="lower">

  # Comments start with #
  # Format: dip_direction/dip [, type] [, color] [, label]

  # Planes (default) - shows great circle + pole
  120/45
  090/30, plane, red
  045/75, plane, blue, S1

  # Lines - shows point only
  270/15, line
  315/45, line, green, L1

  # Pole only (no great circle)
  180/60, pole, orange

  # Can also use strike notation with 'rhr' flag
  # 030/45 rhr = right-hand rule (dip to right of strike)

</stereo-net>
```

#### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `width` | `150` | SVG width in pixels |
| `height` | `150` | SVG height in pixels |
| `projection` | `equal-area` | `equal-area` or `equal-angle` |
| `grid` | `false` | Show reference grid |
| `hemisphere` | `lower` | `lower` or `upper` |
| `notation` | `dip-direction` | `dip-direction` or `strike-rhr` |

#### Implementation Sketch

```javascript
class StereoNet extends HTMLElement {
  connectedCallback() {
    const width = parseInt(this.getAttribute('width') || '150');
    const height = parseInt(this.getAttribute('height') || '150');
    const showGrid = this.hasAttribute('grid');

    // Parse content
    const data = this.parseData(this.textContent);

    // Build SVG using autti.js math
    const svg = this.renderStereonet(data, { width, height, showGrid });

    // Replace content with SVG
    this.innerHTML = '';
    this.appendChild(svg);
  }

  parseData(text) {
    return text.trim().split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [attitude, type = 'plane', color = 'black', label = ''] =
          line.split(',').map(s => s.trim());
        const [dd, d] = attitude.split('/').map(Number);
        return { dd, d, type, color, label };
      });
  }

  renderStereonet(data, opts) {
    // Use autti.js for projection math
    // Return SVG element
  }
}

customElements.define('stereo-net', StereoNet);
```

#### Usage in Documents

Perfect for educational content:

```html
<p>The conjugate fault system shows two dominant orientations:</p>

<stereo-net grid>
  # Fault set A
  045/60, plane, #e63946, A
  050/58, plane, #e63946
  040/62, plane, #e63946

  # Fault set B
  315/55, plane, #457b9d, B
  320/52, plane, #457b9d
  310/58, plane, #457b9d

  # Slickenlines
  045/45, line, #2a9d8f, slip
  315/40, line, #2a9d8f
</stereo-net>

<p>The acute angle between sets suggests σ1 oriented roughly N-S.</p>
```

#### Element IDs & CSS Classes (Extensibility)

Keep the core simple, but give elements predictable IDs so users can add interactivity:

```html
<stereo-net id="faults">
  045/60, plane, red, S1
  315/55, plane, blue, S2
  045/45, line, green, L1
</stereo-net>
```

Generates:

```html
<svg id="faults" class="stereo-net" viewBox="-110 -110 220 220">
  <g class="stereo-net__primitive"><!-- grid circles --></g>
  <g class="stereo-net__data">
    <g id="faults__S1" class="stereo-net__plane" data-dd="045" data-d="60">
      <polyline class="stereo-net__gc" points="..."/>
      <circle class="stereo-net__pole" cx="..." cy="..." r="3"/>
      <text class="stereo-net__label">S1</text>
    </g>
    <g id="faults__S2" class="stereo-net__plane" data-dd="315" data-d="55">...</g>
    <g id="faults__L1" class="stereo-net__line" data-dd="045" data-d="45">
      <circle class="stereo-net__point" cx="..." cy="..." r="3"/>
      <text class="stereo-net__label">L1</text>
    </g>
  </g>
</svg>
```

Now users can do their own interactivity with plain CSS/JS:

```css
/* Hover effect - no JS needed */
.stereo-net__plane:hover .stereo-net__gc { stroke-width: 3; }
.stereo-net__plane:hover .stereo-net__pole { r: 5; }

/* Highlight linked from text */
#faults__S1.highlight .stereo-net__gc { stroke: yellow; stroke-width: 4; }
```

```html
<!-- Link text to stereonet element -->
<p>The main foliation
  <span class="stereo-ref" data-target="faults__S1">(S1: 045/60)</span>
  dips steeply to the NE.
</p>

<script>
// Optional: wire up text↔stereonet highlighting
document.querySelectorAll('.stereo-ref').forEach(el => {
  const target = document.getElementById(el.dataset.target);
  el.addEventListener('mouseenter', () => target.classList.add('highlight'));
  el.addEventListener('mouseleave', () => target.classList.remove('highlight'));
});
</script>
```

This keeps the library small but lets power users build rich interactions.

#### Advanced: Rotated Views

For arbitrary stereonet orientation (e.g., looking down-plunge at a fold):

```html
<stereo-net view="120/45">
  <!-- Data plotted relative to rotated view -->
  <!-- view="dd/d" rotates the stereonet so that direction is at center -->
</stereo-net>
```

Or for rotating the entire plot (like tilting a physical stereonet):

```html
<stereo-net rotate="30">
  <!-- Rotates the whole plot 30° clockwise -->
</stereo-net>
```

This is useful for structural analysis but could be a v2 feature.

#### Bundle Size Target

- Core (projection math): ~2KB minified
- SVG rendering: ~2KB minified
- Custom element wrapper: ~1KB minified
- **Total: ~5KB** — smaller than most icons

The interactivity examples above are *user code*, not library code. The library just provides good structure.

#### Distribution

```html
<!-- Drop-in script -->
<script src="https://endarthur.github.io/stereo-net/stereo-net.min.js"></script>

<!-- Or ES module -->
<script type="module">
  import 'https://endarthur.github.io/stereo-net/stereo-net.js';
</script>
```

This would be genuinely useful for geology blogs, course materials, and Stack Exchange answers. Nobody's done it yet.

#### Relationship to Bearing

This component would be part of the **auttitude → bearing** rebuild:

```
bearing/
├── core/           # Math library (projection, orientation tensor, etc.)
├── stereo-net/     # <stereo-net> custom element
├── geo-attitude/   # <geo-attitude> symbol renderer (future)
└── ...
```

The custom element imports only what it needs from `bearing/core`, keeping the bundle small. Users who want just the math can use `bearing/core` directly; users who want drop-in HTML elements get the custom elements.

---

## 4. Offline-First PWA Bundle

Your philosophy aligns perfectly with Progressive Web Apps. A weekend project:

1. Add `manifest.json` to make the compass installable
2. Add a service worker to cache everything
3. Now your compass works in airplane mode, in the field, with no signal

The same treatment for location.html would let it cache the last known position and work offline, syncing when connection returns.

**Bonus**: PWAs can access sensors without HTTPS on localhost, but for deployed sites you're already on GitHub Pages (HTTPS), so you're set.

---

## 5. The "Geological Sketchpad"

ECMAltine is fascinating—a live-coding environment for geological models. But it requires JavaScript knowledge.

**Idea**: A more visual version where you:
1. Draw a cross-section (freehand or with snap-to-grid)
2. The tool infers the geological events (faults, folds, unconformities)
3. It generates the 3D model automatically
4. Export to GLTF for AR viewing

This would be like "Visible Geology" but with your event-based modeling approach and AR output. It bridges the gap between hand-drawn field sketches and digital models.

---

## 6. Sensor Fusion Experiments

Your compass uses GyroNorm, which abstracts device orientation. But there's more sensor data available:

- **Magnetometer calibration**: Show interference warnings (nearby metal)
- **GPS + Compass fusion**: Auto-record location with each measurement
- **Camera + Compass**: Photograph outcrop, overlay attitude data
- **Barometer**: Estimate elevation for collar data

A "super compass" that fuses all available sensors into a single field measurement tool. Each measurement becomes:

```json
{
  "attitude": [120, 45],
  "location": [-22.9, -43.2],
  "elevation": 823,
  "accuracy": 5,
  "photo": "data:image/jpeg;base64,...",
  "timestamp": "2024-12-01T10:30:00Z",
  "device": "Pixel 7",
  "magnetic_quality": "good"
}
```

Export as GeoJSON or CSV for direct import into QGIS/GemGIS.

---

## 7. P2P Field Collaboration

Your location sharing already uses PeerJS. Extend this to:

- **Shared stereonet**: Multiple people measuring attitudes, all appearing on one stereoplot in real-time
- **Collaborative mapping**: See your team's positions on a map with their recent measurements
- **Offline-first sync**: Queue measurements when offline, sync when peers reconnect

This would be genuinely useful for field courses—an instructor sees all students' measurements live, can identify who's struggling with technique.

No server needed, pure P2P, works on a local network without internet.

---

## 8. The Anti-Bloat Web Manifesto

Your site embodies principles that are increasingly rare. Consider writing them up explicitly—not as a rant, but as a positive statement:

> **"Why I Still Write HTML by Hand"**
>
> - No build step means no build rot
> - Vendored libraries mean no CDN outages
> - No tracking means no GDPR banner
> - Static files mean no server to maintain
> - Internet Archive links mean content survives
> - GitHub Pages means free, reliable hosting

This would resonate with the "small web" / "indie web" / "permacomputing" communities. It's also a good onboarding document for anyone who wants to understand your site's architecture.

---

## 9. Cross-Project Pollination

You contribute to several projects. Some connections that might be fruitful:

| From | To | Idea |
|------|-----|------|
| autti.js | GemGIS | Port your eigenvalue solver for orientation tensor analysis |
| desurvey.js | OpenStereo | Web-based desurvey as OpenStereo plugin |
| ECMAltine | GemPy | Browser-based frontend for GemPy models |
| Compass | ply2atti | Direct export from compass to point cloud annotation |
| CHIP-8 | ??? | What if geological calculators had a "retro mode"? |

The last one is half-joking, but there's something appealing about a HP-48 style RPN calculator for geology that runs in the browser.

---

## 10. Documentation as Demonstration

Your site.html is good but modest. Consider making your "about" page itself demonstrate your capabilities:

- The page header could be an interactive stereonet
- Links could have geological tooltips (miniature stereoplots)
- The color palette section could let visitors tweak colors live
- A "tools" section could show live mini-demos inline

This turns documentation into portfolio—visitors see what you can build while reading about it.

---

## 11. Archive Your Own Work

You archive external links via Internet Archive. But what about your own site?

**Suggestion**:
1. Submit your key pages to archive.org proactively
2. Add `<link rel="canonical">` tags
3. Consider exporting to a static archive format periodically

Your site is the kind of thing that should survive—practical tools, mathematical explanations, educational content. Don't leave it to chance.

You could even add a "colophon" section noting that the site has been archived and how to find it if the main URL dies.

---

## 12. Micro-Publications

Your writing pages are essentially micro-papers. Consider:

- **DOIs**: Zenodo can give DOIs to GitHub repos/releases for free
- **Citation format**: Add a "How to cite" block to each page
- **ORCID integration**: Link to your researcher profile

This makes your work citable in academic contexts without going through formal publication. Your desurvey page is more useful than many published papers on the topic—it should be citeable.

---

## 13. Teaching Mode

Several of your tools would be excellent for teaching. A "teaching mode" could:

- Add step-by-step explanations that appear as users interact
- Include "challenges" (measure this attitude, find this fold axis)
- Record a session for later review
- Show common mistakes and how to avoid them

The compass, for instance, could have a "training mode" where it shows what a correct measurement looks like before letting students try.

---

## 14. Hardware Connections

Your software lives in the browser, but there's interesting hardware to connect:

- **Brunton compass digitizer**: A clip-on sensor that digitizes readings from a traditional compass
- **LIDAR integration**: iPhone/iPad LIDAR for quick outcrop scans
- **Drone telemetry**: Ingest drone flight data for photogrammetry planning
- **ESP32 sensors**: Build a cheap digital compass that sends data via Bluetooth

The last one could be a fun project—an open-source digital geological compass for ~$30 in parts.

---

## 15. Personal Knowledge Graph

You have writing, tools, code, and academic work scattered across:
- This site
- GitHub repos
- Google Scholar
- Academia.edu
- USP thesis repository

**Idea**: A single page that maps all your work as a knowledge graph. Nodes are papers, tools, concepts. Edges are "uses", "extends", "cited-by", "inspired".

This helps visitors (and you) see connections. It's also a living CV that shows intellectual trajectory, not just a list of outputs.

---

## 16. The Geology Demoscene

Your CHIP-8 emulator hints at demoscene appreciation. What if there was a "geology demoscene"?

- 1KB geological visualizations
- Procedural terrain generation competitions
- "Fit the model to this cross-section" speedruns
- ASCII art stratigraphic columns

Probably silly, but there's something charming about constraint-based creativity applied to geology. A geology game jam, perhaps?

---

## 17. Sustainability & Longevity

Your site is already pretty sustainable (static, no dependencies on external services). To go further:

- **Single-file versions**: Bundle key tools into single HTML files with all CSS/JS inline
- **Print stylesheets**: Make pages printable as useful documents
- **Plain-text fallbacks**: Ensure content is readable with CSS disabled
- **No-JS graceful degradation**: Show static diagrams when JS fails

The goal: your pages should be useful in 20 years, on hardware we can't predict, possibly archived by systems that strip scripts.

---

## 18. The "View Source" School

Your handwritten HTML is increasingly rare and educational. Consider:

- Add comments explaining design decisions
- Create a "how this page works" companion for complex tools
- Encourage "view source" with a visible invitation

```html
<!--
  Welcome, source viewer! This page is intentionally simple.
  No build tools, no frameworks—just HTML, CSS, and JavaScript.
  Feel free to learn from it, copy it, improve it.
  Questions? endarthur@gmail.com
-->
```

This positions your site as educational infrastructure, not just personal portfolio.

---

## Summary: Top 5 Actionable Ideas

1. **PWA-ify the compass** — Add manifest + service worker for offline use (1-2 hours)
2. **Write "Why I Still Write HTML by Hand"** — Capture your philosophy explicitly (2-3 hours)
3. **Create Campo landing page** — Unify field tools under one concept (1 hour)
4. **Add "How to Cite" to desurvey page** — Make your work academically referenceable (30 min)
5. **Submit key pages to archive.org** — Ensure longevity (15 min)

These are small investments with lasting returns. The bigger ideas (Geological Sketchpad, P2P collaboration, sensor fusion) are for when you have time and energy for a deeper project.

---

*These are suggestions, not obligations. Cherry-pick what resonates, ignore what doesn't. Your site is already doing something valuable—these are just paths it could grow.*
