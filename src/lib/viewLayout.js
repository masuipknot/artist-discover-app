import { INPUT_BAR_HEIGHT, VIEW_MARGIN, MAX_ASPECT } from '../config.js';

// Works out where the graph lives on screen: the center point and the
// ellipse radii, fitted to the area above the search bar and limited so the
// ellipse is never stretched more than MAX_ASPECT.
//   bottom: y coordinate where the search bar (and device safe area) begins.
export function computeViewLayout(width, height, safeBottom = 0) {
  const bottom = Math.max(height - INPUT_BAR_HEIGHT - safeBottom, 1);
  const cx = width / 2;
  const cy = bottom / 2;

  let rx = Math.max(width / 2 - VIEW_MARGIN, 1);
  let ry = Math.max(bottom / 2 - VIEW_MARGIN, 1);
  if (ry > rx * MAX_ASPECT) ry = rx * MAX_ASPECT;
  else if (rx > ry * MAX_ASPECT) rx = ry * MAX_ASPECT;

  return { width, bottom, cx, cy, rx, ry };
}
