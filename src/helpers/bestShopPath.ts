type Position = [number, number];

const directions: Position[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1], // only 4-way
];

export function getBestShopMove(
  myPos: Position,
  opponentPos: Position
): Position | null {
  const size = 9;
  const shop: Position = [4, 4];

  // ✅ All 8 shop target cells
  const shopTargets: Position[] = [
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 3],
    [4, 5],
    [5, 3],
    [5, 4],
    [5, 5],
  ];

  // ❌ If already inside shop area, return null
  if (shopTargets.some(([ty, tx]) => ty === myPos[0] && tx === myPos[1])) {
    return null;
  }

  // Block opponent area (itself + all 8 neighbors)
  const blocked = new Set<string>();
  const oppDirs: Position[] = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (let [dy, dx] of oppDirs) {
    const oy = opponentPos[0] + dy;
    const ox = opponentPos[1] + dx;
    if (oy >= 0 && oy < size && ox >= 0 && ox < size) {
      blocked.add(`${oy},${ox}`);
    }
  }

  // BFS search with limit = 3
  const queue: [Position, number][] = [[myPos, 0]];
  const visited = new Set<string>([`${myPos[0]},${myPos[1]}`]);

  let bestCell: Position | null = null;
  let bestDist = Infinity;

  while (queue.length > 0) {
    const [pos, dist] = queue.shift()!;
    const [y, x] = pos;

    // ✅ If reached a shop target, return immediately
    if (shopTargets.some(([ty, tx]) => ty === y && tx === x)) {
      return pos;
    }

    // Track best progress (closest to shop targets)
    const minShopDist = Math.min(
      ...shopTargets.map(([ty, tx]) => Math.abs(ty - y) + Math.abs(tx - x))
    );
    if (minShopDist < bestDist) {
      bestDist = minShopDist;
      bestCell = pos;
    }

    if (dist === 3) continue; // can't move more than 3

    for (let [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny < 0 || ny >= size || nx < 0 || nx >= size) continue;

      const key = `${ny},${nx}`;
      if (visited.has(key) || blocked.has(key)) continue;

      visited.add(key);
      queue.push([[ny, nx], dist + 1]);
    }
  }

  return bestCell
    ? bestCell[0] !== myPos[0] || bestCell[1] !== myPos[1]
      ? bestCell
      : null
    : bestCell;
}
