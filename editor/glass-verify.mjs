// Verify liquid-glass computed live + screenshots. Usage: node glass-verify.mjs <baseURL> <outdir>
import { chromium } from 'playwright';
const base = process.argv[2] || 'https://designs.rhobear.ai';
const out = process.argv[3] || '.';
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1600, height: 950 } });
await pg.goto(base + '/?surface=desktop', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto:', e.message));
await pg.waitForTimeout(2500);

const probe = await pg.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const bf = (s) => { const el = q(s); if (!el) return 'MISSING'; const c = getComputedStyle(el); return (c.backdropFilter || c.webkitBackdropFilter || 'none'); };
  const r = {};
  for (const s of ['.rb-toolbar', '.rb-rail', '.rb-inspector', '.rb-status', '.rb-modeswitch', '.rb-btn', '.rb-ask', '.rb-ai-panel', '.rb-tpl-card', '#dsOnb .dsob-pill', '#dsOnb .dsob-tpl'])
    r[s] = bf(s);
  const orb = q('#rho-launch');
  r.orb = orb ? { w: orb.getBoundingClientRect().width, h: orb.getBoundingClientRect().height, top: getComputedStyle(orb).top, right: getComputedStyle(orb).right } : 'MISSING';
  const sel = q('.rb-overlay-selection');
  r.font = getComputedStyle(document.body).fontFamily.slice(0, 40);
  r.onboardingShown = !!q('#dsOnb.on');
  return r;
});
console.log(JSON.stringify(probe, null, 1));

// onboarding screenshot (fresh browser has no localStorage → should be on)
await pg.screenshot({ path: out + '/onb-or-editor.png' });
// close onboarding, editor shot
await pg.evaluate(() => { document.getElementById('dsobSkip')?.click(); });
await pg.waitForTimeout(600);
await pg.screenshot({ path: out + '/editor-start.png' });
// open templates modal
await pg.click('[data-testid="btn-templates"]').catch(() => {});
await pg.waitForTimeout(1200);
await pg.screenshot({ path: out + '/templates-modal.png' });
await pg.keyboard.press('Escape');
// AI panel
await pg.click('[data-testid="ai-fab"]').catch(() => {});
await pg.waitForTimeout(600);
await pg.click('#ai-prompt').catch(() => {});
await pg.waitForTimeout(400);
await pg.screenshot({ path: out + '/ai-panel-ignited.png' });
await b.close();
console.log('done');
