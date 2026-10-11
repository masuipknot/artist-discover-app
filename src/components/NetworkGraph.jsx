import { useRef } from 'react';
import { useForceSimulation } from '../hooks/useForceSimulation.js';
import { labelHitRect, pickNode } from '../lib/hitTest.js';
import {
  CENTER_FONT_SIZE,
  NODE_FONT_SIZE,
  LABEL_OFFSET,
  CENTER_LABEL_OFFSET,
  CENTER_DOT_RADIUS,
  NODE_DOT_RADIUS,
  HIT_RADIUS,
} from '../config.js';

export default function NetworkGraph({
  graph,
  width,
  height,
  safeBottom,
  onSelectArtist,
}) {
  const frame = useForceSimulation(graph, width, height, safeBottom);
  const svgRef = useRef(null);

  const positions = new Map(frame.nodes.map((n) => [n.id, n]));

  // Resolve the tap to the nearest node, not whichever tap area is on top.
  const handleTap = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    const node = pickNode(frame.nodes, e.clientX - box.left, e.clientY - box.top);
    if (node) onSelectArtist(node.name);
  };

  return (
    <svg
      ref={svgRef}
      className="network-graph"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <g>
        {frame.links.map((link, i) => {
          const a = positions.get(link.source);
          const b = positions.get(link.target);
          if (!a || !b) return null;
          return (
            <line
              key={`link-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--line)"
              strokeWidth={1}
            />
          );
        })}
      </g>
      <g>
        {frame.nodes.map((node) => {
          const hit = labelHitRect(node);
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="node"
              onClick={handleTap}
            >
              <circle r={HIT_RADIUS} fill="transparent" />
              <rect
                x={hit.x}
                y={hit.y}
                width={hit.width}
                height={hit.height}
                fill="transparent"
              />
              <circle
                r={node.center ? CENTER_DOT_RADIUS : NODE_DOT_RADIUS}
                fill={node.center ? 'var(--fg)' : 'var(--bg)'}
                stroke="var(--line-strong)"
                strokeWidth={1.5}
              />
              <text
                className="node-label"
                y={node.center ? -CENTER_LABEL_OFFSET : -LABEL_OFFSET}
                textAnchor="middle"
                fontSize={node.center ? CENTER_FONT_SIZE : NODE_FONT_SIZE}
                fontWeight={node.center ? 600 : 400}
                fill="var(--fg)"
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
