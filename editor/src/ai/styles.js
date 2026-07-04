/**
 * Generation-style presets (Pro). Each prepends a short directive to the AI
 * system prompt so generated/edited HTML matches a chosen aesthetic. Data-driven
 * — add a preset by adding one row. MIT — RHOBEAR Designs.
 */
export const STYLES = [
  { id: 'default', name: 'Default', pro: false, prompt: '' },
  { id: 'editorial', name: 'Editorial', pro: true,
    prompt: 'Refined editorial style: large serif or high-contrast display headings, generous whitespace, a restrained palette, a print-like grid, subtle hairlines. Calm and considered.' },
  { id: 'saas', name: 'SaaS-clean', pro: true,
    prompt: 'Clean modern SaaS style: crisp sans-serif, soft cards with 12–16px radius, ONE vivid accent, gentle shadows, clear hierarchy, lots of breathing room.' },
  { id: 'brutalist', name: 'Brutalist', pro: true,
    prompt: 'Neo-brutalist style: heavy black borders, hard 4–6px offsets, flat bold blocks of color, monospace or grotesk type, NO soft shadows, high contrast.' },
  { id: 'playful', name: 'Playful', pro: true,
    prompt: 'Playful style: rounded shapes, bright cheerful colors, chunky friendly type, soft blobs/gradients, generous rounding, a sense of motion.' },
  { id: 'luxury', name: 'Luxury', pro: true,
    prompt: 'Luxury style: deep dark or ivory backgrounds, gold/champagne accents, elegant serif headings, wide letter-spacing, minimal ornamentation, lots of space.' },
];

export function styleById(id) { return STYLES.find((s) => s.id === id) || STYLES[0]; }

/** The system-prompt fragment for a chosen style ('' for Default). */
export function styleDirective(id) {
  const s = styleById(id);
  return s.prompt ? `\n\nGENERATION STYLE — ${s.name}: ${s.prompt}` : '';
}
