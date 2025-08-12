export type Pos = [number, number];

export interface BoardState {
  size: number;
  teleports?: Record<string, Pos>;
  blocked?: Set<string>;
  myPos: Pos;
  opponentPos: Pos;
  myOP: number;
  opponentOP: number;
  myCenters: Set<string>;
  opponentCenters: Set<string>;
  centers: Pos[];
}

export function bestMove(board: BoardState): Pos[] {
  let bestPath: Pos[] = [];
  let bestScore = -Infinity;

  for (const center of board.centers) {
    const path = shortestPath(board.myPos, center, board);
    if (!path.length) continue;

    const opGain = path.length - 1; // passing cells = OP gain
    const myFinalOP = board.myOP + opGain;
    const oppHas = board.opponentCenters.has(posKey(center));

    let score = 0;

    // If opponent owns this center and we can retake it
    if (oppHas) {
      if (myFinalOP > board.opponentOP) {
        score += 50; // retaking is valuable
        score += 10 * (myFinalOP - board.opponentOP); // bonus for OP lead
      } else {
        continue; // skip if we can't beat opponent's OP
      }
    } else {
      // Empty center — good for winning condition
      score += 30;
    }

    // Distance penalty
    score -= path.length;

    // Prioritize if closer to winning
    score += board.myCenters.size * 5;

    if (score > bestScore) {
      bestScore = score;
      bestPath = path;
    }
  }

  return bestPath;
}

function shortestPath(start: Pos, target: Pos, board: BoardState): Pos[] {
  const { size, teleports = {}, blocked = new Set() } = board;
  const queue: { pos: Pos; path: Pos[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>([posKey(start)]);

  while (queue.length) {
    const { pos, path } = queue.shift()!;
    if (pos[0] === target[0] && pos[1] === target[1]) return path;

    for (const next of getMoves(pos, size, teleports, blocked)) {
      const key = posKey(next);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ pos: next, path: [...path, next] });
      }
    }
  }
  return [];
}

function getMoves(
  pos: Pos,
  size: number,
  teleports: Record<string, Pos>,
  blocked: Set<string>
): Pos[] {
  const moves: Pos[] = [];
  const [x, y] = pos;

  // Teleport
  const teleKey = posKey(pos);
  if (teleports[teleKey]) {
    moves.push(teleports[teleKey]);
  }

  // Move 1–3 cells in 4 directions
  const deltas: Pos[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (const [dx, dy] of deltas) {
    for (let step = 1; step <= 3; step++) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < size &&
        ny < size &&
        !blocked.has(posKey([nx, ny]))
      ) {
        moves.push([nx, ny]);
      }
    }
  }

  return moves;
}

function posKey([x, y]: Pos): string {
  return `${x},${y}`;
}
