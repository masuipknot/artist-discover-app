// Number of related artists shown around the center. Change this one value
// (e.g. 10 / 15 / 20 / 30) to compare layouts; it feeds getSimilar's limit.
export const RELATED_COUNT = 15;

// Distance from the center (px) for the most / least related artist, tuned for
// a large screen. On smaller screens the layout scales down so MAX_DISTANCE
// still fits (see useForceSimulation).
export const MIN_DISTANCE = 110;
export const MAX_DISTANCE = 300;

// Label font sizes (px), shared by rendering and the collision estimate.
export const CENTER_FONT_SIZE = 15;
export const NODE_FONT_SIZE = 12;
