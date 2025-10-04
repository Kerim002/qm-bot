import { BoardGamePathfinder } from "../bot/BoardFindBestPlace";
import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { findShortestPath } from "../helpers/findShortestPath";
import { getOpponentBlockedArea } from "../helpers/getOpponentBlockedArea";
import { GameState } from "../services/GameState";
import { getBestShopMove } from "./test-helpers";
import { ShopService } from "./test-shop-service";

interface StrategicEvaluation {
  position: [number, number];
  score: number;
  type: "offensive" | "defensive" | "opportunistic" | "blocking";
  urgency: number;
}

export class MovementService {
  private pathfinder = new BoardGamePathfinder();
  private gamePhase: "early" | "mid" | "late" = "early";

  constructor(private gameState: GameState, private shopService: ShopService) {}

  getNextMove(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    // Update game phase based on occupied positions and remaining time
    this.updateGamePhase();

    // Priority 1: Emergency healing
    if (this.shouldEmergencyHeal()) {
      return this.getEmergencyHealPath();
    }

    // Priority 2: Strategic shop visits
    if (this.shopService.shouldGoToShop()) {
      return this.getOptimalShopPath();
    }

    // Priority 3: Main strategic movement
    return this.getStrategicMove();
  }

  private updateGamePhase(): void {
    const totalOccupied =
      this.gameState.botOccupiedPositions.length +
      this.gameState.opponentOccupiedPositions.length;
    const maxCenters = OCCUPATION_CENTERS.length;

    if (totalOccupied < maxCenters * 0.3) {
      this.gamePhase = "early";
    } else if (totalOccupied < maxCenters * 0.7) {
      this.gamePhase = "mid";
    } else {
      this.gamePhase = "late";
    }
  }

  private shouldEmergencyHeal(): boolean {
    const { bot } = this.gameState;
    if (!bot) return false;

    const criticalHP = this.gameState.maxHp * 0.25;
    const hasHealingPot = this.gameState.hasItem("HEALING_POTION");
    const canAffordHeal =
      bot.coins >= (this.gameState.shopItems["HEALING_POTION"]?.price || 0);

    return bot.hp <= criticalHP && (hasHealingPot || canAffordHeal);
  }

  private getEmergencyHealPath(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    // If we have healing potion, find safe spot to use it
    if (this.gameState.hasItem("HEALING_POTION")) {
      const safeSpot = this.findSafestPosition(bot.position, opponent.position);
      if (safeSpot) {
        return this.getPathWithAvoidance(
          bot.position,
          safeSpot,
          opponent.position
        );
      }
    }

    // Otherwise, go to shop
    return this.getOptimalShopPath();
  }

  private findSafestPosition(
    myPos: number[],
    oppPos: number[]
  ): [number, number] | null {
    const candidates: Array<{ pos: [number, number]; score: number }> = [];

    // Check positions within 3 moves
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const newPos: [number, number] = [myPos[0] + dy, myPos[1] + dx];
        if (this.isValidPosition(newPos)) {
          const distanceFromOpponent =
            Math.abs(newPos[0] - oppPos[0]) + Math.abs(newPos[1] - oppPos[1]);
          const distanceFromMe = Math.abs(dy) + Math.abs(dx);

          if (distanceFromMe <= 3 && distanceFromMe > 0) {
            candidates.push({
              pos: newPos,
              score: distanceFromOpponent - distanceFromMe * 0.1, // Prefer farther from opponent
            });
          }
        }
      }
    }

    return candidates.length > 0
      ? candidates.sort((a, b) => b.score - a.score)[0].pos
      : null;
  }

  private getOptimalShopPath(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    const bestShopTarget = getBestShopMove(bot.position, opponent.position);
    if (!bestShopTarget) return null;

    return this.getPathWithAvoidance(
      bot.position,
      bestShopTarget,
      opponent.position
    );
  }

  private getStrategicMove(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    // Evaluate all possible strategic positions
    const evaluations = this.evaluateStrategicPositions();
    if (evaluations.length === 0) return null;

    // Sort by strategic value and urgency
    evaluations.sort((a, b) => {
      const scoreA = a.score * (1 + a.urgency);
      const scoreB = b.score * (1 + b.urgency);
      return scoreB - scoreA;
    });

    // Try to path to the best positions
    for (const evaluation of evaluations.slice(0, 5)) {
      const path = this.getPathWithAvoidance(
        bot.position,
        evaluation.position,
        opponent.position
      );
      if (path && path.length > 0) {
        return path;
      }
    }

    // Fallback to pathfinder
    return this.getFallbackMove();
  }

  private evaluateStrategicPositions(): StrategicEvaluation[] {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return [];

    const evaluations: StrategicEvaluation[] = [];

    // Evaluate occupation centers
    for (const center of OCCUPATION_CENTERS) {
      const centerPos: [number, number] = [center[0], center[1]];
      const evaluation = this.evaluateOccupationCenter(centerPos);
      if (evaluation) {
        evaluations.push(evaluation);
      }
    }

    // Evaluate blocking positions
    const blockingPositions = this.getStrategicBlockingPositions();
    evaluations.push(...blockingPositions);

    // Evaluate opportunistic positions
    const opportunisticPositions = this.getOpportunisticPositions();
    evaluations.push(...opportunisticPositions);

    return evaluations;
  }

  private evaluateOccupationCenter(
    centerPos: [number, number]
  ): StrategicEvaluation | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    // Check if already owned by me
    const myOwned = this.gameState.botOccupiedPositions.find(
      (pos) => pos.pos[0] === centerPos[0] && pos.pos[1] === centerPos[1]
    );

    if (myOwned && myOwned.opSpent >= 10) {
      return null; // Already maxed out
    }

    // Check if owned by opponent
    const opponentOwned = this.gameState.opponentOccupiedPositions.find(
      (pos) => pos.pos[0] === centerPos[0] && pos.pos[1] === centerPos[1]
    );

    const distanceToMe =
      Math.abs(centerPos[0] - bot.position[0]) +
      Math.abs(centerPos[1] - bot.position[1]);
    const distanceToOpponent =
      Math.abs(centerPos[0] - opponent.position[0]) +
      Math.abs(centerPos[1] - opponent.position[1]);

    // Calculate available OP including movement gain
    const availableOP = bot.power_points + distanceToMe;
    const opponentAvailableOP = opponent.power_points + distanceToOpponent;

    let score = 0;
    let type: "offensive" | "defensive" | "opportunistic" | "blocking" =
      "opportunistic";
    let urgency = 0;

    if (opponentOwned) {
      // Recapture scenario
      const pointsNeeded = opponentOwned.opSpent + 1;
      if (availableOP >= pointsNeeded) {
        score = 200 - distanceToMe * 5;
        type = "defensive";
        urgency = 0.8;

        // Extra urgency if opponent is close to maxing out
        if (opponentOwned.opSpent >= 8) {
          urgency = 1.0;
          score += 100;
        }

        // Bonus for efficiency - can spend extra points to secure
        const surplusOP = availableOP - pointsNeeded;
        if (surplusOP >= 3) {
          score += 50;
          urgency += 0.1;
        }

        // Check if opponent can counter-recapture
        if (opponentAvailableOP < pointsNeeded + 2) {
          score += 80; // Safe recapture
          urgency += 0.2;
        }
      } else {
        // Can't recapture with current resources
        score = 30 - distanceToMe * 2;
        type = "opportunistic";
        urgency = 0.2;
      }
    } else if (myOwned) {
      // Reinforcement scenario
      const remainingCapacity = 10 - myOwned.opSpent;
      if (availableOP >= 1 && remainingCapacity > 0) {
        score = 80 - distanceToMe * 3;
        type = "defensive";
        urgency = Math.min(0.6, remainingCapacity / 10);

        // Higher priority if opponent threatens this center
        if (distanceToOpponent <= 3 && opponentAvailableOP > myOwned.opSpent) {
          score += 60;
          urgency += 0.3;
        }
      }
    } else {
      // Capture new center
      if (availableOP >= 1) {
        score = 150 - distanceToMe * 4;
        type = "offensive";
        urgency = 0.5;

        // Bonus for game phase strategy
        if (this.gamePhase === "early") {
          // In early game, prioritize corner and edge centers
          const isCornerOrEdge = this.isCornerOrEdgeCenter(centerPos);
          if (isCornerOrEdge) {
            score += 50;
            urgency += 0.2;
          }
        } else if (this.gamePhase === "late") {
          // In late game, prioritize centers that block opponent
          if (distanceToOpponent <= 2) {
            score += 80;
            urgency += 0.3;
          }
        }

        // Investment strategy - spend more OP if we have plenty
        if (availableOP > 6) {
          score += 40; // Can afford to invest heavily
          urgency += 0.1;
        }
      } else {
        // Can't capture with current resources
        return null;
      }
    }

    // Distance factor - closer is better
    if (distanceToMe <= 3) {
      score += 30;
      urgency += 0.1;
    }

    // Competition factor - if opponent is also close, increase urgency
    if (distanceToOpponent <= distanceToMe + 1) {
      urgency += 0.3;
      score += 40;
    }

    return score > 0 ? { position: centerPos, score, type, urgency } : null;
  }

  private getStrategicBlockingPositions(): StrategicEvaluation[] {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return [];

    const blockingPositions: StrategicEvaluation[] = [];

    // Find positions that block opponent's path to valuable centers
    for (const center of OCCUPATION_CENTERS) {
      const centerPos: [number, number] = [center[0], center[1]];

      // Skip if I already own it
      const myOwned = this.gameState.botOccupiedPositions.find(
        (pos) => pos.pos[0] === centerPos[0] && pos.pos[1] === centerPos[1]
      );
      if (myOwned) continue;

      // Find positions between opponent and center
      const blockingSpots = this.getBlockingSpots(opponent.position, centerPos);

      for (const spot of blockingSpots) {
        const distanceToMe =
          Math.abs(spot[0] - bot.position[0]) +
          Math.abs(spot[1] - bot.position[1]);

        if (distanceToMe <= 3) {
          blockingPositions.push({
            position: spot,
            score: 120 - distanceToMe * 8,
            type: "blocking",
            urgency: 0.6,
          });
        }
      }
    }

    return blockingPositions;
  }

  private getBlockingSpots(
    oppPos: number[],
    targetPos: number[]
  ): [number, number][] {
    const spots: [number, number][] = [];

    // Calculate direction vector
    const dx = targetPos[1] - oppPos[1];
    const dy = targetPos[0] - oppPos[0];

    // Find positions along the path
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 1; i < steps; i++) {
      const x = oppPos[1] + Math.round((dx * i) / steps);
      const y = oppPos[0] + Math.round((dy * i) / steps);
      const pos: [number, number] = [y, x];

      if (this.isValidPosition(pos) && !this.isOccupationCenter(pos)) {
        spots.push(pos);
      }
    }

    return spots;
  }

  private getOpportunisticPositions(): StrategicEvaluation[] {
    const { bot } = this.gameState;
    if (!bot) return [];

    const positions: StrategicEvaluation[] = [];

    // Look for positions that put us in range of multiple centers
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const pos: [number, number] = [y, x];

        if (!this.isValidPosition(pos) || this.isOccupationCenter(pos))
          continue;

        const distanceToMe =
          Math.abs(y - bot.position[0]) + Math.abs(x - bot.position[1]);
        if (distanceToMe > 3) continue;

        // Count how many centers are within range from this position
        let centersInRange = 0;
        let totalCenterValue = 0;

        for (const center of OCCUPATION_CENTERS) {
          const centerDistance =
            Math.abs(center[0] - y) + Math.abs(center[1] - x);
          if (centerDistance <= 2) {
            centersInRange++;

            // Check if center is valuable
            const isMyCenter = this.gameState.botOccupiedPositions.some(
              (owned) =>
                owned.pos[0] === center[0] && owned.pos[1] === center[1]
            );
            const isOppCenter = this.gameState.opponentOccupiedPositions.some(
              (owned) =>
                owned.pos[0] === center[0] && owned.pos[1] === center[1]
            );

            if (!isMyCenter) {
              totalCenterValue += isOppCenter ? 30 : 20;
            }
          }
        }

        if (centersInRange >= 2 && totalCenterValue > 0) {
          positions.push({
            position: pos,
            score: totalCenterValue * 2 - distanceToMe * 5,
            type: "opportunistic",
            urgency: 0.3 + centersInRange * 0.1,
          });
        }
      }
    }

    return positions;
  }

  private getPathWithAvoidance(
    from: number[],
    to: number[],
    avoid: number[]
  ): [number, number][] | null {
    const opponentBlockedArea = getOpponentBlockedArea({
      x: avoid[0],
      y: avoid[1],
    });

    const path = findShortestPath(
      { x: from[0], y: from[1] },
      { x: to[0], y: to[1] },
      ["4,4"], // shop center
      opponentBlockedArea
    );

    return path ? path.map(({ x, y }) => [x, y]) : null;
  }

  private getFallbackMove(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    const boardState = {
      blocked: [4, 4] as [number, number],
      myPos: bot.position,
      opponentPos: opponent.position,
      myOP: bot.power_points,
      opponentOP: opponent.power_points,
      myCenters: this.gameState.botOccupiedPositions,
      opponentCenters: this.gameState.opponentOccupiedPositions,
      level: "high" as "high" | "middle" | "low",
    };

    const board = this.pathfinder.convertArrayBoard(boardState);
    const bestPath = this.pathfinder.getBestPath(board);

    return bestPath && bestPath.length > 0
      ? bestPath.map(({ x, y }) => [x, y])
      : null;
  }

  private isValidPosition(pos: [number, number]): boolean {
    return pos[0] >= 0 && pos[0] < 9 && pos[1] >= 0 && pos[1] < 9;
  }

  private isOccupationCenter(pos: [number, number]): boolean {
    return OCCUPATION_CENTERS.some(
      (center) => center[0] === pos[0] && center[1] === pos[1]
    );
  }

  private isCornerOrEdgeCenter(pos: [number, number]): boolean {
    const [y, x] = pos;
    return y <= 1 || y >= 7 || x <= 1 || x >= 7;
  }
}
