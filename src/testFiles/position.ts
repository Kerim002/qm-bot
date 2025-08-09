export type Player = {
  position: Position;
};

export class Position {
  constructor(public row: number, public col: number) {}

  getAdjacentPositions(): Position[] {
    return [
      new Position(this.row - 1, this.col), // up
      new Position(this.row + 1, this.col), // down
      new Position(this.row, this.col - 1), // left
      new Position(this.row, this.col + 1), // right
    ];
  }

  distanceTo(other: Position): number {
    // Manhattan distance
    return Math.abs(this.row - other.row) + Math.abs(this.col - other.col);
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  static oppositionPositions(from: Position): Set<string> {
    const result = new Set<string>();
    for (let x = from.row - 1; x <= from.row + 1; x++) {
      for (let y = from.col - 1; y <= from.col + 1; y++) {
        result.add(Position.key(x, y));
      }
    }
    return result;
  }

  static key(row: number, col: number): string {
    return `${row},${col}`;
  }

  static fromKey(key: string): Position {
    const [row, col] = key.split(",").map(Number);
    return new Position(row, col);
  }

  key(): string {
    return Position.key(this.row, this.col);
  }
}
