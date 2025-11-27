type Position = number[];

const directions: Position[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function getBestShopMove(
  myPos: Position,
  opponentPos: Position
): Position | null {
  const size = 9;

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

  // Block opponent + 8 neighbors
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

  const myKey = `${myPos[0]},${myPos[1]}`;

  const isInShop = shopTargets.some(
    ([ty, tx]) => ty === myPos[0] && tx === myPos[1]
  );

  // ---------------------------------------------------------
  // ✅ If already inside shop → pick the next closest shop cell
  // ---------------------------------------------------------
  if (isInShop) {
    const candidates = shopTargets
      .filter(([y, x]) => `${y},${x}` !== myKey) // exclude my own cell
      .filter(([y, x]) => !blocked.has(`${y},${x}`)); // not blocked

    if (candidates.length === 0) return null;

    // choose closest in manhattan distance
    candidates.sort(
      (a, b) =>
        Math.abs(a[0] - myPos[0]) +
        Math.abs(a[1] - myPos[1]) -
        (Math.abs(b[0] - myPos[0]) + Math.abs(b[1] - myPos[1]))
    );

    return candidates[0];
  }

  // ---------------------------------------------------------
  // Normal BFS search (limit 3)
  // ---------------------------------------------------------
  const queue: [Position, number][] = [[myPos, 0]];
  const visited = new Set<string>([myKey]);

  let bestCell: Position | null = null;
  let bestDist = Infinity;

  while (queue.length > 0) {
    const [pos, dist] = queue.shift()!;
    const [y, x] = pos;

    // Win: reached a shop cell
    if (shopTargets.some(([ty, tx]) => ty === y && tx === x)) {
      return pos;
    }

    // Track closest to ANY shopTarget
    const d = Math.min(
      ...shopTargets.map(([ty, tx]) => Math.abs(ty - y) + Math.abs(tx - x))
    );

    if (d < bestDist) {
      bestDist = d;
      bestCell = pos;
    }

    if (dist === 3) continue;

    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny < 0 || ny >= size || nx < 0 || nx >= size) continue;

      const key = `${ny},${nx}`;
      if (visited.has(key) || blocked.has(key)) continue;

      visited.add(key);
      queue.push([[ny, nx], dist + 1]);
    }
  }

  // If bestCell is just my own position → no move
  if (!bestCell) return null;
  if (bestCell[0] === myPos[0] && bestCell[1] === myPos[1]) return null;

  return bestCell;
}
