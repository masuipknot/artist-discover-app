import { getSimilarArtists } from '../api/lastfm.js';

const PERIPHERAL_COUNT = 6;

// Given a center artist name, resolve the 6 peripheral artists and link the
// center to each of them. Peripheral-to-peripheral links are intentionally
// omitted to keep the graph visually simple.
export async function buildNetwork(centerName) {
  const peripheralNames = await getSimilarArtists(centerName, PERIPHERAL_COUNT);

  const nodes = [
    { id: centerName, name: centerName, center: true },
    ...peripheralNames.map((name) => ({ id: name, name, center: false })),
  ];

  const links = peripheralNames.map((name) => ({
    source: centerName,
    target: name,
  }));

  return { nodes, links };
}
