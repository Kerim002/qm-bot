import { addRandomness } from "../helpers/addRandomness";
import { calculateDistance } from "../helpers/calculateDistance";
import { evaluateCenter } from "../helpers/evaluateCenter";
import { getAdjacentPositions } from "../helpers/getAdjacentPositions";
import { getLevelMultipliers } from "../helpers/getLevelMultipliers";
import { getOpponentBlockedArea } from "../helpers/getOpponentBlockedArea";
import { horsePlacesScore } from "../helpers/horsePlacesScore";
import { isBlocked } from "../helpers/isBlocked";
import { positionsEqual } from "../helpers/positionsEqual";
import { OCCUPATION_CENTERS } from "../shared/contstants/constants";
import { OccupiedPosition } from "../types/game";
import { BestMoveResult, Board, PathNode, Position } from "../types/global";

export class BoardGamePathfinder {
  private readonly OCCUPATION_CENTERS = OCCUPATION_CENTERS;
  private findShortestPath(
    start: Position,
    target: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    maxSteps: number = 3
  ): Position[] | null {
    if (positionsEqual(start, target)) {
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

      const adjacent = getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        const posKey = `${nextPos.x},${nextPos.y}`;

        if (visited.has(posKey)) continue;
        if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;

        const newPath = [...current.path, nextPos];

        if (positionsEqual(nextPos, target)) {
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
    const all3StepPaths: { path: Position[]; score: number }[] = [];

    // Generate all possible 3-step paths
    const paths3Step = this.getAllPathsOfLength(
      start,
      blockedPositions,
      opponentBlockedArea,
      3
    );

    // console.log(
    //   `Found ${paths3Step.length} 3-step paths from [${start.x},${start.y}]`
    // );

    // Evaluate each 3-step path with more varied scoring
    for (const path of paths3Step) {
      const endPos = path[path.length - 1];
      const distanceToTarget = calculateDistance(endPos, target);
      const startDistance = calculateDistance(start, target);
      const progress = startDistance - distanceToTarget;

      // Base score for 3-step path
      let score = 1000;

      // Vary the score based on different factors to avoid ties
      score += progress * 25; // Progress toward target
      score += (10 - distanceToTarget) * 5; // Closer to target is slightly better

      // Add some variation based on position to break ties
      score += (endPos.x + endPos.y) % 7; // Small position-based variation
      score += horsePlacesScore(endPos);
      // Bonus for different strategic positions
      // if (endPos.x === 6 && endPos.y === 3) score += 15; // Specific bonus for [6,3]
      // if (endPos.x === 7 && endPos.y === 4) score += 10; // Smaller bonus for [7,4]

      // Small randomization to break remaining ties
      score += Math.random() * 20;

      // console.log(
      //   `Path to [${endPos.x},${endPos.y}]: score=${score.toFixed(
      //     1
      //   )}, progress=${progress}`
      // );
      // console.log(`  Full path: ${JSON.stringify(path)}`);

      all3StepPaths.push({ path, score });

      if (score > bestScore) {
        bestScore = score;
        bestPath = path;
      }
    }

    // Sort paths by score to see alternatives
    all3StepPaths.sort((a, b) => b.score - a.score);

    // Add variety: 50% chance to pick from top 3 paths instead of just the best
    if (all3StepPaths.length > 1 && Math.random() < 0.5) {
      const topPaths = all3StepPaths.slice(
        0,
        Math.min(3, all3StepPaths.length)
      );
      const selectedPath =
        topPaths[Math.floor(Math.random() * topPaths.length)];
      bestPath = selectedPath.path;
      // console.log(
      //   `Selected path for variety: ${JSON.stringify(
      //     bestPath
      //   )} (score: ${selectedPath.score.toFixed(1)})`
      // );
    }

    // If no good 3-step paths, fallback to shorter paths
    if (!bestPath || all3StepPaths.length === 0) {
      // console.log("Falling back to shorter paths...");
      for (let steps = 2; steps >= 1; steps--) {
        const paths = this.getAllPathsOfLength(
          start,
          blockedPositions,
          opponentBlockedArea,
          steps
        );

        for (const path of paths) {
          const endPos = path[path.length - 1];
          const distanceToTarget = calculateDistance(endPos, target);
          const startDistance = calculateDistance(start, target);
          const progress = startDistance - distanceToTarget;

          let score = path.length === 2 ? 500 : 100;
          score += progress * 50;

          if (score > bestScore) {
            bestScore = score;
            bestPath = path;
          }
        }
      }
    }

    // console.log(
    //   `Final selected path: ${JSON.stringify(bestPath)}, Target: [${target.x},${
    //     target.y
    //   }]\n`
    // );
    return bestPath;
  }

  // private findBestMoveToward(
  //   start: Position,
  //   target: Position,
  //   blockedPositions: string[],
  //   opponentBlockedArea: Position[]
  // ): Position[] | null {
  //   let bestPath: Position[] | null = null;
  //   let bestScore = -Infinity;

  //   for (let steps = 1; steps <= 3; steps++) {
  //     const paths = this.getAllPathsOfLength(
  //       start,
  //       blockedPositions,
  //       opponentBlockedArea,
  //       steps
  //     );

  //     for (const path of paths) {
  //       const endPos = path[path.length - 1];
  //       const distanceToTarget = calculateDistance(endPos, target);
  //       const startDistance = calculateDistance(start, target);
  //       console.log("distance to target", distanceToTarget);
  //       console.log("start dictance", startDistance);
  //       console.log("path", path);
  //       console.log("target", target, "\n");
  //       const score =
  //         (startDistance - distanceToTarget) * 100 + path.length * 10;

  //       if (score > bestScore) {
  //         bestScore = score;
  //         bestPath = path;
  //       }
  //     }
  //   }

  //   return bestPath;
  // }

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

      const adjacent = getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;

        queue.push({
          pos: nextPos,
          path: [...current.path, nextPos],
          steps: current.steps + 1,
        });
      }
    }

    return results;
  }

  /**
   * --- THIS IS THE CORRECTED FUNCTION ---
   */
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

    const opponentBlockedArea = getOpponentBlockedArea(opponentPos);
    const levelMultipliers = getLevelMultipliers(level);

    let bestMove: Position | null = null;
    let bestScore: number = -Infinity;
    let bestPath: Position[] | null = null;
    let bestStrategy: string = "none";

    for (const center of this.OCCUPATION_CENTERS) {
      const evaluation = evaluateCenter(
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

      console.log("find shortes path", path, center);

      let strategy = evaluation.type;
      const pathPoints = path ? path.length : 0;
      const totalPointsAfterMove = myOP + pathPoints;
      const canCapture =
        totalPointsAfterMove >= (evaluation.requiredPoints || 1);
      if (path && path.length && canCapture) {
        let score = evaluation.priority * levelMultipliers.aggression;

        if (canCapture) {
          const captureBonus = strategy === "recapture" ? 2000 : 1000;
          score += captureBonus * levelMultipliers.aggression;
        } else {
          score += 100 * levelMultipliers.efficiency;
        }

        score = addRandomness(score, level);

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

        console.log("find toward path", path);
        // console.log("pathes", path, center, "\n ");

        if (path) {
          // --- START OF FIX ---
          // The old scoring was imbalanced. We need to reward making progress toward a goal.
          const startDistance = calculateDistance(myPos, center);
          const endPos = path[path.length - 1];
          const endDistance = calculateDistance(endPos, center);
          const progress = startDistance - endDistance;
          // console.log("startDisctance", startDistance);
          // console.log("endPosition", endPos);
          // console.log("endDistance", endDistance);
          // console.log("progress", progress, "\n");

          // New score calculation:
          // We heavily weight the actual progress made and the length of the path used,
          // while still considering the strategic priority of the target center.
          // This prevents a high-priority target from forcing a suboptimal, short move.
          let score =
            progress * 100 + // Strongly reward getting closer
            path.length * 20 + // Reward using more of the available move
            evaluation.priority; // Still factor in the center's importance

          // --- END OF FIX ---

          score = addRandomness(score, level);

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
    // console.log("result.path", result.path);
    // console.log("result.targetCenter", result.targetCenter);
    // console.log("result.strategy", result.targetCenter);

    if (!result.path || result.path.length === 0) {
      return null;
    }

    return result.path;
  }

  public convertArrayBoard(arrayBoard: {
    blocked: number[];
    myPos: number[];
    opponentPos: number[];
    myOP: number;
    opponentOP: number;
    myCenters: OccupiedPosition[];
    opponentCenters: OccupiedPosition[];
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
      myCenters: arrayBoard.myCenters,
      opponentCenters: arrayBoard.opponentCenters,
      level: arrayBoard.level || "high",
    };
  }

  public convertToArrayPath(path: Position[]): [number, number][] {
    return path.map((pos) => [pos.x, pos.y] as [number, number]);
  }
}
