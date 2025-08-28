type BoardState = {
  blocked: Set<string>;
  myPos: [number, number];
  opponentPos: [number, number];
  mycurrentOP: number;
  opponentCurrentOP: number;
  myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>;
  opponentCenters: Array<{
    spendedOp: number;
    position: { x: number; y: number };
  }>;
  inventory: Array<string>;
  positionsHistory: Array<{ x: number; y: number }>;
  totalCoin: number;
  health: number;
};

type Move = [number, number];
type Path = Move[];

const SHOP_ITEMS = {
  HEALING_POTION: {
    name: "Healing Potion",
    description: "Restores 3 HP.",
    price: 5,
  },
  TELEPORT_STONE: {
    name: "Teleport Stone",
    description: "Allows teleport to corner cells.",
    price: 10,
  },
  LUCKY_CHARM: {
    name: "Lucky Charm",
    description: "50/50 chance helper.",
    price: 15,
  },
};

const TELEPORT_CORNERS: Move[] = [
  [0, 0],
  [0, 8],
  [8, 0],
  [8, 8],
];
const DIRECTIONS: Move[] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]; // right, left, down, up

function bestMove(board: BoardState): Path {
  const {
    myPos,
    opponentPos,
    mycurrentOP,
    opponentCurrentOP,
    myCenters,
    opponentCenters,
    inventory,
    positionsHistory,
    totalCoin,
    health,
  } = board;

  // Priority 1: Health management - if health is critically low
  if (health <= 10 && inventory.includes("HEALING_POTION")) {
    // Use healing potion (this would be handled outside this function)
    // For now, continue with movement logic
  }

  // Priority 2: Check if we should buy items when adjacent to shop
  const shopAdjacent = isAdjacentToShop(myPos);
  if (shopAdjacent) {
    const shouldBuy = decidePurchase(board);
    if (shouldBuy) {
      // In actual implementation, buying would happen before movement
      // Return current position to stay and buy
      return [myPos];
    }
  }

  // Priority 3: Check for teleport opportunities
  if (canUseTeleport(myPos, inventory)) {
    const teleportMove = findBestTeleportMove(board);
    if (teleportMove && teleportMove.length > 0) {
      return teleportMove;
    }
  }

  // Priority 4: Find all possible moves and evaluate them
  const possiblePaths = generateAllPossiblePaths(board);

  if (possiblePaths.length === 0) {
    return [myPos]; // Stay in place if no valid moves
  }

  // Priority 5: Evaluate and rank all paths
  const rankedPaths = evaluateAndRankPaths(possiblePaths, board);

  return rankedPaths[0].path;
}

function isAdjacentToShop(pos: Move): boolean {
  const [x, y] = pos;
  // Shop is 4x4 center (positions 2,2 to 5,5), check if adjacent
  return (
    x >= 1 &&
    x <= 6 &&
    y >= 1 &&
    y <= 6 &&
    !(x >= 2 && x <= 5 && y >= 2 && y <= 5)
  );
}

function decidePurchase(board: BoardState): boolean {
  const { totalCoin, health, inventory } = board;

  // Don't buy if inventory is full
  if (inventory.length >= 4) return false;

  // Priority purchases
  if (health <= 15 && totalCoin >= 5 && !inventory.includes("HEALING_POTION")) {
    return true; // Buy healing potion
  }

  if (totalCoin >= 10 && !inventory.includes("TELEPORT_STONE")) {
    return true; // Buy teleport stone for strategic advantage
  }

  if (totalCoin >= 15 && !inventory.includes("LUCKY_CHARM")) {
    return true; // Buy lucky charm
  }

  return false;
}

function canUseTeleport(pos: Move, inventory: Array<string>): boolean {
  return (
    inventory.includes("TELEPORT_STONE") &&
    TELEPORT_CORNERS.some(
      (corner) => corner[0] === pos[0] && corner[1] === pos[1]
    )
  );
}

function findBestTeleportMove(board: BoardState): Path | null {
  const { myPos } = board;
  const availableCorners = TELEPORT_CORNERS.filter(
    (corner) => !(corner[0] === myPos[0] && corner[1] === myPos[1])
  );

  let bestTeleport: Path | null = null;
  let bestScore = -1;

  for (const corner of availableCorners) {
    if (isValidPosition(corner, board)) {
      const score = evaluatePosition(corner, board);
      if (score > bestScore) {
        bestScore = score;
        bestTeleport = [corner];
      }
    }
  }

  return bestTeleport;
}

function generateAllPossiblePaths(board: BoardState): Path[] {
  const paths: Path[] = [];
  const { myPos } = board;

  for (const direction of DIRECTIONS) {
    for (let distance = 1; distance <= 3; distance++) {
      const path = generatePathInDirection(myPos, direction, distance, board);
      if (path && path.length > 0) {
        paths.push(path);
      }
    }
  }

  return paths;
}

function generatePathInDirection(
  start: Move,
  direction: Move,
  distance: number,
  board: BoardState
): Path | null {
  const path: Path = [];
  let current = start;

  for (let i = 0; i < distance; i++) {
    const next: Move = [current[0] + direction[0], current[1] + direction[1]];

    if (!isValidPosition(next, board)) {
      break; // Can't continue in this direction
    }

    path.push(next);
    current = next;
  }

  return path.length > 0 ? path : null;
}

function isValidPosition(pos: Move, board: BoardState): boolean {
  const [x, y] = pos;
  const { opponentPos, blocked } = board;

  // Check bounds
  if (x < 0 || x > 8 || y < 0 || y > 8) return false;

  // Check if position is opponent's position
  if (x === opponentPos[0] && y === opponentPos[1]) return false;

  // Check if in 3x3 area around opponent
  if (Math.abs(x - opponentPos[0]) <= 1 && Math.abs(y - opponentPos[1]) <= 1)
    return false;

  // Check blocked cells
  if (blocked.has(`${x},${y}`)) return false;

  // Check 4x4 center shop area (blocked for movement)
  if (x >= 2 && x <= 5 && y >= 2 && y <= 5) return false;

  return true;
}

function evaluateAndRankPaths(
  paths: Path[],
  board: BoardState
): Array<{ path: Path; score: number }> {
  const scoredPaths = paths.map((path) => ({
    path,
    score: evaluatePath(path, board),
  }));

  // Sort by score (descending), then by path length (ascending) for ties
  return scoredPaths.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.path.length - b.path.length;
  });
}

function evaluatePath(path: Path, board: BoardState): number {
  let score = 0;
  const finalPos = path[path.length - 1];

  // Base score: points gained from movement (1 per cell)
  score += path.length;

  // Bonus for capturing opponent's cells
  const captureBonus = evaluateCaptureOpportunity(finalPos, board);
  score += captureBonus;

  // Positional advantage
  score += evaluatePosition(finalPos, board);

  // Penalty for revisiting recent positions (avoid repetition)
  const repetitionPenalty = evaluateRepetitionPenalty(
    finalPos,
    board.positionsHistory
  );
  score -= repetitionPenalty;

  // Bonus for strategic positioning near corners (teleport access)
  if (isNearCorner(finalPos)) score += 2;

  return score;
}

function evaluateCaptureOpportunity(pos: Move, board: BoardState): number {
  const { mycurrentOP, opponentCenters } = board;
  const posKey = `${pos[0]},${pos[1]}`;

  // Check if this position has an opponent's cell we can capture
  const opponentCell = opponentCenters.find(
    (center) => center.position.x === pos[0] && center.position.y === pos[1]
  );

  if (opponentCell && mycurrentOP > opponentCell.spendedOp) {
    return 20 + opponentCell.spendedOp; // High bonus for capturing
  }

  return 0;
}

function evaluatePosition(pos: Move, board: BoardState): number {
  let score = 0;
  const [x, y] = pos;

  // Center control bonus (closer to center is better)
  const distanceFromCenter = Math.abs(4 - x) + Math.abs(4 - y);
  score += (9 - distanceFromCenter) * 0.5;

  // Edge and corner penalties (less strategic value)
  if (x === 0 || x === 8 || y === 0 || y === 8) {
    score -= 1;
    if ((x === 0 || x === 8) && (y === 0 || y === 8)) {
      score += 2; // But corners are good for teleport access
    }
  }

  return score;
}

function evaluateRepetitionPenalty(
  pos: Move,
  positionsHistory: Array<{ x: number; y: number }>
): number {
  const recentPositions = positionsHistory.slice(-10); // Check last 10 moves
  const matchCount = recentPositions.filter(
    (p) => p.x === pos[0] && p.y === pos[1]
  ).length;

  return matchCount * 3; // Penalty increases with repetition
}

function isNearCorner(pos: Move): boolean {
  const [x, y] = pos;
  return TELEPORT_CORNERS.some(
    (corner) => Math.abs(x - corner[0]) <= 2 && Math.abs(y - corner[1]) <= 2
  );
}

// Example usage:

export { bestMove, type BoardState };
