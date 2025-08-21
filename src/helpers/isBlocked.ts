import { Position } from "../types/global";

export function isBlocked(
  pos: Position,
  blockedPositions: string[],
  opponentBlockedArea: Position[]
): boolean {
  const posStr = `${pos.x},${pos.y}`;

  if (blockedPositions.includes(posStr)) return true;

  if (
    opponentBlockedArea.some(
      (blocked) => blocked.x === pos.x && blocked.y === pos.y
    )
  )
    return true;

  return false;
}
