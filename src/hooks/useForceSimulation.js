import { useEffect, useRef, useState } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';

// Runs a d3-force simulation over the given nodes/links and returns a ticking
// snapshot of positions. d3 mutates the node objects, so we clone the input.
export function useForceSimulation(graph, width, height) {
  const [frame, setFrame] = useState({ nodes: [], links: [] });
  const simRef = useRef(null);

  useEffect(() => {
    if (!graph || !width || !height) return undefined;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.3;

    const peripherals = graph.nodes.filter((n) => !n.center);
    const nodes = graph.nodes.map((n, i) => {
      if (n.center) {
        return { ...n, x: cx, y: cy };
      }
      // Even angular spread on a circle as an initial-position hint.
      const idx = peripherals.indexOf(n);
      const angle = (idx / peripherals.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...n,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });

    const links = graph.links.map((l) => ({ ...l }));

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink(links)
          .id((d) => d.id)
          .distance(radius)
          .strength(0.2),
      )
      .force('charge', forceManyBody().strength(-600))
      .force('center', forceCenter(cx, cy))
      .force('collide', forceCollide(48))
      .alphaDecay(0.02)
      .on('tick', () => {
        setFrame({
          nodes: nodes.map((n) => ({ ...n })),
          // forceLink() rewrites l.source/l.target from id strings to node
          // object references once the simulation initializes — normalize
          // back to ids so NetworkGraph can look nodes up by id.
          links: links.map((l) => ({
            source: typeof l.source === 'object' ? l.source.id : l.source,
            target: typeof l.target === 'object' ? l.target.id : l.target,
          })),
        });
      });

    simRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graph, width, height]);

  return frame;
}
