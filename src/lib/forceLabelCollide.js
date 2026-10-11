import {
  CENTER_FONT_SIZE,
  NODE_FONT_SIZE,
  LABEL_OFFSET,
  CENTER_LABEL_OFFSET,
  CENTER_DOT_RADIUS,
  NODE_DOT_RADIUS,
  VIEW_MARGIN,
} from '../config.js';

const STRENGTH = 0.7;
const ITERATIONS = 2;

// Rough text width (px): CJK/full-width glyphs ≈ 1em, Latin ≈ 0.58em.
export function estimateTextWidth(text, fontSize) {
  let width = 0;
  for (const ch of text) {
    width += ch.charCodeAt(0) > 0x7f ? fontSize : fontSize * 0.58;
  }
  return width;
}

// Label box for a node: w/h are used for collision (padded); top/bottom are how
// far the label + dot extend above/below the node's center, used for clamping.
export function labelBox(d) {
  const fontSize = d.center ? CENTER_FONT_SIZE : NODE_FONT_SIZE;
  const labelOffset = d.center ? CENTER_LABEL_OFFSET : LABEL_OFFSET;
  const dotRadius = d.center ? CENTER_DOT_RADIUS : NODE_DOT_RADIUS;
  return {
    w: estimateTextWidth(d.name, fontSize) + 12,
    h: fontSize + 14,
    top: labelOffset + fontSize,
    bottom: dotRadius + 1,
  };
}

// Keeps every label fully on screen (using the same label width as the
// collision force) and above the search bar. Call after each tick; needs
// `node.box` from labelBox().
export function clampLabelsToView(nodes, { width, bottom }) {
  for (const d of nodes) {
    if (d.fx != null) continue;
    const { w, top, bottom: below } = d.box;
    const xMin = w / 2 + VIEW_MARGIN;
    const xMax = width - w / 2 - VIEW_MARGIN;
    const yMin = top + VIEW_MARGIN;
    const yMax = bottom - below - VIEW_MARGIN;

    // A label wider than the screen can't fit; center it instead.
    const x = xMin > xMax ? width / 2 : Math.min(Math.max(d.x, xMin), xMax);
    const y = Math.min(Math.max(d.y, yMin), Math.max(yMax, yMin));
    if (x !== d.x) d.vx = 0;
    if (y !== d.y) d.vy = 0;
    d.x = x;
    d.y = y;
  }
}

// d3-force style collision force using each node's label box (w × h) instead of
// a circle, since labels are wide and short. Pinned nodes (fx set) don't move.
export function forceLabelCollide(getBox) {
  let nodes = [];
  let boxes = [];

  function force() {
    for (let iter = 0; iter < ITERATIONS; iter += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const overlapX = (boxes[i].w + boxes[j].w) / 2 - Math.abs(dx);
          const overlapY = (boxes[i].h + boxes[j].h) / 2 - Math.abs(dy);
          if (overlapX <= 0 || overlapY <= 0) continue;

          const aPinned = a.fx != null;
          const bPinned = b.fx != null;
          if (aPinned && bPinned) continue;
          const wa = aPinned ? 0 : bPinned ? 1 : 0.5;
          const wb = 1 - wa;

          // Separate along the axis with the smaller overlap.
          if (overlapX < overlapY) {
            const push = (dx >= 0 ? 1 : -1) * overlapX * STRENGTH;
            a.vx -= push * wa;
            b.vx += push * wb;
          } else {
            const push = (dy >= 0 ? 1 : -1) * overlapY * STRENGTH;
            a.vy -= push * wa;
            b.vy += push * wb;
          }
        }
      }
    }
  }

  force.initialize = (initNodes) => {
    nodes = initNodes;
    boxes = nodes.map(getBox);
  };

  return force;
}
