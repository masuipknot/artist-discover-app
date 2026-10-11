// Number of related artists shown around the center. Change this one value
// (e.g. 10 / 15 / 20 / 30) to compare layouts; it feeds getSimilar's limit.
export const RELATED_COUNT = 15;

// Distance from the center (px) for the most / least related artist, tuned for
// a large screen. On smaller screens the layout scales down so MAX_DISTANCE
// still fits (see useForceSimulation).
export const MIN_DISTANCE = 110;
export const MAX_DISTANCE = 300;

// Exponent applied to the normalized match before mapping to distance.
// 1 = linear; < 1 (0.5 = square root) spreads out artists whose match values
// are bunched near the minimum when the top result is an outlier.
export const DISTANCE_CURVE = 0.5;

// Initial angle placement. The circle is split into RELATED_COUNT equal slots
// starting at ANGLE_START; ranks are shuffled (seeded by the center artist's
// name) onto the slots, so angle carries no similarity information.
export const ANGLE_START = -Math.PI / 2;

// Random offset inside a slot, as a ratio of the slot width (2π / count).
// Clamped to 0..MAX_ANGLE_JITTER; above 0.8 neighbouring slots start to overlap.
export const ANGLE_JITTER = 0.5;
export const MAX_ANGLE_JITTER = 0.8;

// Random offset of the target distance, as a ratio of the distance (±ratio).
// Distance encodes similarity, so keep it small: clamped to 0..MAX_DISTANCE_JITTER.
export const DISTANCE_JITTER = 0;
export const MAX_DISTANCE_JITTER = 0.1;

// Label font sizes (px), shared by rendering and the collision estimate.
export const CENTER_FONT_SIZE = 15;
export const NODE_FONT_SIZE = 12;
