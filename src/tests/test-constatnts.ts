// Strategic game constants for enhanced decision making
export const STRATEGIC_CONSTANTS = {
  // Health thresholds
  HEALTH: {
    CRITICAL: 0.15, // Emergency healing required
    LOW: 0.35, // Should consider healing
    MODERATE: 0.6, // Safe for most actions
    GOOD: 0.8, // Can take risks
  },

  // Distance considerations
  DISTANCE: {
    ADJACENT: 1, // Immediate threat/opportunity
    NEAR: 2, // Close proximity
    MEDIUM: 3, // Moderate distance
    FAR: 4, // Distant
    VERY_FAR: 6, // Very distant
  },

  // Occupation priorities
  OCCUPATION: {
    MAX_POINTS_PER_CENTER: 10,
    MIN_SECURE_POINTS: 3, // Minimum points to feel secure
    REINFORCE_THRESHOLD: 7, // When to reinforce existing centers
    CRITICAL_DEFENSE: 8, // When opponent centers need immediate attention
  },

  // Economic thresholds
  ECONOMY: {
    HEALING_POTION_RESERVE: 2, // Always try to afford 2 healing potions
    EXCESS_COINS: 150, // Consider investing in teleports
    EMERGENCY_COINS: 50, // Minimum coins to maintain
  },

  // Timing parameters
  TIMING: {
    REACTION_BASE: 300, // Base reaction time
    THINKING_MULTIPLIER: 1.5, // Multiply for complex decisions
    PRESSURE_REDUCTION: 0.7, // Reduce timing under pressure
    ENDGAME_ACCELERATION: 0.8, // Faster moves in endgame
  },

  // Strategic weights
  WEIGHTS: {
    POSITION_VALUE: 1.0,
    THREAT_RESPONSE: 1.5,
    OPPORTUNITY_GRAB: 1.2,
    DEFENSIVE_PLAY: 1.3,
    AGGRESSIVE_PLAY: 0.9,
  },
};

// Game phase detector and analyzer
export class GameAnalyzer {
  public static determineGamePhase(
    totalCentersOccupied: number,
    totalCenters: number,
    gameTime: number,
    maxGameTime: number = 300000 // 5 minutes default
  ): "early" | "mid" | "late" {
    const centerRatio = totalCentersOccupied / totalCenters;
    const timeRatio = gameTime / maxGameTime;

    if (centerRatio < 0.25 && timeRatio < 0.3) return "early";
    if (centerRatio > 0.7 || timeRatio > 0.8) return "late";
    return "mid";
  }

  public static assessWinningPosition(
    myCenters: number,
    myTotalOP: number,
    opponentCenters: number,
    opponentTotalOP: number,
    myHP: number,
    opponentHP: number,
    maxHP: number
  ): {
    isWinning: boolean;
    isLosing: boolean;
    advantage: number; // -1 to 1 scale
    confidence: number; // 0 to 1 scale
  } {
    // Calculate territorial advantage
    const territorialAdvantage =
      (myCenters - opponentCenters) / Math.max(myCenters + opponentCenters, 1);

    // Calculate occupation strength advantage
    const occupationAdvantage =
      (myTotalOP - opponentTotalOP) / Math.max(myTotalOP + opponentTotalOP, 1);

    // Calculate health advantage
    const healthAdvantage = (myHP - opponentHP) / maxHP;

    // Weighted overall advantage
    const advantage =
      territorialAdvantage * 0.5 +
      occupationAdvantage * 0.3 +
      healthAdvantage * 0.2;

    // Confidence based on how decisive the advantages are
    const confidence = Math.min(
      1,
      Math.abs(territorialAdvantage) * 0.4 +
        Math.abs(occupationAdvantage) * 0.3 +
        Math.abs(healthAdvantage) * 0.3
    );

    return {
      isWinning: advantage > 0.15 && confidence > 0.3,
      isLosing: advantage < -0.15 && confidence > 0.3,
      advantage,
      confidence,
    };
  }

  public static evaluateThreatLevel(
    myPosition: [number, number],
    opponentPosition: [number, number],
    myHP: number,
    opponentHP: number,
    maxHP: number,
    myOP: number,
    opponentOP: number
  ): {
    overall: number; // 0 to 1
    proximity: number;
    health: number;
    resource: number;
  } {
    // Proximity threat
    const distance =
      Math.abs(myPosition[0] - opponentPosition[0]) +
      Math.abs(myPosition[1] - opponentPosition[1]);
    const proximityThreat = Math.max(0, 1 - distance / 8); // Normalize to board size

    // Health differential threat
    const healthDiff = (opponentHP - myHP) / maxHP;
    const healthThreat = Math.max(0, healthDiff);

    // Resource threat (opponent has more power points)
    const resourceDiff = (opponentOP - myOP) / Math.max(myOP + opponentOP, 1);
    const resourceThreat = Math.max(0, resourceDiff);

    const overall =
      proximityThreat * 0.4 + healthThreat * 0.3 + resourceThreat * 0.3;

    return {
      overall: Math.min(1, overall),
      proximity: proximityThreat,
      health: healthThreat,
      resource: resourceThreat,
    };
  }

  public static findOptimalCenterSequence(
    myPosition: [number, number],
    availableCenters: Array<{ pos: [number, number]; priority: number }>,
    myOP: number,
    maxMoves: number = 3
  ): Array<{ pos: [number, number]; priority: number; cost: number }> {
    const sequences: Array<{
      centers: Array<{ pos: [number, number]; priority: number; cost: number }>;
      totalPriority: number;
      totalCost: number;
    }> = [];

    // Generate possible sequences within movement range
    function generateSequences(
      currentPos: [number, number],
      remainingMoves: number,
      currentSequence: Array<{
        pos: [number, number];
        priority: number;
        cost: number;
      }>,
      usedCenters: Set<string>
    ) {
      if (remainingMoves === 0 || currentSequence.length >= 3) {
        if (currentSequence.length > 0) {
          sequences.push({
            centers: [...currentSequence],
            totalPriority: currentSequence.reduce(
              (sum, c) => sum + c.priority,
              0
            ),
            totalCost: currentSequence.reduce((sum, c) => sum + c.cost, 0),
          });
        }
        return;
      }

      for (const center of availableCenters) {
        const centerKey = `${center.pos[0]},${center.pos[1]}`;
        if (usedCenters.has(centerKey)) continue;

        const distance =
          Math.abs(center.pos[0] - currentPos[0]) +
          Math.abs(center.pos[1] - currentPos[1]);

        if (distance <= remainingMoves) {
          const moveCost = distance;
          const occupationCost = 1; // Minimum cost to occupy
          const totalCost = moveCost + occupationCost;

          if (myOP >= occupationCost) {
            usedCenters.add(centerKey);
            currentSequence.push({
              pos: center.pos,
              priority: center.priority,
              cost: totalCost,
            });

            generateSequences(
              center.pos,
              remainingMoves - moveCost,
              currentSequence,
              usedCenters
            );

            // Backtrack
            currentSequence.pop();
            usedCenters.delete(centerKey);
          }
        }
      }
    }

    generateSequences(myPosition, maxMoves, [], new Set());

    // Sort by efficiency (priority per cost)
    sequences.sort((a, b) => {
      const efficiencyA = a.totalPriority / Math.max(a.totalCost, 1);
      const efficiencyB = b.totalPriority / Math.max(b.totalCost, 1);
      return efficiencyB - efficiencyA;
    });

    return sequences.length > 0 ? sequences[0].centers : [];
  }

  public static calculateRiskReward(
    action: "aggressive" | "defensive" | "neutral",
    gameState: {
      myAdvantage: number;
      threatLevel: number;
      gamePhase: "early" | "mid" | "late";
      resourceAdvantage: number;
    }
  ): {
    expectedReward: number;
    risk: number;
    recommendation: "proceed" | "caution" | "avoid";
  } {
    let baseReward = 0;
    let baseRisk = 0;

    // Base risk/reward by action type
    switch (action) {
      case "aggressive":
        baseReward = 0.8;
        baseRisk = 0.6;
        break;
      case "defensive":
        baseReward = 0.4;
        baseRisk = 0.2;
        break;
      case "neutral":
        baseReward = 0.5;
        baseRisk = 0.3;
        break;
    }

    // Adjust based on game state
    let rewardMultiplier = 1;
    let riskMultiplier = 1;

    // Game phase adjustments
    if (gameState.gamePhase === "early") {
      rewardMultiplier *= action === "aggressive" ? 1.2 : 1.0;
    } else if (gameState.gamePhase === "late") {
      rewardMultiplier *= action === "aggressive" ? 1.4 : 0.8;
      riskMultiplier *= action === "aggressive" ? 1.3 : 0.9;
    }

    // Position adjustments
    if (gameState.myAdvantage > 0.2) {
      // Winning - be more conservative
      rewardMultiplier *= action === "defensive" ? 1.3 : 0.8;
      riskMultiplier *= action === "aggressive" ? 1.4 : 1.0;
    } else if (gameState.myAdvantage < -0.2) {
      // Losing - need to take risks
      rewardMultiplier *= action === "aggressive" ? 1.5 : 0.7;
      riskMultiplier *= action === "aggressive" ? 0.9 : 1.2;
    }

    // Threat level adjustments
    if (gameState.threatLevel > 0.7) {
      riskMultiplier *= action === "aggressive" ? 1.5 : 1.0;
      rewardMultiplier *= action === "defensive" ? 1.4 : 1.0;
    }

    const expectedReward = baseReward * rewardMultiplier;
    const risk = baseRisk * riskMultiplier;

    // Calculate recommendation
    const riskRewardRatio = expectedReward / Math.max(risk, 0.1);
    let recommendation: "proceed" | "caution" | "avoid";

    if (riskRewardRatio > 2) {
      recommendation = "proceed";
    } else if (riskRewardRatio > 1) {
      recommendation = "caution";
    } else {
      recommendation = "avoid";
    }

    return {
      expectedReward,
      risk,
      recommendation,
    };
  }
}

// Strategic decision tree for complex situations
export class StrategicDecisionTree {
  public static evaluateComplexSituation(gameState: {
    myPosition: [number, number];
    opponentPosition: [number, number];
    myHP: number;
    opponentHP: number;
    maxHP: number;
    myOP: number;
    opponentOP: number;
    myCenters: Array<{ pos: [number, number]; opSpent: number }>;
    opponentCenters: Array<{ pos: [number, number]; opSpent: number }>;
    coins: number;
    inventory: string[];
  }): {
    primaryStrategy: "dominate" | "survive" | "opportunistic" | "defensive";
    secondaryActions: string[];
    urgency: "low" | "medium" | "high";
    confidence: number;
  } {
    const analyzer = GameAnalyzer;

    // Assess current situation
    const winPosition = analyzer.assessWinningPosition(
      gameState.myCenters.length,
      gameState.myCenters.reduce((sum, c) => sum + c.opSpent, 0),
      gameState.opponentCenters.length,
      gameState.opponentCenters.reduce((sum, c) => sum + c.opSpent, 0),
      gameState.myHP,
      gameState.opponentHP,
      gameState.maxHP
    );

    const threatLevel = analyzer.evaluateThreatLevel(
      gameState.myPosition,
      gameState.opponentPosition,
      gameState.myHP,
      gameState.opponentHP,
      gameState.maxHP,
      gameState.myOP,
      gameState.opponentOP
    );

    // Determine primary strategy
    let primaryStrategy: "dominate" | "survive" | "opportunistic" | "defensive";
    let urgency: "low" | "medium" | "high" = "medium";
    const secondaryActions: string[] = [];

    if (
      gameState.myHP <
      gameState.maxHP * STRATEGIC_CONSTANTS.HEALTH.CRITICAL
    ) {
      primaryStrategy = "survive";
      urgency = "high";
      secondaryActions.push("emergency_heal", "avoid_combat", "seek_shop");
    } else if (winPosition.isWinning && winPosition.confidence > 0.6) {
      primaryStrategy = "dominate";
      urgency = "medium";
      secondaryActions.push(
        "secure_centers",
        "pressure_opponent",
        "maintain_advantage"
      );
    } else if (winPosition.isLosing && winPosition.confidence > 0.6) {
      primaryStrategy = "opportunistic";
      urgency = "high";
      secondaryActions.push(
        "aggressive_capture",
        "disrupt_opponent",
        "take_risks"
      );
    } else if (threatLevel.overall > 0.7) {
      primaryStrategy = "defensive";
      urgency = "high";
      secondaryActions.push(
        "defensive_positioning",
        "reinforce_centers",
        "heal_preparation"
      );
    } else {
      primaryStrategy = "opportunistic";
      urgency = "low";
      secondaryActions.push(
        "expand_territory",
        "economic_growth",
        "strategic_positioning"
      );
    }

    // Add situational secondary actions
    if (gameState.coins > STRATEGIC_CONSTANTS.ECONOMY.EXCESS_COINS) {
      secondaryActions.push("invest_items");
    }

    if (gameState.inventory.length < 2) {
      secondaryActions.push("stock_healing");
    }

    const distance =
      Math.abs(gameState.myPosition[0] - gameState.opponentPosition[0]) +
      Math.abs(gameState.myPosition[1] - gameState.opponentPosition[1]);

    if (distance <= 2) {
      secondaryActions.push("tactical_movement");
    }

    return {
      primaryStrategy,
      secondaryActions,
      urgency,
      confidence: winPosition.confidence,
    };
  }
}
