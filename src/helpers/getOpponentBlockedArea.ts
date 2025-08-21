import { Position } from "../types/global";
import { isValidPosition } from "./isValidPosition";

export function getOpponentBlockedArea(opponentPos: Position): Position[] {
  const blockedArea: Position[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = opponentPos.x + dx;
      const y = opponentPos.y + dy;

      if (isValidPosition({ x, y })) {
        blockedArea.push({ x, y });
      }
    }
  }

  return blockedArea;
}
