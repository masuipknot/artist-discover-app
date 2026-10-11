// Number of related artists shown around the center. Change this one value
// (e.g. 10 / 15 / 20 / 30) to compare layouts; it feeds getSimilar's limit.
export const RELATED_COUNT = 15;

// Space the search bar takes from the bottom edge of the screen (px): the
// 24px offset in .search-bar (App.css) + the 44px input. Keep in sync with
// App.css; the device's bottom safe area is added on top of this at runtime.
export const INPUT_BAR_HEIGHT = 68;

// Margin kept between the graph and the screen edges / search bar (px).
export const VIEW_MARGIN = 16;

// The graph is laid out on an ellipse that fits the screen (see viewLayout.js).
// MAX_ASPECT caps how far it may be stretched: ry <= rx * MAX_ASPECT on tall
// screens, rx <= ry * MAX_ASPECT on wide ones.
export const MAX_ASPECT = 1.5;

// Distance of the most / least related artist from the center, as a ratio of
// the ellipse radii (0 = center, 1 = ellipse edge). Chosen so a 1440x900
// screen looks like the earlier 110px–300px circle along the short axis.
export const MIN_RADIUS_RATIO = 0.275;
export const MAX_RADIUS_RATIO = 0.75;

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

// Radius (px) of the invisible tap area around each node's dot.
export const HIT_RADIUS = 22;

// Label font sizes (px), shared by rendering and the collision estimate.
export const CENTER_FONT_SIZE = 15;
export const NODE_FONT_SIZE = 12;

// Label baseline offset above the node's center (px), and node dot radii.
export const LABEL_OFFSET = 14;
export const CENTER_LABEL_OFFSET = 18;
export const CENTER_DOT_RADIUS = 8;
export const NODE_DOT_RADIUS = 5;
