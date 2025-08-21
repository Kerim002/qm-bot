import { Position } from "../types/global";
import { isValidPosition } from "./isValidPosition";

export function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  const directions: Position[] = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
  ];

  for (const direction of directions) {
    const newX = pos.x + direction.x;
    const newY = pos.y + direction.y;
    if (isValidPosition({ x: newX, y: newY })) {
      adjacent.push({ x: newX, y: newY });
    }
  }

  return adjacent;
}
