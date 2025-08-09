import { Position } from "../types/global";

export function getSectionCenters(): Position[] {
  const centers: Position[] = [];

  const sectionStarts = [0, 3, 6];

  for (const rowStart of sectionStarts) {
    for (const colStart of sectionStarts) {
      const centerX = rowStart + 1;
      const centerY = colStart + 1;

      // Skip the global center [4,4]
      if (centerX === 4 && centerY === 4) continue;

      centers.push({ x: centerX, y: centerY });
    }
  }

  return centers;
}
