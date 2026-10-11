import { useEffect, useState } from 'react';
import { forceSimulation, forceManyBody } from 'd3-force';
import { forceEllipseRadial } from '../lib/forceEllipseRadial.js';
import {
  clampLabelsToView,
  forceLabelCollide,
  labelBox,
} from '../lib/forceLabelCollide.js';
import { placeNodes } from '../lib/initialLayout.js';
import { computeViewLayout } from '../lib/viewLayout.js';

// Runs a d3-force simulation and returns a ticking snapshot of positions.
// Distance from the center is driven by forceEllipseRadial (higher match =
// closer) on an ellipse fitted to the screen; d3 mutates the node objects, so
// the input is cloned.
export function useForceSimulation(graph, width, height, safeBottom = 0) {
  const [frame, setFrame] = useState({ nodes: [], links: [] });

  useEffect(() => {
    if (!graph || !width || !height) return undefined;

    const view = computeViewLayout(width, height, safeBottom);
    const nodes = placeNodes(graph, view);
    nodes.forEach((d) => {
      d.box = labelBox(d);
    });

    const simulation = forceSimulation(nodes)
      .force('radial', forceEllipseRadial((d) => d.targetRatio, view).strength(0.6))
      .force('charge', forceManyBody().strength(-80).distanceMax(220))
      .force('collide', forceLabelCollide((d) => d.box))
      .alphaDecay(0.03)
      .on('tick', () => {
        clampLabelsToView(nodes, view);
        setFrame({
          nodes: nodes.map((n) => ({ ...n })),
          links: graph.links,
        });
      });

    return () => {
      simulation.stop();
    };
  }, [graph, width, height, safeBottom]);

  return frame;
}
