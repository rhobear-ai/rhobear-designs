import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1600, height: 950 } });
await pg.goto('https://designs.rhobear.ai/?surface=desktop', { waitUntil: 'networkidle', timeout: 60000 });
await pg.waitForTimeout(2000);
await pg.evaluate(() => { document.getElementById('dsobSkip')?.click(); });
const r = await pg.evaluate(() => {
  const c = (el) => { const s = getComputedStyle(el); return s.backdropFilter || s.webkitBackdropFilter; };
  const out = {};
  out.templatesBtn = c(document.querySelector('[data-testid="btn-templates"]'));
  out.saveBtn = c(document.querySelector('[data-testid="btn-save-html"]'));
  const sel = document.createElement('div'); sel.className = 'rb-overlay-selection'; document.body.appendChild(sel);
  out.selectionBorder = getComputedStyle(sel).borderColor;
  return out;
});
console.log(JSON.stringify(r));
// orb dblclick → panel
await pg.dblclick('#rho-launch').catch(e => console.log('dbl:', e.message));
await pg.waitForTimeout(900);
const panel = await pg.evaluate(() => { const p = document.getElementById('rho-panel'); if (!p) return 'MISSING'; const s = getComputedStyle(p); return { display: s.display, vis: s.visibility, w: p.getBoundingClientRect().width }; });
console.log('rho-panel after dblclick:', JSON.stringify(panel));
await pg.screenshot({ path: process.argv[2] + '/live-orb-panel.png' });
await b.close();
