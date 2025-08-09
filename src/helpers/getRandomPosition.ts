import { Position } from "../types/global";

export function getRandomPosition(positions: Position[][]): [number, number][] {
  const randomIndex = Math.floor(Math.random() * positions.length);
  const selectedPositions = positions[randomIndex];

  return selectedPositions.map((pos) => [pos.x, pos.y]);
}
