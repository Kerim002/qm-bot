import { PathNode, Position } from "../types/global";
import { getAdjacentPositions } from "./getAdjacentPositions";
import { isBlocked } from "./isBlocked";
import { positionsEqual } from "./positionsEqual";

export const findShortestPath = (
  start: Position,
  target: Position,
  blockedPositions: string[],
  opponentBlockedArea: Position[],
  maxSteps: number = 3
): Position[] | null => {
  if (positionsEqual(start, target)) {
    return [];
  }

  const queue: PathNode[] = [
    {
      pos: start,
      path: [],
      steps: 0,
    },
  ];

  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.steps >= maxSteps) continue;

    const adjacent = getAdjacentPositions(current.pos);

    for (const nextPos of adjacent) {
      const posKey = `${nextPos.x},${nextPos.y}`;

      if (visited.has(posKey)) continue;
      if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;

      const newPath = [...current.path, nextPos];

      if (positionsEqual(nextPos, target)) {
        return newPath;
      }

      visited.add(posKey);
      queue.push({
        pos: nextPos,
        path: newPath,
        steps: current.steps + 1,
      });
    }
  }

  return null;
};
