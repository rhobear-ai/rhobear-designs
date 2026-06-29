# MiniMax M3 High

**Model:** MiniMax M3 High  
**Status:** **Complete** — all 6 round-2 sites + 7 round-3 sites delivered

## Round 3 — Award batch C (new acclaimed sites)

| # | Site | File | Notes |
|---|------|------|-------|
| 1 | basicagency.com | `basic-dept.html` | BASIC/DEPT® paper-white portfolio — white "browser card" centered on a slate-blue page that auto-rotates through KFC, Google Store, Wilson, Patagonia case studies; serif giant type, awards row, statement band, project mosaic, news list, dark footer with newsletter + offices. |
| 2 | akaru.fr | `akaru.html` | Lyon agency with editorial print-book feel — 50/50 hero (massive black "AKARU" wordmark on cream + 4-up pastel color-stripe thumbnails), full-bleed case study panels for bomo / Orlinski / Pikko with category tags and circular arrow CTAs, scroll-reveal awards table, full-bleed orange expertises panel, giant footer wordmark. |
| 3 | wokine.com | `wokine.html` | Lille/Annecy digital & creative studio — "Hello, again.*" giant serif hero with bobbing lime-green shield + Annecy pop-up, full-bleed peach/red Leroux 2022 case with stubbed jars and giant serif year, rotating-words "Nos Expertises" stack, dark project mosaic, awards tags, trust wall, deep-purple startup-studio band. |
| 4 | fireart.studio | `fireart.html` | Cream-canvas dev/design agency — orange leather-textured hero with cycling phone-app mockup, floating white pill nav with orange Contact, marquee client logo strip, swap-on-click service tabs, success-story cards, 4 award tiles, dark podcast grid, dark CTA with 8 trust pills, 6-col white footer. |
| 5 | lazarev.agency | `lazarev.html` | San Francisco AI-product studio — black canvas with massive serif headline and a single bright green "LET'S TALK" pill CTA, scrolling accolades marquee, "Golden standard in UX + AI" + "Webby winner" cards, Accern/Elva/VT.NEWS case grid, partnership manifesto band, 6-service cards, client mosaic, testimonial stack, dense dark footer. |
| 6 | unseen.co | `unseen-studio.html` | Bristol brand/digital/motion studio — full-bleed pastel-pink dreamscape with mountains, arches over a pool, sphere, stairs (mousemove parallax), italic "Creating the" + sans "unexpected" hero overlay, "Selected Projects" filter pills, gradient project cards. |
| 7 | igloo.inc | `igloo-inc.html` | Crypto/Web3 studio "Igloo Inc." with sci-fi HUD aesthetic — full-bleed snowy mountain landscape with SVG-constructed ice-block igloo dome and tunnel arch, animated shifting blocks, falling snow, four corner HUD overlays (pixelated "IGLOO" wordmark + ID panel / dark menu pill + telemetry grid / stat panel + build bar / globe icon) with live-updating frame counter. |

## Round 2 deliverables

| # | Site | File | Notes |
|---|------|------|-------|
| 1 | alche.studio | `alche-studio.html` | Dark WebGL studio site — rotating crystal centerpiece, custom shader with noise + fresnel, material & quaternion gizmos, NEWS panel with red year headers, giant `ALCHE` wordmark watermark, grid background. |
| 2 | cappen.com | `cappen.html` | Miami-based award-winning studio — "Human thinkers, digital makers" hero, six full case studies (Amanda Braga, Credit Genie, JCPM, Ministry of Supply, LeadEdu, NeonDoor), awards marquee, scroll-reveal transitions. |
| 3 | brandappart.com | `brand-appart.html` | Paris startup-focused design studio — cream-paper canvas, per-tile accent palettes (lime / coral / lilac / mint / sun / ink), draggable founder testimonials, four-pillar services band, trust wall. |
| 4 | 109ichiki.com | `109ichiki.html` | Tokyo illustrator "1:09" portfolio — fluorescent pinks + limes + yellows, heavy outlined tabs, four category panels (illustration / MV / event / goods), BGM player UI, pickup works row, profile mosaic. |
| 5 | bychudy.com | `bychudy.html` | Warsaw art direction + photography studio for the Polish music industry — typographic project index (no imagery), featured Ryk × Fantasmagorie spread, six category tiles, custom cursor with ring hover state. |
| 6 | wearestokt.com | `wearestokt.html` | Motion-driven branding studio — Three.js breathing icosahedron hero with custom shader, letter-by-letter reveal of the mission line, scrolling service marquee, six featured project plates, Motion Index reel grid. |

## Round-2 Batch B (7 new sites)

| # | Site | File | Notes |
|---|------|------|-------|
| 7 | resn.co.nz | `resn.html` | Wellington creative digital studio — warm cream canvas with vermilion accents, oversized RESN wordmark with italic accent, "We are Resn. Hello." split, awards marquee, ink-black studio band with giant watermark. |
| 8 | hellomonday.com | `hellomonday.html` | Brooklyn creative agency — peach-cream gradient hero, "Hello, world." in italic serif, alternating project tiles ("Hello, Google.", "Hello, Spotify.", "Hello, Met.", "Hello, Mailchimp."), pastel capability cards, custom cursor with label swap. |
| 9 | buildinamsterdam.com | `buildinamsterdam.html` | Amsterdam creative-tech studio — deep ink canvas, mint-accent kinetic letter in hero, 4-up service grid, alternating case rows (WhatsApp, Google, Adyen, Porsche), numeric approach stats, news cards. |
| 10 | cuberto.com | `cuberto.html` | Moscow digital product studio — rotating Three.js icosahedron centerpiece with wireframe solids + fresnel rim, premium index-style case rows (Stripe, Linear, Notion, Framer, Arc, Pitch), philosophy spread, 3-up services band. |
| 11 | 14islands.com | `14islands.html` | Copenhagen digital studio — bone-white Nordic canvas, signature coral "island" accent, staggered letter-reveal hero, gallery-paced 12-col project grid (B&O, Polaroid, Wolt, Patagonia, Saxo, Tivoli), 4-up capabilities. |
| 12 | exoape.com | `exoape.html` | Amsterdam digital creative studio — full-viewport EXO APE wordmark in heavy Archivo Black, italic tagline, giant client marquee, alternating case rows (Spotify Wrapped, Adidas, KLM, Patagonia), 8-tile awards wall. |
| 13 | robin-noguier.com | `robin-noguier.html` | Parisian indie front-end developer portfolio — pure editorial typography, no imagery, single-line project list (name / role / stack / year), long-form manifesto, side-project "lab" band, two pull-quotes. |

## Approach

- **Self-contained HTML per site** — Tailwind via CDN + Three.js via CDN (used in `cuberto.html` and `wearestokt.html` for the icosahedron centerpiece), no build step, no external assets.
- **No brand assets used** — every illustration, plate, thumbnail, and avatar is procedural CSS, gradient + noise composition, inline SVG, or WebGL geometry.
- **Color tokens defined as CSS variables** at the top of each file for easy audit.
- **Comment block at top of each file** documents the original URL, live-site observations, and challenges solved.
- **Six different moods** for six different studios: dark futuristic (Alche), editorial award (Cappen), founder-cream (Brand Appart), fluorescent pop (109ichiki), editorial-music (bychudy), motion-driven brand (Stōkt).
- **No other models' folders touched** — design references were the live sites + training knowledge, not sibling samples. (Old round-1 files remain in this folder, untouched.)

## What I leaned into

### Round 3 (award batch C)

- **White-card carousel on basic-dept.html** — the white "browser" card centered on a slate-blue page auto-rotates through KFC / Google Store / Wilson / Patagonia case studies; each slide is a clean, generic recreation of the brand chrome (logo wordmark + product chip + gradient plate where the photo would be).
- **50/50 hero with massive black type on akaru.html** — a print-book-feeling split hero with Archivo Black "AKARU" wordmark on cream + a 2×2 pastel color-stripe thumbnail collage on the right; full-bleed case study panels for bomo / Orlinski / Pikko with category tags and rotating circular arrow CTAs.
- **Bobbing lime shield + Leroux 2022 banner on wokine.html** — CSS-only shield with a slow bob/rotate animation, full-bleed peach Leroux case with stubbed jars and giant serif "2022" year, rotating-words "Nos Expertises" stack that slides the active word up and brings the next one in.
- **Floating pill nav + cycling phone plates on fireart.html** — a centered floating pill nav holds six menu items with chevrons; the hero phone mockup crossfades between three different "app screens" via JS; leather-orange hero with SVG noise overlay.
- **Green pill CTA + scrolling accolades marquee on lazarev.html** — massive Fraunces headline on pure black with a single bright green "LET'S TALK" pill; accolades marquee scrolls under the hero; partnership manifesto + services cards + dense categorized footer.
- **Pastel pink dreamscape with parallax on unseen-studio.html** — layered CSS+SVG composition of mountains, arches, pool, sphere, stairs — each element reacts to mouse position with subtle parallax; italic Cormorant Garamond "Creating the" + sans "unexpected" hero overlay.
- **Sci-fi HUD over icy igloo on igloo-inc.html** — full-bleed snowy mountain landscape with an SVG-constructed ice-block igloo (dome + tunnel arch); subtle animation shifts the blocks like the original Three.js scene; four corner HUD overlays (pixelated "IGLOO" wordmark + ID panel / dark menu pill + telemetry grid / stat panel + build bar / globe icon) with a live-updating frame counter.

### Round 2

- **WebGL centerpiece on alche.studio** — stretched octahedron with a noise-displaced vertex shader, fresnel-driven rim highlight, real material/quaternion widgets driving uniforms in real time.
- **Scroll-driven case studies on cappen.com** — six full case studies with scroll-reveal, parallax plates, and an award marquee that captures the "we ship work" energy of an Awwwards-tier studio.
- **Per-tile palette rotation on brandappart.com** — every featured-work tile carries its own accent variable (lime / coral / lilac / mint / sun / ink / cyan) so the grid reads as a curated mood-board, not a uniform list.
- **Tab system + BGM player on 109ichiki.html** — radio-button tabs with smooth panel transitions, faux BGM controls with a moving progress bar, mosaic profile tile.
- **Type-as-imagery on bychudy.com** — the live site is photography-heavy; the brief forbade brand assets, so the project names themselves become the visual centerpiece, set in Fraunces at 7vw with italic accents.
- **Motion reveal on wearestokt.com** — letter-by-letter reveal of the mission line on scroll-into-view, plus a Three.js icosahedron with custom shader breathing behind the hero type.
- **Vermilion wordmark + cream canvas on resn.html** — the "We are Resn. Hello." split mirrors the live site's split personality; giant RESN watermark on the dark studio band reads as a "we mean it" signature.
- **"Hello, [Brand]." pattern on hellomonday.html** — every project is named the way the studio names them on the live site, set in italic DM Serif Display at ~7vw against alternating gradient plates.
- **Kinetic gold letter on buildinamsterdam.html** — a single italic glyph in the hero breathes / rotates to capture the playful-yet-precise Dutch restraint of the live site; mint accent ties everything together.
- **Three.js rotating icosahedron on cuberto.html** — wireframe outer + solid inner + floating point cloud, scroll-driven rotation, capturing the studio's signature geometric centerpiece.
- **Coral "island" accent on 14islands.html** — every project tile carries its own accent variable so the gallery reads curated, not uniform; per-letter hero stagger matches the deliberate pacing.
- **Full-viewport EXO APE wordmark on exoape.html** — Archivo Black at ~360px, italic tagline, awards wall of 8 tiles with hover background — captures the bold modernist voice.
- **Pure typography on robin-noguier.html** — the only file in this batch with zero imagery. Eight single-line project rows + a long manifesto + two pull quotes + an "ongoing lab" band; honors the quiet, editorial restraint of the original.

Full rules: [`../README.md`](../README.md) · [`../AGENTS.md`](../AGENTS.md)

---

## Round 3 — Studios batch A (gen-a-studios)

| # | Site | File | Notes |
|---|------|------|-------|
| 1 | Lusion | `lusion.html` | Bristol 3D studio — Three.js tumbling crosses hero (RoomEnvironment PBR + cobalt/white/black palette), word-by-word reveal on the H1, "Bold Ideas, Brought to Life" manifesto, 2×5 featured-work grid with tag-then-spaced-letter-case serif names, doubled-up "Let's work together" ribbon, Bristol UK footer. |
| 2 | Active Theory | `active-theory.html` | LA dark studio — pure WebGL particle field (3500 points, two-tone cool-blue / warm-gold palette with per-particle drift and cursor parallax), "YOUR BROWSER IS NOT SUPPORTED" splash that auto-fades once ready, AT® mark + nav + live LA clock + Now Playing EQ + sound toggle + right-rail badges. |
| 3 | Locomotive | `locomotive.html` | Montreal digital-first agency — red→blue scroll-shifting gradient hero, "Locomotive® Digital-first Design Agency*" display with cyan "loco" underline and OPS/DES/DEV boxed badge, "Seven Years / Running" band with bronze-medal SVG, 5-row featured-work editorial (Scout Motors, Populous, Mate Libre, Destigmatize, All Work), UNIT manifesto with portrait, Articles + Culture + Store sections, 4-column footer with the typewriter-style "1211 Jean-Talon Est Montréal H2R 1W1" address. |
| 4 | Immersive Garden | `immersive-garden.html` | Paris digital studio — off-white plaster canvas with five hand-rolled SVG sculptures (baroque flower, jellyfish, feathered plume) drifting with slow @keyframes and triple drop-shadow, "Innovative / digital experiences / studio" italic serif centerpiece, IG monogram + tracked caps, scroll-down chevron, 16-row project index (LV VIA, Cartier, Dioriviera, Longines, etc) with serif italic names + mono caps categories, Our Approach + Our Mission + Paris footer. |
| 5 | makemepulse | `makemepulse.html` | Global creative studio — charcoal canvas with the iconic "global / creative / studio." three-line hero + two italic link-pills ("we turn aesthetics into experiences", "tech that's light as air"), auto-cycling 3-slide case-study carousel (Brunello Cucinelli, Benno's Light, McDonald's Rösti Fall), "We also do games" reveal, news list with dates + serif italic titles, 4-col footer with Paris/London offices + regional emails + LinkedIn/Instagram/X/Behance follow-us. |
| 6 | Aristide Benoist | `aristidebenoist.html` | Independent developer portfolio — sage-on-charcoal (#bac4b8 on #141414), ARISTIDE wordmark top-left, animated audio-tape indicator top-center, About link top-right, auto-scrolling horizontal filmstrip of B&W project placeholders, INDEPENDENT DEVELOPER · AVAILABLE APR. 2023 + EMAIL/INSTAGRAM/TWITTER bottom row, About overlay with numbered project rows (01-06: House of Gucci, P&P, ESY, 6833098, L, SOUND), vertical ARISTIDE wordmark on the left, PROJECTS/VISIT/EMAIL pills + credits on the right. |
| 7 | Dogstudio (Dept) | `dogstudio.html` | Multidisciplinary creative studio — full-bleed dark hero with abstract canine silhouette (CSS radial gradients + drop-shadows), massive serif italic word-per-line "We / Make / Good / Shit" with letter-by-letter reveal, red laser line + 8 falling-leaf SVGs, DOGSTUDIO / DEPT. wordmark with red "/" slash, "Our Showreel" pill with red triangle, cookie banner bottom-left, 7 featured-project rows with year + name + tag chip + description-on-hover, word-per-line manifesto, Chicago/Amsterdam/Paris offices, full contact form. |
