import { getSimilarArtists } from '../api/lastfm.js';

const PERIPHERAL_COUNT = 6;
const CROSS_CHECK_LIMIT = 50;

const normalize = (s) => s.trim().toLowerCase();

// Given a center artist name, resolve the 6 peripheral artists, then work out
// which peripheral pairs are related (one-directional match is enough).
export async function buildNetwork(centerName) {
  const peripheralNames = await getSimilarArtists(centerName, PERIPHERAL_COUNT);

  const similarLists = await Promise.all(
    peripheralNames.map((name) =>
      getSimilarArtists(name, CROSS_CHECK_LIMIT).catch(() => []),
    ),
  );

  const similarSets = similarLists.map((list) => new Set(list.map(normalize)));

  const nodes = [
    { id: centerName, name: centerName, center: true },
    ...peripheralNames.map((name) => ({ id: name, name, center: false })),
  ];

  const links = [];

  // Center is always linked to every peripheral artist.
  for (const name of peripheralNames) {
    links.push({ source: centerName, target: name });
  }

  // Peripheral-to-peripheral links: draw a line if either side lists the other.
  for (let i = 0; i < peripheralNames.length; i += 1) {
    for (let j = i + 1; j < peripheralNames.length; j += 1) {
      const a = peripheralNames[i];
      const b = peripheralNames[j];
      if (similarSets[i].has(normalize(b)) || similarSets[j].has(normalize(a))) {
        links.push({ source: a, target: b });
      }
    }
  }

  return { nodes, links };
}
