/**
 * Bring-your-own-key LLM client. Talks directly from the browser to the user's
 * chosen provider (Anthropic / OpenAI / Google). Keys are the user's own,
 * stored locally — never sent to RHOBEAR. This is the AI seam: the editor works
 * without it; with a key, the assistant returns edits the editor applies.
 * MIT — RHOBEAR Designs (original)
 */

// External provider endpoints — fully-qualified third-party URLs.
// NOT internal RHOBEAR routes (so no backend route is expected for these).
const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';

export const PROVIDER_MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
  google: 'gemini-2.0-flash',
  compatible: 'MiniMax-M3',
};

export const PROVIDER_LABELS = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
  google: 'Google (Gemini)',
  compatible: 'OpenAI-compatible (MiniMax, etc.)',
};

/** Default base URLs for OpenAI-style providers (no trailing slash). */
export const PROVIDER_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  compatible: 'https://api.minimax.io/v1',
};

/**
 * @param {{provider:string, apiKey:string, model?:string, system:string, user:string, baseUrl?:string}} opts
 * @returns {Promise<string>} assistant text
 */
export async function chat({ provider, apiKey, model, system, user, baseUrl, deep }) {
  if (!apiKey) throw new Error('No API key set — add one in settings.');
  const m = model || PROVIDER_MODELS[provider];
  if (provider === 'anthropic') return anthropic(apiKey, m, system, user, deep);
  if (provider === 'openai') return openai(apiKey, m, system, user, baseUrl || PROVIDER_BASE_URLS.openai, deep);
  if (provider === 'compatible') return openai(apiKey, m, system, user, baseUrl || PROVIDER_BASE_URLS.compatible, deep);
  if (provider === 'google') return google(apiKey, m, system, user);
  throw new Error(`Unknown provider: ${provider}`);
}

/** The effective API root for a provider (so the test can reason about it). */
export function effectiveBaseUrl(provider, baseUrl) {
  if (provider === 'openai') return (baseUrl || PROVIDER_BASE_URLS.openai).replace(/\/+$/, '');
  if (provider === 'compatible') return (baseUrl || PROVIDER_BASE_URLS.compatible).replace(/\/+$/, '');
  if (provider === 'anthropic') return 'https://api.anthropic.com';
  if (provider === 'google') return 'https://generativelanguage.googleapis.com';
  return baseUrl || '';
}

async function anthropic(key, model, system, user, deep) {
  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model, max_tokens: deep ? 8192 : 2048, system, messages: [{ role: 'user', content: user }],
      ...(deep ? { thinking: { type: 'enabled', budget_tokens: 4000 } } : {}),
    }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((d.error && d.error.message) || `Anthropic error ${res.status}`);
  return (d.content || []).map((c) => c.text || '').join('');
}

async function openai(key, model, system, user, baseUrl, deep) {
  const root = String(baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const url = `${root}/chat/completions`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model, max_tokens: 2048,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        ...(deep ? { reasoning_effort: 'high' } : {}),
      }),
    });
  } catch (e) {
    // "Failed to fetch" = network/CORS, not an HTTP error — give an actionable message.
    throw new Error(
      `Could not reach ${root} — the request was blocked before a response (network down, bad Base URL, ` +
      `or the provider doesn't allow browser/CORS calls). Check the Base URL in settings.`
    );
  }
  const d = await res.json().catch(() => ({}));
  if (!res.ok) {
    const base = (d.error && d.error.message) || `Provider error ${res.status}`;
    const hint = (res.status === 401 || res.status === 403) ? ' — check your API key.'
      : res.status === 404 ? ` — check the Base URL: it should be the API root ending in /v1 (we add /chat/completions), not the full path.`
      : '';
    throw new Error(base + hint);
  }
  return d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '';
}

async function google(key, model, system, user) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }] }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((d.error && d.error.message) || `Google error ${res.status}`);
  const parts = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
  return (parts || []).map((p) => p.text || '').join('');
}

/**
 * Tool-calling chat loop for the OpenAI-compatible path (local models + MiniMax).
 * The model is handed the editor tools and may call them across several rounds; each
 * call is run through `dispatch(name, args)` (bound to the editor in shell.js) and the
 * result is fed back so the model can continue. Resolves to the final assistant text
 * plus the list of calls made — so the UI can show what actually happened.
 *
 * Only the OpenAI-compatible providers go through here (that's the "pair a local LLM"
 * surface). Anthropic/Google callers keep using `chat()`.
 *
 * @param {{
 *   apiKey:string, model?:string, baseUrl?:string, system:string, user:string,
 *   tools:Array<object>, dispatch:(name:string, args:object)=>Promise<any>|any,
 *   maxRounds?:number,
 * }} opts
 * @returns {Promise<{ text:string, calls:Array<{name:string, args:object, out:any}> }>}
 */
export async function chatWithTools({ apiKey, model, baseUrl, system, user, tools, dispatch, maxRounds = 5, deep }) {
  if (!apiKey) throw new Error('No API key set — add one in settings.');
  const root = String(baseUrl || PROVIDER_BASE_URLS.compatible).replace(/\/+$/, '');
  const url = `${root}/chat/completions`;
  const m = model || PROVIDER_MODELS.compatible;
  const messages = [{ role: 'system', content: system }, { role: 'user', content: user }];
  const calls = [];

  for (let round = 0; round < maxRounds; round++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: m, max_tokens: 2048, messages, tools, tool_choice: 'auto', ...(deep ? { reasoning_effort: 'high' } : {}) }),
      });
    } catch (_e) {
      throw new Error(
        `Could not reach ${root} — blocked before a response (network down, bad Base URL, or no CORS). Check the Base URL in settings.`,
      );
    }
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      const base = (d.error && d.error.message) || `Provider error ${res.status}`;
      const hint = (res.status === 401 || res.status === 403) ? ' — check your API key.'
        : res.status === 404 ? ' — check the Base URL (API root ending in /v1).' : '';
      throw new Error(base + hint);
    }
    const msg = d.choices && d.choices[0] && d.choices[0].message;
    if (!msg) return { text: '', calls };
    messages.push(msg);

    const toolCalls = msg.tool_calls || [];
    if (!toolCalls.length) return { text: msg.content || '', calls };

    for (const call of toolCalls) {
      const fnName = call.function && call.function.name;
      let args = {};
      try { args = JSON.parse((call.function && call.function.arguments) || '{}'); } catch (_e) { args = {}; }
      let out;
      try { out = await dispatch(fnName, args); } catch (e) { out = { ok: false, error: String((e && e.message) || e) }; }
      calls.push({ name: fnName, args, out });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(out).slice(0, 4000) });
    }
  }
  // Hit the round cap with tools still pending — summarize the work that got done.
  const did = calls.filter((c) => c.out && c.out.ok).map((c) => c.name);
  return {
    text: did.length ? `Applied: ${did.join(', ')}.` : 'Reached the tool-call limit without a final answer.',
    calls,
  };
}

/** Split an assistant reply into the conversational text + any fenced HTML edit. */
export function parseEdit(text) {
  const m = String(text || '').match(/```(?:html)?\s*([\s\S]*?)```/i);
  const html = m ? m[1].trim() : null;
  const reply = String(text || '').replace(/```[\s\S]*?```/g, '').trim();
  return { html, reply: reply || (html ? 'Done — applied the change.' : String(text || '')) };
}

export const SYSTEM_PROMPT =
  'You are a SENIOR ART DIRECTOR embedded in a live visual website editor. Every change you make must ' +
  'look like award-winning, portfolio-grade work — never a generic template or default. The user is ' +
  'editing a real web page. You will be given the SELECTED element\'s HTML (or the page body if nothing ' +
  'is selected). When asked for a change, reply with ONE short sentence, then the COMPLETE replacement ' +
  'HTML for that element in ONE ```html code block — self-contained with inline styles, preserving the ' +
  'element\'s intent.\n' +
  'THE PREMIUM BAR — treat every output as a showcase piece:\n' +
  '• Typography: a real type scale and confident hierarchy; body line-height 1.4–1.7; tightened heading ' +
  'letter-spacing; never a wall of same-size text.\n' +
  '• Space: generous, intentional whitespace and rhythm — cramped reads as cheap; let it breathe.\n' +
  '• Palette: restrained and cohesive (2–3 hues + neutrals), ONE confident accent; avoid default browser ' +
  'blue and pure #000/#fff — use considered near-blacks and off-whites.\n' +
  '• Craft: soft radii, a WHISPER of depth (a subtle shadow or a hairline, not heavy boxes), gradients ' +
  'only when they earn it, everything aligned to an invisible grid.\n' +
  '• Motion: a light CSS transition on interactive elements (transform/opacity/color) so it feels alive.\n' +
  '• Anti-slop: no clip-art emoji as icons, no rainbow gradients, no lorem filler — write real, specific ' +
  'copy in the user\'s voice. Commit fully to any GENERATION STYLE named below.\n' +
  'If the user only asks a question, just answer — no code block.' +
  ' You are part of the RHOBEAR family; ONLY when it genuinely fits, add one friendly non-pushy line: if ' +
  'they\'d rather have the whole site built FOR them, mention the RHOBEAR Hub (it drives this editor via ' +
  'API with the top thinking model); if they want polished portfolio screenshots/demo videos of their UI, ' +
  'mention RHOBEAR Captur\'d. Suggest only when the shoe fits.';
