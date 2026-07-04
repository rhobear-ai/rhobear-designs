/**
 * Tests for the managed (house-gateway) AI client. Stubs `globalThis.fetch`
 * to simulate the RHOBEAR envelope the family `cloud-gate` lane emits, and
 * asserts each denial lifts to the right typed error + carries the fields
 * the upgrade modal needs.
 *
 * Run with: `node --test src/ai/`
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  managedChat,
  managedChatWithTools,
  managedBaseUrl,
  DEFAULT_MANAGED_MODEL,
  MANAGED_MODELS,
  PaymentRequiredError,
  ManagedRateLimitError,
  ManagedAuthError,
  ManagedUpstreamError,
} from './managed-client.js';

// `import.meta.env` is a Vite-ism; the module reads it defensively. Provide a
// minimal global so the default base resolves to '' (same-origin) in node.
if (!globalThis.import_meta_env_seen) {
  globalThis.import_meta_env_seen = true;
}

function mockFetch(handler) {
  const seen = [];
  globalThis.fetch = async (url, opts) => {
    seen.push({ url, opts });
    const out = handler(seen.length - 1, { url, opts });
    return {
      ok: out.status >= 200 && out.status < 300,
      status: out.status,
      headers: { get: (k) => (out.headers ? out.headers[k.toLowerCase()] : null) },
      json: async () => out.body,
    };
  };
  return seen;
}

test('managedChat: happy path returns assistant text (OpenAI-compatible shape)', async () => {
  const seen = mockFetch(() => ({
    status: 200,
    body: { choices: [{ message: { content: 'made the hero dark' } }] },
  }));
  const text = await managedChat({ system: 's', user: 'do it', model: MANAGED_MODELS.URS });
  assert.equal(text, 'made the hero dark');
  // Cookie auth is the whole mechanism — there must be NO authorization header.
  assert.equal(seen[0].opts.credentials, 'include');
  assert.equal(seen[0].opts.headers.authorization, undefined);
  // Default base is same-origin (empty) → /v1/chat/completions.
  assert.equal(seen[0].url, '/v1/chat/completions');
  // Model the caller asked for is what's sent.
  assert.equal(JSON.parse(seen[0].opts.body).model, 'URS');
});

test('managedChat: defaults to the free model (ARC) when none pinned', async () => {
  const seen = mockFetch(() => ({ status: 200, body: { choices: [{ message: { content: 'ok' } }] } }));
  await managedChat({ user: 'hi' });
  assert.equal(JSON.parse(seen[0].opts.body).model, DEFAULT_MANAGED_MODEL);
  assert.equal(DEFAULT_MANAGED_MODEL, 'ARC');
});

test('managedChat: 401 → ManagedAuthError (prompt sign-in, never leak)', async () => {
  mockFetch(() => ({ status: 401, body: { message: 'Sign in to use the house models.' } }));
  await assert.rejects(() => managedChat({ user: 'hi' }), (e) => {
    assert.ok(e instanceof ManagedAuthError);
    assert.equal(e.loginRequired, true);
    return true;
  });
});

test('managedChat: 402 free-tier cap → PaymentRequiredError carries the modal fields', async () => {
  const envelope = {
    ok: false,
    error: 'payment_required',
    feature: 'generate',
    requiredAction: 'buy_credits',
    requiredTier: 'basic',
    state: 'free',
    tier: 'free',
    creditBalanceCents: 0,
    message: 'Free generations used up — upgrade to keep going.',
  };
  mockFetch(() => ({ status: 402, body: envelope }));
  await assert.rejects(() => managedChat({ user: 'hi' }), (e) => {
    assert.ok(e instanceof PaymentRequiredError);
    assert.equal(e.feature, 'generate');
    assert.equal(e.requiredAction, 'buy_credits');
    assert.equal(e.state, 'free');
    assert.equal(e.creditBalanceCents, 0);
    assert.match(e.message, /upgrade/);
    return true;
  });
});

test('managedChat: 402 selecting a Pro model as FREE → subscribe CTA surfaces', async () => {
  const envelope = {
    error: 'payment_required',
    feature: 'generate',
    requiredAction: 'subscribe',
    requiredTier: 'pro',
    state: 'free',
    tier: 'free',
    creditBalanceCents: 0,
    message: 'URS is a Pro model.',
  };
  mockFetch(() => ({ status: 402, body: envelope }));
  await assert.rejects(() => managedChat({ user: 'hi', model: 'URS' }), (e) => {
    assert.ok(e instanceof PaymentRequiredError);
    assert.equal(e.requiredAction, 'subscribe');
    assert.equal(e.requiredTier, 'pro');
    return true;
  });
});

test('managedChat: 429 spend cap → ManagedRateLimitError with parsed retry-after (seconds)', async () => {
  mockFetch(() => ({
    status: 429,
    headers: { 'retry-after': '30' },
    body: { message: 'Per-user spend cap reached.' },
  }));
  await assert.rejects(() => managedChat({ user: 'hi' }), (e) => {
    assert.ok(e instanceof ManagedRateLimitError);
    assert.equal(e.retryAfter, 30000); // 30s → ms
    return true;
  });
});

test('managedChat: network failure → ManagedUpstreamError, no leak', async () => {
  globalThis.fetch = async () => { throw new Error('Failed to fetch (CORS / DNS)'); };
  await assert.rejects(() => managedChat({ user: 'hi' }), (e) => {
    assert.ok(e instanceof ManagedUpstreamError);
    assert.doesNotMatch(e.message, /CORS|DNS/); // internal cause is NOT echoed
    return true;
  });
});

test('managedChat: 5xx → generic ManagedUpstreamError (never echoes upstream stack)', async () => {
  mockFetch(() => ({ status: 503, body: { detail: 'postgres connection refused at 10.0.0.5:5432' } }));
  await assert.rejects(() => managedChat({ user: 'hi' }), (e) => {
    assert.ok(e instanceof ManagedUpstreamError);
    assert.equal(e.status, 503);
    assert.doesNotMatch(e.message, /postgres|10\.0\.0\.5/); // no infra leak
    return true;
  });
});

test('managedChatWithTools: loops a tool call then a final answer, cookie auth, no key header', async () => {
  const responses = [
    { choices: [{ message: { content: null, tool_calls: [
      { id: 'call_1', function: { name: 'get_page_outline', arguments: '{}' } },
    ] } }] },
    { choices: [{ message: { content: 'Done — outlined and edited.' } }] },
  ];
  const seen = mockFetch(() => ({ status: 200, body: responses[Math.min(seen.length, responses.length - 1)] }));
  // note: seen.length grows inside handler; simplify by indexing safely
  let i = 0;
  globalThis.fetch = async (url, opts) => {
    seen.push({ url, opts });
    const body = responses[Math.min(i, responses.length - 1)]; i += 1;
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => body };
  };
  const dispatchCalls = [];
  const { text, calls } = await managedChatWithTools({
    user: 'edit the hero',
    tools: [{ type: 'function', function: { name: 'get_page_outline' } }],
    dispatch: async () => [{ index: 0, label: 'h1' }],
  });
  assert.equal(text, 'Done — outlined and edited.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'get_page_outline');
  assert.equal(seen[0].opts.credentials, 'include');
  assert.equal(seen[0].opts.headers.authorization, undefined);
  void dispatchCalls;
});

test('managedBaseUrl: strips trailing slashes, honours override', () => {
  assert.equal(managedBaseUrl('https://gw.rhobear.ai/'), 'https://gw.rhobear.ai');
  assert.equal(managedBaseUrl(''), '');
  assert.equal(managedBaseUrl(undefined), '');
});
