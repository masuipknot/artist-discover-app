// Relay API in front of Last.fm so the API key never reaches the browser.
//   GET /api/search?q=...                 -> { artists: [name, ...] }
//   GET /api/similar?artist=...&limit=... -> { artists: [{ name, match }, ...] }
// The key is read from env.LASTFM_API_KEY and is never included in a response,
// error message, or log line.

const LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/';
const MAX_TEXT_LENGTH = 100;
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const SEARCH_LIMIT = 8;
const UPSTREAM_TIMEOUT_MS = 8000;

const CACHE_OK = 'public, max-age=3600';
const CACHE_NONE = 'no-store';

function json(body, status = 200, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': status === 200 ? CACHE_OK : CACHE_NONE,
      ...extraHeaders,
    },
  });
}

const badRequest = (message) => json({ error: 'bad_request', message }, 400);

function parseText(value, name) {
  const text = (value ?? '').trim();
  if (!text) return { error: `${name} is required` };
  if (text.length > MAX_TEXT_LENGTH) {
    return { error: `${name} must be ${MAX_TEXT_LENGTH} characters or fewer` };
  }
  return { value: text };
}

function parseLimit(value) {
  if (value === null) return { value: DEFAULT_LIMIT };
  if (!/^\d+$/.test(value)) return { error: 'limit must be an integer' };
  const limit = Number(value);
  if (limit < 1 || limit > MAX_LIMIT) {
    return { error: `limit must be between 1 and ${MAX_LIMIT}` };
  }
  return { value: limit };
}

class UpstreamError extends Error {
  constructor(status) {
    super('upstream_error');
    this.status = status;
  }
}

class ConfigError extends Error {}

// Calls Last.fm. Error messages and logs deliberately omit the request URL,
// which contains the API key.
async function callLastfm(env, params) {
  if (!env.LASTFM_API_KEY) throw new ConfigError('LASTFM_API_KEY is not configured');

  const url = new URL(LASTFM_URL);
  for (const [k, v] of Object.entries({ ...params, api_key: env.LASTFM_API_KEY, format: 'json' })) {
    url.searchParams.set(k, String(v));
  }

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch (err) {
    throw new UpstreamError(err?.name === 'TimeoutError' ? 504 : 502);
  }
  if (!res.ok) throw new UpstreamError(502);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new UpstreamError(502);
  }
  // Last.fm reports many failures as HTTP 200 with an `error` field.
  if (data?.error) throw new UpstreamError(502);
  return data;
}

const toArray = (v) => (v ? (Array.isArray(v) ? v : [v]) : []);

async function handleSearch(url, env) {
  const q = parseText(url.searchParams.get('q'), 'q');
  if (q.error) return badRequest(q.error);

  const data = await callLastfm(env, {
    method: 'artist.search',
    artist: q.value,
    limit: SEARCH_LIMIT,
  });
  const artists = toArray(data?.results?.artistmatches?.artist).map((a) => a.name);
  return json({ artists });
}

async function handleSimilar(url, env) {
  const artist = parseText(url.searchParams.get('artist'), 'artist');
  if (artist.error) return badRequest(artist.error);
  const limit = parseLimit(url.searchParams.get('limit'));
  if (limit.error) return badRequest(limit.error);

  const data = await callLastfm(env, {
    method: 'artist.getSimilar',
    artist: artist.value,
    limit: limit.value,
  });
  const artists = toArray(data?.similarartists?.artist).map((a) => ({
    name: a.name,
    match: Number(a.match) || 0,
  }));
  return json({ artists });
}

const routes = {
  '/api/search': handleSearch,
  '/api/similar': handleSimilar,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const handler = routes[url.pathname];
    if (!handler) return json({ error: 'not_found' }, 404);

    if (request.method !== 'GET') {
      return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
    }

    try {
      return await handler(url, env);
    } catch (err) {
      if (err instanceof UpstreamError) {
        console.error(`Last.fm request failed (${err.status})`);
        return json({ error: 'upstream_error' }, err.status);
      }
      console.error(err instanceof ConfigError ? err.message : `Unexpected error (${err?.name})`);
      return json({ error: 'server_error' }, 500);
    }
  },
};
