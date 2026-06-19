# MiniMax M3 (high) — designs-b1 status

5 self-contained HTML recreations, one per source site.

- lisovskiy-work.html — lisovskiy.work — editorial art-director site with a 3D spinning floppy disk centerpiece, vertical word list, irregular featured-works grid, Clients/Fields/Values columns, full project index, and "Peace ✌︎" closer.
- orage-studio.html — orage.studio — 3D / VFX Paris studio with the full "Console setup → Welcome to Orage → Parsing data" loader (with a real count-up 0/99 → 99/99, detected display/browser/language), DOS-style breadcrumb header, draggable planes, a Three.js plane field flying through a parallax camera, and a 5-bar ORAGE wordmark redrawn as inline SVG.
- generalcondition.html — generalcondition.com — bold, maximalist studio with massive red black-weight serif headlines, a 40 px red grid behind the dark sections, full hand-drawn SVG illustration bands (clouds, balloons, flowers, cats, rabbits, city silhouette), a HELLO/HOLA/SALUT/CIAO/HOI marquee, a services list, a featured-work carousel, honors grid, MADNESS statement, and a team carousel of 5 members.
- twicetwice.html — twicetwice.tv — film production studio with a fixed left-rail vertical navigation ("twice" / STORIES / COMMERCIALS / PERSONAL WORK / about), a 4-word rotating poetic line, and two parallel columns of cinematic placeholder stills that scroll at different speeds (1.0× vs 0.65×) for the signature parallax.
- stiff-films.html — stiff.madebybuzzworthy.com — comedy production studio with the iconic "WE MAKE LAUGHS THAT LOOK DAMN GOOD" hero (the "LAUGHS" word in huge red, a live cartoon teeth/eyes character breathing and blinking between the "Go" and "od"), a vertical "WORK" marquee, a 5-card cream work grid with red display titles, a rotating "COMEDY GOLD" circular mark in the about section, an "IN YOUR FEED" news grid, and a spinning "REACH OUT" closer.

Notes on technique:
- All sites use Tailwind via CDN + (where needed) GSAP-style vanilla animation or Three.js for 3D.
- Three.js is loaded via CDN for the lisovskiy floppy and the orage hero plane field.
- All placeholder tiles are procedurally generated — no real brand assets, no real photos, no real videos, no real logos.
- Type system: each recreation uses a free-license substitute that's visually adjacent to the original's display face (Anton ↔ Grand Bold, Playfair Display Black ↔ Right Serif Wide Black, Inter Tight ↔ Apfel Grotezk, Fraunces ↔ BL Melody, JetBrains Mono ↔ PP Supply Mono, etc.).
- Every HTML file ships a top comment block (original URL + design observations + challenges solved) and a bottom note (preserved-well + intentional trade-offs).

Total: 5 HTML files.
