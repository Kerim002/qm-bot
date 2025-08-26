import { addRandomness } from "../helpers/addRandomness";
import { calculateDistance } from "../helpers/calculateDistance";
import { evaluateCenter } from "../helpers/evaluateCenter";
import { getAdjacentPositions } from "../helpers/getAdjacentPositions";
import { getLevelMultipliers } from "../helpers/getLevelMultipliers";
import { getOpponentBlockedArea } from "../helpers/getOpponentBlockedArea";
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

    for (let steps = 1; steps <= 3; steps++) {
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

        if (path) {
          // --- START OF FIX ---
          // The old scoring was imbalanced. We need to reward making progress toward a goal.
          const startDistance = calculateDistance(myPos, center);
          const endPos = path[path.length - 1];
          const endDistance = calculateDistance(endPos, center);
          const progress = startDistance - endDistance;

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

    if (!result.path || result.path.length === 0) {
      return null;
    }

    return result.path;
  }

  public convertArrayBoard(arrayBoard: {
    blocked: [number, number];
    myPos: [number, number];
    opponentPos: [number, number];
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
