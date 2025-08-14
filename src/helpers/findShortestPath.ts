export function findShortestPath(
  start: [number, number],
  destination: [number, number]
): [number, number][] {
  const directions: [number, number][] = [
    [1, 0], // down
    [-1, 0], // up
    [0, 1], // right
    [0, -1], // left
  ];

  const queue: [number, number][] = [start];
  const visited = new Set<string>([start.toString()]);
  const parentMap = new Map<string, [number, number] | null>();
  parentMap.set(start.toString(), null);

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;

    if (x === destination[0] && y === destination[1]) {
      const path: [number, number][] = [];
      let curr: [number, number] | null = destination;

      while (curr) {
        path.push(curr);
        curr = parentMap.get(curr.toString()) || null;
      }

      path.reverse(); // reverse so it starts from start
      path.shift(); // remove starting point
      return path;
    }

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const key = [nx, ny].toString();

      // Here you can also add bounds checking if needed
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([nx, ny]);
        parentMap.set(key, [x, y]);
      }
    }
  }

  return [];
}
