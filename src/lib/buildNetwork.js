import { getSimilarArtists } from '../api/lastfm.js';
import { RELATED_COUNT } from '../config.js';

// Given a center artist name, resolve the related artists (RELATED_COUNT) and
// link the center to each. Each node carries its raw `match` and a `matchNorm`
// (0–1, min-max normalized across this result set) used for layout distance.
export async function buildNetwork(centerName) {
  const similar = await getSimilarArtists(centerName, RELATED_COUNT);

  const centerKey = centerName.trim().toLowerCase();
  const seen = new Set([centerKey]);
  const related = similar.filter(({ name }) => {
    const key = name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const matches = related.map((a) => a.match);
  const min = Math.min(...matches);
  const max = Math.max(...matches);
  const normalize = (m) => (max > min ? (m - min) / (max - min) : 0.5);

  const nodes = [
    { id: centerName, name: centerName, center: true },
    ...related.map(({ name, match }) => ({
      id: name,
      name,
      center: false,
      match,
      matchNorm: normalize(match),
    })),
  ];

  const links = related.map(({ name }) => ({
    source: centerName,
    target: name,
  }));

  return { nodes, links };
}
