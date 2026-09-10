import { useForceSimulation } from '../hooks/useForceSimulation.js';

export default function NetworkGraph({ graph, width, height, onSelectArtist }) {
  const frame = useForceSimulation(graph, width, height);

  const positions = new Map(frame.nodes.map((n) => [n.id, n]));

  return (
    <svg
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
        {frame.nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            className="node"
            onClick={() => onSelectArtist(node.name)}
          >
            <circle
              r={node.center ? 8 : 5}
              fill={node.center ? 'var(--fg)' : 'var(--bg)'}
              stroke="var(--line-strong)"
              strokeWidth={1.5}
            />
            <text
              y={node.center ? -18 : -14}
              textAnchor="middle"
              fontSize={node.center ? 15 : 12}
              fontWeight={node.center ? 600 : 400}
              fill="var(--fg)"
            >
              {node.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
