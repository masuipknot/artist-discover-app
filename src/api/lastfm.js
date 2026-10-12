// Talks to our own relay API (worker/index.js), never to Last.fm directly, so
// the Last.fm API key stays on the server.

async function request(path, params) {
  const res = await fetch(`${path}?${new URLSearchParams(params)}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status}`);
  }
  return res.json();
}

// /api/search — used for the input suggestions.
export async function searchArtists(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await request('/api/search', { q: trimmed });
  return data.artists;
}

// /api/similar — used to build the network. `match` is already a number.
export async function getSimilarArtists(name, limit) {
  const data = await request('/api/similar', { artist: name, limit });
  return data.artists;
}
