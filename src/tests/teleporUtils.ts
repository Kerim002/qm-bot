export type Position = [number, number];

export interface OccupiedPosition {
  pos: Position;
  ownerId?: number; // who captured
  opSpent: number; // how many OP used to capture
}

export interface PlayerSchema {
  id: number;
  name: string;
  position: Position;
  hp: number;
  coins: number;
  power_points: number;
}

// teleportUtils.ts

// corners (teleport gates)
export const TELEPORT_CORNERS: Position[] = [
  [0, 0],
  [0, 8],
  [8, 0],
  [8, 8],
];

/**
 * Score a single occupation cell
 */
function scoreOccupation(cell: OccupiedPosition, botId: number): number {
  if (!cell) return 0;

  // uncaptured
  if (cell.ownerId === undefined) {
    return 5;
  }

  // opponent-owned
  if (cell.ownerId !== botId) {
    return Math.max(10 - cell.opSpent, 1);
  }

  // already bot-owned
  return 0;
}

/**
 * Score all occupation centers around a given point
 */
export function scoreArea(
  center: Position,
  allCenters: OccupiedPosition[],
  botId: number,
  radius: number = 3
): number {
  let total = 0;
  for (const cell of allCenters) {
    const [cx, cy] = cell.pos;
    const dist = Math.abs(cx - center[0]) + Math.abs(cy - center[1]);
    if (dist <= radius) {
      total += scoreOccupation(cell, botId);
    }
  }
  return total;
}

/**
 * Decide if bot should teleport and to which corner
 */
export function shouldTeleport(
  bot: PlayerSchema,
  hasTeleportStone: boolean,
  allCenters: OccupiedPosition[],
  threshold: number = 3
): Position | null {
  if (!hasTeleportStone) return null;

  const currentScore = scoreArea(bot.position, allCenters, bot.id);

  let bestCorner: Position | null = null;
  let bestScore = currentScore;

  for (const corner of TELEPORT_CORNERS) {
    const s = scoreArea(corner, allCenters, bot.id);
    if (s > bestScore + threshold) {
      bestScore = s;
      bestCorner = corner;
    }
  }

  return bestCorner;
}
