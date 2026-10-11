import {
  CENTER_FONT_SIZE,
  NODE_FONT_SIZE,
  LABEL_OFFSET,
  CENTER_LABEL_OFFSET,
  HIT_RADIUS,
} from '../config.js';
import { estimateTextWidth } from './forceLabelCollide.js';

// Tap area of a node's label, relative to the node's center.
export function labelHitRect(node) {
  const fontSize = node.center ? CENTER_FONT_SIZE : NODE_FONT_SIZE;
  const offset = node.center ? CENTER_LABEL_OFFSET : LABEL_OFFSET;
  const width = estimateTextWidth(node.name, fontSize) + 8;
  return { x: -width / 2, y: -(offset + fontSize), width, height: fontSize + 8 };
}

// Tap areas of neighbouring nodes can overlap, and the topmost one would win
// by paint order. Instead, pick the node whose dot or label center is nearest
// to the tap among those whose tap area contains it. Returns null if none.
export function pickNode(nodes, px, py) {
  let best = null;
  let bestDist = Infinity;

  for (const node of nodes) {
    let dist = Infinity;

    const dotDist = Math.hypot(px - node.x, py - node.y);
    if (dotDist <= HIT_RADIUS) dist = dotDist;

    const r = labelHitRect(node);
    const left = node.x + r.x;
    const top = node.y + r.y;
    if (px >= left && px <= left + r.width && py >= top && py <= top + r.height) {
      dist = Math.min(dist, Math.hypot(px - (left + r.width / 2), py - (top + r.height / 2)));
    }

    if (dist < bestDist) {
      best = node;
      bestDist = dist;
    }
  }

  return best;
}
