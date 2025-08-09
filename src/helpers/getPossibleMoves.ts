type Position = { x: number; y: number };

export function getPossibleMoves(current: Position): Position[] {
  const boardSize = 9;
  const center = { x: 4, y: 4 };
  const maxSteps = 3;

  const directions = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
  ];

  const visited = new Set<string>();
  const result: Position[] = [];

  const queue: { x: number; y: number; steps: number }[] = [
    { ...current, steps: 0 },
  ];
  visited.add(`${current.x},${current.y}`);

  while (queue.length > 0) {
    const { x, y, steps } = queue.shift()!;

    if (steps > 0 && !(x === center.x && y === center.y)) {
      result.push({ x, y });
    }

    if (steps === maxSteps) continue;

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const key = `${newX},${newY}`;

      const isInside =
        newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize;
      const isNotVisited = !visited.has(key);

      if (isInside && isNotVisited) {
        visited.add(key);
        queue.push({ x: newX, y: newY, steps: steps + 1 });
      }
    }
  }

  return result;
}

export function getPossibleMovePaths(current: Position): Position[][] {
  const boardSize = 9;
  const center = { x: 4, y: 4 };
  const maxSteps = 3;

  const directions = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
  ];

  const result: Position[][] = [];

  type Node = {
    x: number;
    y: number;
    steps: number;
    path: Position[];
  };

  const queue: Node[] = [
    {
      x: current.x,
      y: current.y,
      steps: 0,
      path: [],
    },
  ];

  const visited = new Set<string>();
  visited.add(`${current.x},${current.y}`);

  while (queue.length > 0) {
    const { x, y, steps, path } = queue.shift()!;

    if (steps > 0 && !(x === center.x && y === center.y)) {
      result.push(path);
    }

    if (steps === maxSteps) continue;

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const key = `${newX},${newY}`;

      const isInsideBoard =
        newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize;

      if (isInsideBoard && !visited.has(key)) {
        visited.add(key);

        queue.push({
          x: newX,
          y: newY,
          steps: steps + 1,
          path: [...path, { x: newX, y: newY }],
        });
      }
    }
  }

  return result;
}
