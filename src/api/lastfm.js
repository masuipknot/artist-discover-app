const API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;

function buildUrl(params) {
  const search = new URLSearchParams({
    ...params,
    api_key: API_KEY,
    format: 'json',
  });
  return `${API_BASE}?${search.toString()}`;
}

async function request(params) {
  const res = await fetch(buildUrl(params));
  if (!res.ok) {
    throw new Error(`Last.fm request failed: ${res.status}`);
  }
  return res.json();
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// artist.search — used for the input suggestions.
export async function searchArtists(query, limit = 8) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await request({ method: 'artist.search', artist: trimmed, limit });
  const matches = toArray(data?.results?.artistmatches?.artist);
  return matches.map((a) => a.name);
}

// artist.getSimilar — used to build the network. `match` comes back as a
// string (e.g. "0.453359"), so convert it to a number here.
export async function getSimilarArtists(name, limit) {
  const data = await request({ method: 'artist.getSimilar', artist: name, limit });
  const similar = toArray(data?.similarartists?.artist);
  return similar.map((a) => ({ name: a.name, match: Number(a.match) || 0 }));
}
