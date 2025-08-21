import { Position } from "../types/global";

export function isValidPosition(position: Position): boolean {
  const boardSize = 9;
  return (
    position.x >= 0 &&
    position.x < boardSize &&
    position.y >= 0 &&
    position.y < boardSize
  );
}
