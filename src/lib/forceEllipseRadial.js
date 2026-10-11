// Like d3.forceRadial, but pulls nodes toward an ellipse instead of a circle.
// Node positions are mapped into "unit space" ((x - cx) / rx, (y - cy) / ry),
// where the ellipse is a circle; the gap to the target ratio (0 = center,
// 1 = ellipse edge) is computed there and the correction is scaled back to
// screen space. Pinned nodes (fx set) are skipped.
export function forceEllipseRadial(getRatio, { cx, cy, rx, ry }) {
  let nodes = [];
  let ratios = [];
  let strength = 0.1;

  function force(alpha) {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.fx != null) continue;
      const u = (node.x - cx) / rx || 1e-6;
      const v = (node.y - cy) / ry || 1e-6;
      const dist = Math.hypot(u, v);
      const k = ((ratios[i] - dist) * strength * alpha) / dist;
      node.vx += u * k * rx;
      node.vy += v * k * ry;
    }
  }

  force.initialize = (initNodes) => {
    nodes = initNodes;
    ratios = nodes.map((d) => getRatio(d));
  };

  force.strength = (s) => {
    if (s === undefined) return strength;
    strength = s;
    return force;
  };

  return force;
}
