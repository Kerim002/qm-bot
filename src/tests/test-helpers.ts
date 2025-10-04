import { positionsEqual } from "../helpers/positionsEqual";
import { OccupiedPosition } from "../types/game";
import {
  CenterEvaluation,
  Position as PositionWIthObject,
} from "../types/global";

// Enhanced randomness with strategic consideration
export function addRandomness(
  score: number,
  level: "high" | "middle" | "low" = "high",
  strategicContext?: {
    isUrgent?: boolean;
    isDefensive?: boolean;
    gamePhase?: "early" | "mid" | "late";
  }
): number {
  let randomFactor = 0;

  // Base randomness by difficulty level
  switch (level) {
    case "high":
      randomFactor = 0.01;
      break;
    case "middle":
      randomFactor = 0.08;
      break;
    case "low":
      randomFactor = 0.15;
      break;
  }

  // Adjust randomness based on strategic context
  if (strategicContext) {
    if (strategicContext.isUrgent) {
      randomFactor *= 0.5; // Less randomness in urgent situations
    }

    if (strategicContext.isDefensive) {
      randomFactor *= 0.7; // More predictable defensive moves
    }

    if (strategicContext.gamePhase === "late") {
      randomFactor *= 0.6; // Less randomness in endgame
    }
  }

  const randomMultiplier = 1 + (Math.random() - 0.5) * randomFactor;
  return score * randomMultiplier;
}

// Enhanced shop movement with multiple strategic considerations
type Position = number[];

const directions: Position[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

interface ShopEvaluation {
  position: Position;
  distance: number;
  safety: number;
  strategicValue: number;
  totalScore: number;
}

export function getBestShopMove(
  myPos: Position,
  opponentPos: Position,
  gameContext?: {
    myHP?: number;
    maxHP?: number;
    powerPoints?: number;
    urgency?: "low" | "medium" | "high";
  }
): Position | null {
  const size = 9;
  const shop: Position = [4, 4];

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

  // If already in shop area, return null
  if (shopTargets.some(([y, x]) => y === myPos[0] && x === myPos[1])) {
    return null;
  }

  // Enhanced opponent blocking - consider their potential movement
  const blocked = new Set<string>();
  const threatRadius =
    gameContext?.urgency === "high"
      ? 2
      : gameContext?.urgency === "medium"
      ? 1
      : 0;

  // Block opponent's current position and potential moves
  for (let dy = -threatRadius; dy <= threatRadius; dy++) {
    for (let dx = -threatRadius; dx <= threatRadius; dx++) {
      const oy = opponentPos[0] + dy;
      const ox = opponentPos[1] + dx;
      if (oy >= 0 && oy < size && ox >= 0 && ox < size) {
        blocked.add(`${oy},${ox}`);
      }
    }
  }

  // BFS with enhanced evaluation
  const queue: [Position, number][] = [[myPos, 0]];
  const visited = new Set<string>([`${myPos[0]},${myPos[1]}`]);
  const evaluations: ShopEvaluation[] = [];

  while (queue.length > 0) {
    const [pos, dist] = queue.shift()!;
    const [y, x] = pos;

    // Evaluate each position we can reach
    const evaluation = evaluateShopPosition(
      pos,
      shopTargets,
      opponentPos,
      dist,
      gameContext
    );
    if (evaluation) {
      evaluations.push(evaluation);

      // If this is a shop target, we found a direct path
      if (shopTargets.some(([ty, tx]) => ty === y && tx === x)) {
        evaluation.totalScore += 100; // Bonus for direct shop access
      }
    }

    if (dist === 3) continue; // Movement limit

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

  // Select best position based on total score
  if (evaluations.length === 0) return null;

  evaluations.sort((a, b) => b.totalScore - a.totalScore);
  const best = evaluations[0];

  // Don't move if we're already at the best position
  return best.position[0] !== myPos[0] || best.position[1] !== myPos[1]
    ? best.position
    : null;
}

function evaluateShopPosition(
  pos: Position,
  shopTargets: Position[],
  opponentPos: Position,
  distance: number,
  gameContext?: {
    myHP?: number;
    maxHP?: number;
    powerPoints?: number;
    urgency?: "low" | "medium" | "high";
  }
): ShopEvaluation | null {
  const [y, x] = pos;

  // Distance to nearest shop target
  const minShopDistance = Math.min(
    ...shopTargets.map(([ty, tx]) => Math.abs(ty - y) + Math.abs(tx - x))
  );

  // Safety score (distance from opponent)
  const safetyDistance =
    Math.abs(y - opponentPos[0]) + Math.abs(x - opponentPos[1]);

  // Strategic value based on position
  let strategicValue = 0;

  // Corner shop positions are often safer
  if ((y === 3 || y === 5) && (x === 3 || x === 5)) {
    strategicValue += 20;
  }

  // Central shop positions offer more options
  if (y === 4 && (x === 3 || x === 5)) {
    strategicValue += 15;
  }
  if ((y === 3 || y === 5) && x === 4) {
    strategicValue += 15;
  }

  // Calculate scores
  const distanceScore = Math.max(0, 50 - minShopDistance * 10);
  const safetyScore = Math.min(50, safetyDistance * 8);

  // Adjust based on game context
  let contextMultiplier = 1;
  if (gameContext) {
    if (gameContext.urgency === "high") {
      contextMultiplier = 1.5; // Prioritize speed
    }

    if (gameContext.myHP && gameContext.maxHP) {
      const hpPercent = gameContext.myHP / gameContext.maxHP;
      if (hpPercent < 0.3) {
        contextMultiplier *= 1.3; // Extra urgency for low HP
      }
    }
  }

  const totalScore =
    (distanceScore + safetyScore + strategicValue) * contextMultiplier;

  return {
    position: pos,
    distance: minShopDistance,
    safety: safetyScore,
    strategicValue,
    totalScore,
  };
}

// Enhanced level multipliers with dynamic adjustment
export function getLevelMultipliers(
  level: "high" | "middle" | "low" = "high",
  gameState?: {
    isWinning?: boolean;
    isLosing?: boolean;
    gamePhase?: "early" | "mid" | "late";
    threatLevel?: number; // 0-1
  }
): {
  aggression: number;
  riskTaking: number;
  efficiency: number;
  adaptability: number;
} {
  let base = {
    aggression: 1.0,
    riskTaking: 1.0,
    efficiency: 1.0,
    adaptability: 1.0,
  };

  // Base level adjustments
  switch (level) {
    case "high":
      base = {
        aggression: 1.6,
        riskTaking: 1.3,
        efficiency: 1.4,
        adaptability: 1.5,
      };
      break;
    case "middle":
      base = {
        aggression: 1.2,
        riskTaking: 1.0,
        efficiency: 1.1,
        adaptability: 1.0,
      };
      break;
    case "low":
      base = {
        aggression: 0.8,
        riskTaking: 0.7,
        efficiency: 0.9,
        adaptability: 0.8,
      };
      break;
  }

  // Dynamic adjustments based on game state
  if (gameState) {
    if (gameState.isWinning) {
      // More conservative when winning
      base.aggression *= 0.9;
      base.riskTaking *= 0.8;
      base.efficiency *= 1.1;
    }

    if (gameState.isLosing) {
      // More aggressive when losing
      base.aggression *= 1.2;
      base.riskTaking *= 1.3;
      base.adaptability *= 1.2;
    }

    if (gameState.gamePhase === "late") {
      // More decisive in endgame
      base.aggression *= 1.1;
      base.efficiency *= 1.2;
      base.adaptability *= 1.3;
    }

    if (gameState.threatLevel && gameState.threatLevel > 0.7) {
      // More defensive under high threat
      base.aggression *= 0.8;
      base.riskTaking *= 0.7;
      base.efficiency *= 1.1;
    }
  }

  return base;
}

// Enhanced position scoring with strategic depth

export const horsePlacesScore = (
  { x, y }: PositionWIthObject,
  context?: {
    gamePhase?: "early" | "mid" | "late";
    opponentNearby?: boolean;
    controlledCenters?: number;
    strategicImportance?: "high" | "medium" | "low";
  }
) => {
  let baseScore = 0;

  // Original scoring logic
  if (
    (x === 2 || x === 3 || x === 5 || x === 6) &&
    (y === 2 || y === 3 || y === 5 || y === 6)
  ) {
    baseScore = 55;
  } else if (
    (x === 1 || x === 4 || x === 7) &&
    (y === 1 || y === 4 || y === 7)
  ) {
    baseScore = 10;
  } else {
    baseScore = 0;
  }

  // Enhanced scoring with context
  if (context && baseScore > 0) {
    let multiplier = 1;

    if (context.gamePhase === "early" && baseScore === 55) {
      multiplier *= 1.2; // Prioritize good positions early
    }

    if (context.gamePhase === "late" && baseScore === 10) {
      multiplier *= 1.3; // Even mediocre positions matter late game
    }

    if (context.opponentNearby) {
      multiplier *= 1.4; // Competition increases value
    }

    if (context.strategicImportance === "high") {
      multiplier *= 1.5;
    } else if (context.strategicImportance === "medium") {
      multiplier *= 1.2;
    }

    // Diminishing returns if we already control many centers
    if (context.controlledCenters && context.controlledCenters > 3) {
      multiplier *= 0.9;
    }

    baseScore *= multiplier;
  }

  return Math.round(baseScore);
};

export function evaluateCenter(
  centerPos: PositionWIthObject,
  myCurrentOP: number,
  opponentCenters: OccupiedPosition[],
  myCenters: OccupiedPosition[],
  level: "high" | "middle" | "low" = "high",
  additionalContext?: {
    opponentOP?: number;
    gamePhase?: "early" | "mid" | "late";
    myPosition?: PositionWIthObject;
    opponentPosition?: PositionWIthObject;
    timeRemaining?: number;
  }
): CenterEvaluation {
  // Calculate available OP including movement gain
  let availableOP = myCurrentOP;
  if (additionalContext?.myPosition) {
    const movementDistance =
      Math.abs(centerPos.x - additionalContext.myPosition.x) +
      Math.abs(centerPos.y - additionalContext.myPosition.y);
    availableOP = myCurrentOP + movementDistance;
  }
  // Check if I already own this center
  const myOwned = myCenters.find((c) =>
    positionsEqual({ x: c.pos[0], y: c.pos[1] }, centerPos)
  );

  if (myOwned) {
    const remainingCapacity = 10 - myOwned.opSpent;
    if (remainingCapacity <= 0) {
      return { priority: 0, type: "owned", requiredPoints: 0 };
    }

    // Strategic reinforcement evaluation
    let reinforcementPriority = 30;

    if (additionalContext) {
      // Higher priority if opponent is nearby
      if (additionalContext.opponentPosition) {
        const distToOpp =
          Math.abs(centerPos.x - additionalContext.opponentPosition.x) +
          Math.abs(centerPos.y - additionalContext.opponentPosition.y);
        if (distToOpp <= 2) {
          reinforcementPriority += 40;
        }
      }

      // Higher priority in late game to secure victory
      if (additionalContext.gamePhase === "late") {
        reinforcementPriority += 25;
      }

      // Strategic positioning bonus
      const positionValue = horsePlacesScore(centerPos, {
        gamePhase: additionalContext.gamePhase,
        strategicImportance: "high",
      });
      reinforcementPriority += positionValue * 0.2;
    }

    return {
      priority: reinforcementPriority,
      type: "owned",
      requiredPoints: Math.min(remainingCapacity, availableOP),
    };
  }

  // Check if opponent owns the center
  const opponentOwned = opponentCenters.find((c) =>
    positionsEqual({ x: c.pos[0], y: c.pos[1] }, centerPos)
  );

  if (opponentOwned) {
    let priority = 150;
    let requiredPoints = opponentOwned.opSpent + 1;

    // Check if we can actually recapture with movement + current OP
    if (availableOP < requiredPoints) {
      // Can't recapture, lower priority significantly
      priority = 20;
      requiredPoints = availableOP;
    }

    // Enhanced recapture logic
    if (additionalContext && availableOP >= requiredPoints) {
      // Critical recapture scenarios
      if (opponentOwned.opSpent >= 8) {
        priority += 100; // Prevent opponent from maxing out
      }

      if (additionalContext.gamePhase === "late") {
        priority += 75; // Late game recaptures are crucial
      }

      // Distance-based urgency
      if (additionalContext.myPosition && additionalContext.opponentPosition) {
        const myDist =
          Math.abs(centerPos.x - additionalContext.myPosition.x) +
          Math.abs(centerPos.y - additionalContext.myPosition.y);
        const oppDist =
          Math.abs(centerPos.x - additionalContext.opponentPosition.x) +
          Math.abs(centerPos.y - additionalContext.opponentPosition.y);

        if (myDist < oppDist) {
          priority += 50; // I'm closer, good chance to recapture
        } else if (myDist > oppDist + 1) {
          priority -= 30; // Opponent much closer, lower priority
        }

        // Bonus for efficiency - can recapture with surplus OP
        const surplusOP = availableOP - requiredPoints;
        if (surplusOP > 3) {
          priority += 30; // Can spend extra points to secure
          requiredPoints = Math.min(requiredPoints + 2, availableOP); // Spend extra for security
        }
      }

      // Resource consideration - check if opponent can counter-recapture
      if (additionalContext.opponentOP && additionalContext.opponentPosition) {
        const oppMovementDistance =
          Math.abs(centerPos.x - additionalContext.opponentPosition.x) +
          Math.abs(centerPos.y - additionalContext.opponentPosition.y);
        const oppAvailableOP =
          additionalContext.opponentOP + oppMovementDistance;

        if (oppAvailableOP < requiredPoints + 1) {
          priority += 60; // Opponent can't counter-recapture immediately
        }
      }
    }

    // Difficulty-based adjustments
    switch (level) {
      case "high":
        priority = Math.max(priority, 200);
        break;
      case "middle":
        priority = Math.max(priority, 150);
        break;
      case "low":
        priority = Math.max(priority, 100);
        requiredPoints = Math.min(requiredPoints + 1, availableOP);
        break;
    }

    return {
      priority: Math.min(priority, 500), // Cap priority
      type: "recapture",
      requiredPoints: Math.min(requiredPoints, availableOP),
    };
  }

  // Free center - capture evaluation
  let priority = 100;
  let requiredPoints = 1;

  if (additionalContext) {
    // Strategic position bonus
    const positionBonus = horsePlacesScore(centerPos, {
      gamePhase: additionalContext.gamePhase,
      strategicImportance: "high",
    });
    priority += positionBonus * 0.5;

    // Game phase adjustments
    if (additionalContext.gamePhase === "early") {
      priority += 30; // Early expansion is important
    } else if (additionalContext.gamePhase === "late") {
      priority += 50; // Every center matters in endgame
    }

    // Competitive pressure
    if (additionalContext.opponentPosition) {
      const oppDist =
        Math.abs(centerPos.x - additionalContext.opponentPosition.x) +
        Math.abs(centerPos.y - additionalContext.opponentPosition.y);
      if (oppDist <= 2) {
        priority += 40; // Opponent close, need to claim quickly
      }
    }

    // Economic efficiency - invest more OP if we have plenty
    if (availableOP > 5) {
      priority += 20; // Can afford to invest more
      requiredPoints = Math.min(Math.floor(availableOP / 2), 5); // Invest up to half our available OP, max 5
    } else if (availableOP >= 3) {
      requiredPoints = Math.min(3, availableOP); // Moderate investment
    }
  }

  // Level-based adjustments
  switch (level) {
    case "high":
      priority += 20;
      break;
    case "middle":
      // Base priority
      break;
    case "low":
      priority -= 20;
      break;
  }

  return {
    priority: Math.max(priority, 50), // Minimum priority for free centers
    type: "capture",
    requiredPoints: Math.min(requiredPoints, availableOP),
  };
}

// New strategic helper functions

// Evaluate board control and territorial advantage
export function evaluateBoardControl(
  myCenters: OccupiedPosition[],
  opponentCenters: OccupiedPosition[],
  myPosition: PositionWIthObject,
  opponentPosition: PositionWIthObject
): {
  controlScore: number;
  territorialAdvantage: number;
  strategicPosition: number;
} {
  // Calculate total occupation points
  const myTotalOP = myCenters.reduce((sum, center) => sum + center.opSpent, 0);
  const oppTotalOP = opponentCenters.reduce(
    (sum, center) => sum + center.opSpent,
    0
  );

  // Calculate control score (weighted by center quality)
  let myControlScore = 0;
  let oppControlScore = 0;

  for (const center of myCenters) {
    const centerPos = { x: center.pos[0], y: center.pos[1] };
    const positionValue = horsePlacesScore(centerPos);
    myControlScore += (center.opSpent / 10) * (1 + positionValue / 100);
  }

  for (const center of opponentCenters) {
    const centerPos = { x: center.pos[0], y: center.pos[1] };
    const positionValue = horsePlacesScore(centerPos);
    oppControlScore += (center.opSpent / 10) * (1 + positionValue / 100);
  }

  const controlScore = myControlScore - oppControlScore;

  // Territorial advantage based on position
  const boardCenterDistance =
    Math.abs(myPosition.x - 4) + Math.abs(myPosition.y - 4);
  const oppBoardCenterDistance =
    Math.abs(opponentPosition.x - 4) + Math.abs(opponentPosition.y - 4);
  const territorialAdvantage = oppBoardCenterDistance - boardCenterDistance;

  // Strategic position evaluation
  const myStrategicValue = horsePlacesScore(myPosition);
  const oppStrategicValue = horsePlacesScore(opponentPosition);
  const strategicPosition = myStrategicValue - oppStrategicValue;

  return {
    controlScore,
    territorialAdvantage,
    strategicPosition,
  };
}

// Predict opponent's likely next moves
export function predictOpponentMoves(
  opponentPosition: PositionWIthObject,
  opponentCenters: OccupiedPosition[],
  myCenters: OccupiedPosition[],
  opponentOP: number
): PositionWIthObject[] {
  const possibleMoves: PositionWIthObject[] = [];

  // Check positions within 3 moves
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const distance = Math.abs(dy) + Math.abs(dx);
      if (distance > 0 && distance <= 3) {
        const newPos: PositionWIthObject = {
          x: opponentPosition.x + dx,
          y: opponentPosition.y + dy,
        };

        if (newPos.x >= 0 && newPos.x < 9 && newPos.y >= 0 && newPos.y < 9) {
          possibleMoves.push(newPos);
        }
      }
    }
  }

  // Score moves based on likely opponent strategy
  const scoredMoves = possibleMoves.map((pos) => {
    let score = 0;

    // Check if position threatens my centers
    for (const myCenter of myCenters) {
      const centerPos = { x: myCenter.pos[0], y: myCenter.pos[1] };
      const distToCenter =
        Math.abs(pos.x - centerPos.x) + Math.abs(pos.y - centerPos.y);
      if (distToCenter <= 1) {
        score += 50 + (10 - myCenter.opSpent) * 5; // Higher score for threatening weak centers
      }
    }

    // Check if position is near free centers
    const positionValue = horsePlacesScore(pos);
    score += positionValue * 0.3;

    // Prefer positions that maintain distance from my position
    const distanceFromMe =
      Math.abs(pos.x - opponentPosition.x) +
      Math.abs(pos.y - opponentPosition.y);
    score += Math.min(20, distanceFromMe * 3);

    return { position: pos, score };
  });

  // Return top 5 most likely moves
  return scoredMoves
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((move) => move.position);
}

// Calculate the optimal timing for different actions
export function calculateActionTiming(
  actionType: "movement" | "shop" | "heal" | "answer",
  urgency: "low" | "medium" | "high",
  gamePhase: "early" | "mid" | "late",
  competitionLevel: number = 0.5
): { min: number; max: number } {
  const baseTiming = {
    movement: { min: 800, max: 2500 },
    shop: { min: 500, max: 1200 },
    heal: { min: 300, max: 800 },
    answer: { min: 1500, max: 4000 },
  };

  let timing = baseTiming[actionType];

  // Urgency adjustments
  const urgencyMultiplier = {
    low: 1.2,
    medium: 1.0,
    high: 0.6,
  }[urgency];

  timing.min *= urgencyMultiplier;
  timing.max *= urgencyMultiplier;

  // Game phase adjustments
  if (gamePhase === "late") {
    timing.min *= 0.8;
    timing.max *= 0.8;
  } else if (gamePhase === "early") {
    timing.min *= 1.1;
    timing.max *= 1.1;
  }

  // Competition level adjustments
  if (competitionLevel > 0.7) {
    timing.min *= 0.7;
    timing.max *= 0.8;
  }

  return {
    min: Math.max(200, Math.round(timing.min)),
    max: Math.max(timing.min + 100, Math.round(timing.max)),
  };
}
