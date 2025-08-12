// interface Position {
//   x: number;
//   y: number;
// }

// interface Board {
//   blocked?: Position;
//   myPos: Position;
//   opponentPos: Position;
//   myOP: number;
//   opponentOP: number;
//   myCenters: Position[];
//   opponentCenters: Position[];
//   centers: Set<string>;
// }

// interface PathNode {
//   pos: Position;
//   path: Position[];
//   steps: number;
// }

// interface CenterEvaluation {
//   priority: number;
//   type: "owned" | "recapture" | "capture";
//   requiredPoints?: number;
// }

// interface BestMoveResult {
//   targetCenter: Position | null;
//   path: Position[] | null;
//   occupationPoints: number;
//   strategy: string;
// }

// class BoardGamePathfinder {
//   private readonly BOARD_SIZE: number = 9;
//   private readonly OCCUPATION_CENTERS: Position[] = [
//     { x: 1, y: 1 },
//     { x: 4, y: 0 },
//     { x: 7, y: 1 },
//     { x: 8, y: 4 },
//     { x: 7, y: 7 },
//     { x: 4, y: 8 },
//     { x: 1, y: 7 },
//     { x: 0, y: 4 },
//   ];

//   private isValidPosition(x: number, y: number): boolean {
//     return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
//   }

//   private isBlocked(
//     pos: Position,
//     blockedPositions: string[],
//     opponentPos: Position
//   ): boolean {
//     const posStr = `${pos.x},${pos.y}`;

//     // Check if position is blocked by custom blocks
//     if (blockedPositions.includes(posStr)) return true;

//     // Check if position is blocked by opponent
//     if (opponentPos.x === pos.x && opponentPos.y === pos.y) return true;

//     return false;
//   }

//   private getAdjacentPositions(pos: Position): Position[] {
//     const adjacent: Position[] = [];
//     const directions: Position[] = [
//       { x: 0, y: 1 },
//       { x: 1, y: 0 },
//       { x: 0, y: -1 },
//       { x: -1, y: 0 },
//     ];

//     for (const direction of directions) {
//       const newX = pos.x + direction.x;
//       const newY = pos.y + direction.y;
//       if (this.isValidPosition(newX, newY)) {
//         adjacent.push({ x: newX, y: newY });
//       }
//     }

//     return adjacent;
//   }

//   private calculateDistance(pos1: Position, pos2: Position): number {
//     return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
//   }

//   private positionsEqual(pos1: Position, pos2: Position): boolean {
//     return pos1.x === pos2.x && pos1.y === pos2.y;
//   }

//   private findShortestPath(
//     start: Position,
//     target: Position,
//     blockedPositions: string[],
//     opponentPos: Position,
//     maxSteps: number = 3
//   ): Position[] | null {
//     if (this.positionsEqual(start, target)) {
//       return [];
//     }

//     const queue: PathNode[] = [
//       {
//         pos: start,
//         path: [],
//         steps: 0,
//       },
//     ];

//     const visited = new Set<string>();
//     visited.add(`${start.x},${start.y}`);

//     while (queue.length > 0) {
//       const current = queue.shift()!;

//       if (current.steps >= maxSteps) continue;

//       const adjacent = this.getAdjacentPositions(current.pos);

//       for (const nextPos of adjacent) {
//         const posKey = `${nextPos.x},${nextPos.y}`;

//         if (visited.has(posKey)) continue;
//         if (this.isBlocked(nextPos, blockedPositions, opponentPos)) continue;

//         const newPath = [...current.path, nextPos];

//         if (this.positionsEqual(nextPos, target)) {
//           return newPath;
//         }

//         visited.add(posKey);
//         queue.push({
//           pos: nextPos,
//           path: newPath,
//           steps: current.steps + 1,
//         });
//       }
//     }

//     return null;
//   }

//   private findBestMoveToward(
//     start: Position,
//     target: Position,
//     blockedPositions: string[],
//     opponentPos: Position
//   ): Position[] | null {
//     let bestPath: Position[] | null = null;
//     let bestScore = -Infinity;

//     // Try all possible 1, 2, and 3 step moves
//     for (let steps = 1; steps <= 3; steps++) {
//       const paths = this.getAllPathsOfLength(
//         start,
//         blockedPositions,
//         opponentPos,
//         steps
//       );

//       for (const path of paths) {
//         const endPos = path[path.length - 1];
//         const distanceToTarget = this.calculateDistance(endPos, target);
//         const startDistance = this.calculateDistance(start, target);

//         // Score: prefer paths that get closer to target and give more points
//         const score =
//           (startDistance - distanceToTarget) * 100 + path.length * 10;

//         if (score > bestScore) {
//           bestScore = score;
//           bestPath = path;
//         }
//       }
//     }

//     return bestPath;
//   }

//   private getAllPathsOfLength(
//     start: Position,
//     blockedPositions: string[],
//     opponentPos: Position,
//     targetLength: number
//   ): Position[][] {
//     const results: Position[][] = [];

//     const queue: PathNode[] = [
//       {
//         pos: start,
//         path: [],
//         steps: 0,
//       },
//     ];

//     while (queue.length > 0) {
//       const current = queue.shift()!;

//       if (current.steps === targetLength) {
//         results.push(current.path);
//         continue;
//       }

//       if (current.steps >= targetLength) continue;

//       const adjacent = this.getAdjacentPositions(current.pos);

//       for (const nextPos of adjacent) {
//         if (this.isBlocked(nextPos, blockedPositions, opponentPos)) continue;

//         queue.push({
//           pos: nextPos,
//           path: [...current.path, nextPos],
//           steps: current.steps + 1,
//         });
//       }
//     }

//     return results;
//   }

//   private evaluateCenter(
//     centerPos: Position,
//     myCurrentOP: number,
//     opponentCenters: Position[],
//     myCenters: Position[]
//   ): CenterEvaluation {
//     // Check if I already own this center
//     if (myCenters.some((c) => this.positionsEqual(c, centerPos))) {
//       return { priority: 0, type: "owned" };
//     }

//     // Check if opponent owns this center
//     const opponentOwned = opponentCenters.find((c) =>
//       this.positionsEqual(c, centerPos)
//     );
//     if (opponentOwned) {
//       return {
//         priority: 150,
//         type: "recapture",
//         requiredPoints: 2, // Assume opponent spent at least 1 point, so we need 2+
//       };
//     }

//     // Unoccupied center
//     return {
//       priority: 100,
//       type: "capture",
//       requiredPoints: 1,
//     };
//   }

//   private findBestMove(board: Board): BestMoveResult {
//     const { myPos, opponentPos, myOP, myCenters, opponentCenters, blocked } =
//       board;
//     const blockedPositions: string[] = [];

//     // Only add custom blocked positions
//     if (blocked) {
//       blockedPositions.push(`${blocked.x},${blocked.y}`);
//     }

//     let bestMove: Position | null = null;
//     let bestScore: number = -Infinity;
//     let bestPath: Position[] | null = null;
//     let bestStrategy: string = "none";

//     // Evaluate all occupation centers
//     for (const center of this.OCCUPATION_CENTERS) {
//       const evaluation = this.evaluateCenter(
//         center,
//         myOP,
//         opponentCenters,
//         myCenters
//       );

//       if (evaluation.type === "owned") continue;

//       // Try to find direct path to center
//       let path = this.findShortestPath(
//         myPos,
//         center,
//         blockedPositions,
//         opponentPos,
//         3
//       );
//       let strategy = evaluation.type;

//       if (path) {
//         // Can reach center directly
//         const pathPoints = path.length;
//         const totalPointsAfterMove = myOP + pathPoints;
//         const canCapture =
//           totalPointsAfterMove >= (evaluation.requiredPoints || 1);

//         let score = evaluation.priority;
//         if (canCapture) {
//           score += strategy === "recapture" ? 2000 : 1000;
//         } else {
//           score += 100; // Still good to get closer
//         }

//         if (score > bestScore) {
//           bestScore = score;
//           bestMove = center;
//           bestPath = path;
//           bestStrategy = canCapture ? strategy : "approach";
//         }
//       } else {
//         // Can't reach center in 3 steps, find best move toward it
//         path = this.findBestMoveToward(
//           myPos,
//           center,
//           blockedPositions,
//           opponentPos
//         );

//         if (path) {
//           const score = evaluation.priority + path.length * 5;

//           if (score > bestScore) {
//             bestScore = score;
//             bestMove = center;
//             bestPath = path;
//             bestStrategy = "approach";
//           }
//         }
//       }
//     }

//     return {
//       targetCenter: bestMove,
//       path: bestPath,
//       occupationPoints: bestPath ? bestPath.length : 0,
//       strategy: bestStrategy,
//     };
//   }

//   public getBestPath(board: Board): Position[] | null {
//     console.log(`Starting position: [${board.myPos.x}, ${board.myPos.y}]`);
//     console.log(`My occupation points: ${board.myOP}`);

//     const result = this.findBestMove(board);

//     if (!result.path || result.path.length === 0) {
//       console.log("No valid move found!");
//       return null;
//     }

//     console.log(`Strategy: ${result.strategy}`);
//     console.log(
//       `Target: [${result.targetCenter!.x}, ${result.targetCenter!.y}]`
//     );
//     console.log(`Path: ${JSON.stringify(result.path.map((p) => [p.x, p.y]))}`);
//     console.log(`Occupation Points Gained: ${result.occupationPoints}`);

//     return result.path;
//   }

//   // Helper methods for compatibility with your array format
//   public convertArrayBoard(arrayBoard: {
//     blocked?: [number, number];
//     myPos: [number, number];
//     opponentPos: [number, number];
//     myOP: number;
//     opponentOP: number;
//     myCenters: [number, number][];
//     opponentCenters: [number, number][];
//     centers: Set<string>;
//   }): Board {
//     return {
//       blocked: arrayBoard.blocked
//         ? { x: arrayBoard.blocked[0], y: arrayBoard.blocked[1] }
//         : undefined,
//       myPos: { x: arrayBoard.myPos[0], y: arrayBoard.myPos[1] },
//       opponentPos: {
//         x: arrayBoard.opponentPos[0],
//         y: arrayBoard.opponentPos[1],
//       },
//       myOP: arrayBoard.myOP,
//       opponentOP: arrayBoard.opponentOP,
//       myCenters: arrayBoard.myCenters.map(([x, y]) => ({ x, y })),
//       opponentCenters: arrayBoard.opponentCenters.map(([x, y]) => ({ x, y })),
//       centers: arrayBoard.centers,
//     };
//   }

//   public convertToArrayPath(path: Position[]): [number, number][] {
//     return path.map((pos) => [pos.x, pos.y] as [number, number]);
//   }
// }

// // // Usage example
// // const pathfinder = new BoardGamePathfinder();

// // const arrayBoard = {
// //   blocked: [4, 4] as [number, number],
// //   myPos: [5, 3] as [number, number],
// //   opponentPos: [3, 5] as [number, number],
// //   myOP: 0,
// //   opponentOP: 0,
// //   myCenters: [] as [number, number][],
// //   opponentCenters: [] as [number, number][],
// //   centers: new Set(["1,1", "4,0", "7,1", "8,4", "7,7", "4,8", "1,7", "0,4"]),
// // };

// // const board = pathfinder.convertArrayBoard(arrayBoard);
// // const bestPath = pathfinder.getBestPath(board);

// // if (bestPath) {
// //   const arrayPath = pathfinder.convertToArrayPath(bestPath);
// //   console.log("Best path (array format):", arrayPath);
// // }

// export default BoardGamePathfinder;
// export { Position, Board, BestMoveResult };

interface Position {
  x: number;
  y: number;
}

interface Board {
  blocked?: Position;
  myPos: Position;
  opponentPos: Position;
  myOP: number;
  opponentOP: number;
  myCenters: Position[];
  opponentCenters: Position[];
  centers: Set<string>;
  level?: "high" | "middle" | "low";
}

interface PathNode {
  pos: Position;
  path: Position[];
  steps: number;
}

interface CenterEvaluation {
  priority: number;
  type: "owned" | "recapture" | "capture";
  requiredPoints?: number;
}

interface BestMoveResult {
  targetCenter: Position | null;
  path: Position[] | null;
  occupationPoints: number;
  strategy: string;
}

class BoardGamePathfinder {
  private readonly BOARD_SIZE: number = 9;
  private readonly OCCUPATION_CENTERS: Position[] = [
    { x: 1, y: 1 },
    { x: 4, y: 0 },
    { x: 7, y: 1 },
    { x: 8, y: 4 },
    { x: 7, y: 7 },
    { x: 4, y: 8 },
    { x: 1, y: 7 },
    { x: 0, y: 4 },
  ];

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
  }

  private getOpponentBlockedArea(opponentPos: Position): Position[] {
    const blockedArea: Position[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = opponentPos.x + dx;
        const y = opponentPos.y + dy;

        if (this.isValidPosition(x, y)) {
          blockedArea.push({ x, y });
        }
      }
    }

    return blockedArea;
  }

  private isBlocked(
    pos: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[]
  ): boolean {
    const posStr = `${pos.x},${pos.y}`;

    if (blockedPositions.includes(posStr)) return true;

    if (
      opponentBlockedArea.some(
        (blocked) => blocked.x === pos.x && blocked.y === pos.y
      )
    )
      return true;

    return false;
  }

  private getAdjacentPositions(pos: Position): Position[] {
    const adjacent: Position[] = [];
    const directions: Position[] = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: -1, y: 0 },
    ];

    for (const direction of directions) {
      const newX = pos.x + direction.x;
      const newY = pos.y + direction.y;
      if (this.isValidPosition(newX, newY)) {
        adjacent.push({ x: newX, y: newY });
      }
    }

    return adjacent;
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  private findShortestPath(
    start: Position,
    target: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    maxSteps: number = 3
  ): Position[] | null {
    if (this.positionsEqual(start, target)) {
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

      const adjacent = this.getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        const posKey = `${nextPos.x},${nextPos.y}`;

        if (visited.has(posKey)) continue;
        if (this.isBlocked(nextPos, blockedPositions, opponentBlockedArea))
          continue;

        const newPath = [...current.path, nextPos];

        if (this.positionsEqual(nextPos, target)) {
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
  }

  private findBestMoveToward(
    start: Position,
    target: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[]
  ): Position[] | null {
    let bestPath: Position[] | null = null;
    let bestScore = -Infinity;

    for (let steps = 1; steps <= 3; steps++) {
      const paths = this.getAllPathsOfLength(
        start,
        blockedPositions,
        opponentBlockedArea,
        steps
      );

      for (const path of paths) {
        const endPos = path[path.length - 1];
        const distanceToTarget = this.calculateDistance(endPos, target);
        const startDistance = this.calculateDistance(start, target);

        const score =
          (startDistance - distanceToTarget) * 100 + path.length * 10;

        if (score > bestScore) {
          bestScore = score;
          bestPath = path;
        }
      }
    }

    return bestPath;
  }

  private getAllPathsOfLength(
    start: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    targetLength: number
  ): Position[][] {
    const results: Position[][] = [];

    const queue: PathNode[] = [
      {
        pos: start,
        path: [],
        steps: 0,
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.steps === targetLength) {
        results.push(current.path);
        continue;
      }

      if (current.steps >= targetLength) continue;

      const adjacent = this.getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        if (this.isBlocked(nextPos, blockedPositions, opponentBlockedArea))
          continue;

        queue.push({
          pos: nextPos,
          path: [...current.path, nextPos],
          steps: current.steps + 1,
        });
      }
    }

    return results;
  }

  private evaluateCenter(
    centerPos: Position,
    myCurrentOP: number,
    opponentCenters: Position[],
    myCenters: Position[],
    level: "high" | "middle" | "low" = "high"
  ): CenterEvaluation {
    if (myCenters.some((c) => this.positionsEqual(c, centerPos))) {
      return { priority: 0, type: "owned" };
    }

    const opponentOwned = opponentCenters.find((c) =>
      this.positionsEqual(c, centerPos)
    );
    if (opponentOwned) {
      let priority = 150;
      let requiredPoints = 2;

      switch (level) {
        case "high":
          priority = 200;
          requiredPoints = 2;
          break;
        case "middle":
          priority = 150;
          requiredPoints = 2;
          break;
        case "low":
          priority = 100;
          requiredPoints = 3;
          break;
      }

      return {
        priority,
        type: "recapture",
        requiredPoints,
      };
    }

    let priority = 100;

    switch (level) {
      case "high":
        priority = 120;
        break;
      case "middle":
        priority = 100;
        break;
      case "low":
        priority = 80;
        break;
    }

    return {
      priority,
      type: "capture",
      requiredPoints: 1,
    };
  }

  private getLevelMultipliers(level: "high" | "middle" | "low" = "high"): {
    aggression: number;
    riskTaking: number;
    efficiency: number;
  } {
    switch (level) {
      case "high":
        return {
          aggression: 1.5,
          riskTaking: 1.2,
          efficiency: 1.3,
        };
      case "middle":
        return {
          aggression: 1.0,
          riskTaking: 1.0,
          efficiency: 1.0,
        };
      case "low":
        return {
          aggression: 0.7,
          riskTaking: 0.8,
          efficiency: 0.9,
        };
    }
  }

  private addRandomness(
    score: number,
    level: "high" | "middle" | "low" = "high"
  ): number {
    let randomFactor = 0;

    switch (level) {
      case "high":
        randomFactor = 0.05;
        break;
      case "middle":
        randomFactor = 0.15;
        break;
      case "low":
        randomFactor = 0.25;
        break;
    }

    const randomMultiplier = 1 + (Math.random() - 0.5) * randomFactor;
    return score * randomMultiplier;
  }

  private findBestMove(board: Board): BestMoveResult {
    const {
      myPos,
      opponentPos,
      myOP,
      myCenters,
      opponentCenters,
      blocked,
      level = "high",
    } = board;
    const blockedPositions: string[] = [];

    if (blocked) {
      blockedPositions.push(`${blocked.x},${blocked.y}`);
    }

    const opponentBlockedArea = this.getOpponentBlockedArea(opponentPos);
    const levelMultipliers = this.getLevelMultipliers(level);

    let bestMove: Position | null = null;
    let bestScore: number = -Infinity;
    let bestPath: Position[] | null = null;
    let bestStrategy: string = "none";

    for (const center of this.OCCUPATION_CENTERS) {
      const evaluation = this.evaluateCenter(
        center,
        myOP,
        opponentCenters,
        myCenters,
        level
      );

      if (evaluation.type === "owned") continue;

      let path = this.findShortestPath(
        myPos,
        center,
        blockedPositions,
        opponentBlockedArea,
        3
      );
      let strategy = evaluation.type;

      if (path) {
        const pathPoints = path.length;
        const totalPointsAfterMove = myOP + pathPoints;
        const canCapture =
          totalPointsAfterMove >= (evaluation.requiredPoints || 1);

        let score = evaluation.priority * levelMultipliers.aggression;

        if (canCapture) {
          const captureBonus = strategy === "recapture" ? 2000 : 1000;
          score += captureBonus * levelMultipliers.aggression;
        } else {
          score += 100 * levelMultipliers.efficiency;
        }

        score = this.addRandomness(score, level);

        if (score > bestScore) {
          bestScore = score;
          bestMove = center;
          bestPath = path;
          bestStrategy = canCapture ? strategy : "approach";
        }
      } else {
        path = this.findBestMoveToward(
          myPos,
          center,
          blockedPositions,
          opponentBlockedArea
        );

        if (path) {
          let score =
            evaluation.priority * levelMultipliers.efficiency + path.length * 5;
          score = this.addRandomness(score, level);

          if (score > bestScore) {
            bestScore = score;
            bestMove = center;
            bestPath = path;
            bestStrategy = "approach";
          }
        }
      }
    }

    return {
      targetCenter: bestMove,
      path: bestPath,
      occupationPoints: bestPath ? bestPath.length : 0,
      strategy: bestStrategy,
    };
  }

  public getBestPath(board: Board): Position[] | null {
    const result = this.findBestMove(board);

    if (!result.path || result.path.length === 0) {
      return null;
    }

    return result.path;
  }

  public convertArrayBoard(arrayBoard: {
    blocked?: [number, number];
    myPos: [number, number];
    opponentPos: [number, number];
    myOP: number;
    opponentOP: number;
    myCenters: [number, number][];
    opponentCenters: [number, number][];
    centers: Set<string>;
    level?: "high" | "middle" | "low";
  }): Board {
    return {
      blocked: arrayBoard.blocked
        ? { x: arrayBoard.blocked[0], y: arrayBoard.blocked[1] }
        : undefined,
      myPos: { x: arrayBoard.myPos[0], y: arrayBoard.myPos[1] },
      opponentPos: {
        x: arrayBoard.opponentPos[0],
        y: arrayBoard.opponentPos[1],
      },
      myOP: arrayBoard.myOP,
      opponentOP: arrayBoard.opponentOP,
      myCenters: arrayBoard.myCenters.map(([x, y]) => ({ x, y })),
      opponentCenters: arrayBoard.opponentCenters.map(([x, y]) => ({ x, y })),
      centers: arrayBoard.centers,
      level: arrayBoard.level || "high",
    };
  }

  public convertToArrayPath(path: Position[]): [number, number][] {
    return path.map((pos) => [pos.x, pos.y] as [number, number]);
  }
}

export default BoardGamePathfinder;
export { Position, Board, BestMoveResult };
