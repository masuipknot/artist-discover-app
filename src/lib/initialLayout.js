import {
  MIN_RADIUS_RATIO,
  MAX_RADIUS_RATIO,
  DISTANCE_CURVE,
  ANGLE_START,
  ANGLE_JITTER,
  MAX_ANGLE_JITTER,
  DISTANCE_JITTER,
  MAX_DISTANCE_JITTER,
} from '../config.js';
import { hashString, mulberry32, shuffle } from './seededRandom.js';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Builds the simulation nodes with initial positions on the view's ellipse and
// each node's target distance (`targetRatio`: 0 = center, 1 = ellipse edge,
// used by forceEllipseRadial). Angles come from shuffling ranks onto equal
// slots with a PRNG seeded by the center artist's name, so the same artist
// always gets the same layout.
export function placeNodes(
  graph,
  { cx, cy, rx, ry },
  { angleJitter = ANGLE_JITTER, distanceJitter = DISTANCE_JITTER } = {},
) {
  const centerNode = graph.nodes.find((n) => n.center);
  const related = graph.nodes.filter((n) => !n.center);
  const count = related.length;
  const step = count ? (Math.PI * 2) / count : 0;

  const aJitter = clamp(angleJitter, 0, MAX_ANGLE_JITTER);
  const dJitter = clamp(distanceJitter, 0, MAX_DISTANCE_JITTER);

  const rand = mulberry32(hashString(centerNode.name.trim().toLowerCase()));
  const slots = shuffle(
    Array.from({ length: count }, (_, k) => k),
    rand,
  );
  const rankOf = new Map(related.map((n, i) => [n, i]));

  return graph.nodes.map((n) => {
    if (n.center) {
      return { ...n, x: cx, y: cy, fx: cx, fy: cy, targetRatio: 0 };
    }

    // Always draw both random values so changing one jitter setting doesn't
    // shift the other's layout.
    const angleRand = rand();
    const distanceRand = rand();

    const angle =
      ANGLE_START + slots[rankOf.get(n)] * step + (angleRand - 0.5) * step * aJitter;

    const closeness = n.matchNorm ** DISTANCE_CURVE;
    const baseRatio =
      MIN_RADIUS_RATIO + (1 - closeness) * (MAX_RADIUS_RATIO - MIN_RADIUS_RATIO);
    const targetRatio = baseRatio * (1 + (distanceRand - 0.5) * 2 * dJitter);

    // Start closer in so nodes drift outward on load.
    const startRatio = targetRatio * 0.5;
    return {
      ...n,
      targetRatio,
      x: cx + Math.cos(angle) * startRatio * rx,
      y: cy + Math.sin(angle) * startRatio * ry,
    };
  });
}
