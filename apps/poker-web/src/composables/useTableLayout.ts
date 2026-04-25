export interface SeatPosition {
  x: number; // % from left (0–100)
  y: number; // % from top  (0–100)
}

// Horizontal / vertical reach of the seat ellipse as % of the container dimensions.
const RX = 42;
const RY = 36;

/**
 * Distribute `count` seats evenly around an ellipse.
 *
 * Index 0 → bottom-centre (local player's reserved slot).
 * Remaining indices go clockwise starting just past the bottom.
 */
export function computeTableLayout(count: number): SeatPosition[] {
  if (count === 0) {
    return [];
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const step = 360 / count;

  return Array.from({ length: count }, (_, i) => {
    // In CSS coords y increases downward, so angle 90° = bottom.
    const angle = 90 + i * step;
    return {
      x: 50 + RX * Math.cos(toRad(angle)),
      y: 50 + RY * Math.sin(toRad(angle)),
    };
  });
}
