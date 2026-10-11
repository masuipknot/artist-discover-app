import { useEffect, useState } from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceRadial,
} from 'd3-force';
import { MAX_DISTANCE, CENTER_FONT_SIZE, NODE_FONT_SIZE } from '../config.js';
import {
  estimateTextWidth,
  forceLabelCollide,
} from '../lib/forceLabelCollide.js';
import { placeNodes } from '../lib/initialLayout.js';

// Space kept free below the graph for the search bar, and around the edges for
// labels.
const BOTTOM_RESERVE = 90;
const SIDE_MARGIN = 70;
const TOP_MARGIN = 30;

// Runs a d3-force simulation and returns a ticking snapshot of positions.
// Distance from the center is driven by forceRadial (higher match = closer);
// d3 mutates the node objects, so the input is cloned.
export function useForceSimulation(graph, width, height) {
  const [frame, setFrame] = useState({ nodes: [], links: [] });

  useEffect(() => {
    if (!graph || !width || !height) return undefined;

    const cx = width / 2;
    const cy = (height - BOTTOM_RESERVE) / 2;

    // Scale distances down on small screens so MAX_DISTANCE still fits.
    const available = Math.min(cx - SIDE_MARGIN, cy - TOP_MARGIN);
    const scale = Math.min(1, Math.max(available, 1) / MAX_DISTANCE);

    const nodes = placeNodes(graph, { cx, cy, scale });

    const simulation = forceSimulation(nodes)
      .force('radial', forceRadial((d) => d.targetRadius, cx, cy).strength(0.6))
      .force('charge', forceManyBody().strength(-80).distanceMax(220))
      .force(
        'collide',
        forceLabelCollide((d) => {
          const fontSize = d.center ? CENTER_FONT_SIZE : NODE_FONT_SIZE;
          return {
            w: estimateTextWidth(d.name, fontSize) + 12,
            h: fontSize + 14,
          };
        }),
      )
      .alphaDecay(0.03)
      .on('tick', () => {
        setFrame({
          nodes: nodes.map((n) => ({ ...n })),
          links: graph.links,
        });
      });

    return () => {
      simulation.stop();
    };
  }, [graph, width, height]);

  return frame;
}
