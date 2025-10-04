import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { GameState } from "../services/GameState";

interface RecaptureOpportunity {
  centerPos: [number, number];
  opponentOP: number;
  requiredOP: number;
  movementDistance: number;
  totalAvailableOP: number;
  canRecapture: boolean;
  efficiency: number; // OP surplus after recapture
  priority: number;
}

interface CaptureOpportunity {
  centerPos: [number, number];
  movementDistance: number;
  totalAvailableOP: number;
  recommendedInvestment: number;
  efficiency: number;
  priority: number;
}

export class MovementOPCalculator {
  /**
   * Calculate all recapture opportunities considering movement OP gain
   */
  public static analyzeRecaptureOpportunities(
    gameState: GameState
  ): RecaptureOpportunity[] {
    const { bot, opponent } = gameState;
    if (!bot || !opponent) return [];

    const opportunities: RecaptureOpportunity[] = [];

    for (const oppCenter of gameState.opponentOccupiedPositions) {
      const centerPos: [number, number] = [oppCenter.pos[0], oppCenter.pos[1]];
      const movementDistance =
        Math.abs(centerPos[0] - bot.position[0]) +
        Math.abs(centerPos[1] - bot.position[1]);

      const totalAvailableOP = bot.power_points + movementDistance;
      const requiredOP = oppCenter.opSpent + 1;
      const canRecapture = totalAvailableOP >= requiredOP;
      const efficiency = totalAvailableOP - requiredOP;

      // Calculate priority based on multiple factors
      let priority = 100;

      // High priority for almost-maxed centers
      if (oppCenter.opSpent >= 8) priority += 150;
      else if (oppCenter.opSpent >= 6) priority += 100;

      // Distance penalty
      priority -= movementDistance * 5;

      // Efficiency bonus
      if (efficiency >= 3) priority += 50;
      else if (efficiency >= 1) priority += 20;

      // Can't recapture penalty
      if (!canRecapture) priority -= 200;

      opportunities.push({
        centerPos,
        opponentOP: oppCenter.opSpent,
        requiredOP,
        movementDistance,
        totalAvailableOP,
        canRecapture,
        efficiency,
        priority: Math.max(0, priority),
      });
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate all capture opportunities for free centers
   */
  public static analyzeCaptureOpportunities(
    gameState: GameState
  ): CaptureOpportunity[] {
    const { bot, opponent } = gameState;
    if (!bot || !opponent) return [];

    const occupiedPositions = new Set([
      ...gameState.botOccupiedPositions.map(
        (pos) => `${pos.pos[0]},${pos.pos[1]}`
      ),
      ...gameState.opponentOccupiedPositions.map(
        (pos) => `${pos.pos[0]},${pos.pos[1]}`
      ),
    ]);

    const opportunities: CaptureOpportunity[] = [];

    for (const center of OCCUPATION_CENTERS) {
      const centerKey = `${center[0]},${center[1]}`;
      if (occupiedPositions.has(centerKey)) continue;

      const centerPos: [number, number] = [center[0], center[1]];
      const movementDistance =
        Math.abs(centerPos[0] - bot.position[0]) +
        Math.abs(centerPos[1] - bot.position[1]);

      const totalAvailableOP = bot.power_points + movementDistance;

      if (totalAvailableOP < 1) continue; // Can't capture

      // Calculate recommended investment
      let recommendedInvestment = 1; // Minimum
      if (totalAvailableOP >= 5) {
        recommendedInvestment = Math.min(4, Math.floor(totalAvailableOP * 0.6));
      } else if (totalAvailableOP >= 3) {
        recommendedInvestment = 2;
      }

      const efficiency = totalAvailableOP - recommendedInvestment;

      // Calculate priority
      let priority = 120 - movementDistance * 8;

      // Strategic position bonus
      const positionValue = this.getPositionValue(centerPos);
      priority += positionValue;

      // Efficiency bonus
      if (efficiency >= 3) priority += 30;

      // Competition factor - check if opponent is close
      const oppDistance =
        Math.abs(centerPos[0] - opponent.position[0]) +
        Math.abs(centerPos[1] - opponent.position[1]);
      if (oppDistance <= 3) priority += 40;

      opportunities.push({
        centerPos,
        movementDistance,
        totalAvailableOP,
        recommendedInvestment,
        efficiency,
        priority: Math.max(0, priority),
      });
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get the strategic value of a position
   */
  private static getPositionValue(pos: [number, number]): number {
    const [y, x] = pos;

    // Corner positions are valuable
    if ((y <= 1 || y >= 7) && (x <= 1 || x >= 7)) return 40;

    // Edge positions
    if (y <= 1 || y >= 7 || x <= 1 || x >= 7) return 25;

    // Central positions
    if (y >= 3 && y <= 5 && x >= 3 && x <= 5) return 35;

    return 15;
  }

  /**
   * Find the best strategic move considering OP calculations
   */
  public static findBestStrategicMove(gameState: GameState): {
    action: "recapture" | "capture" | "reinforce" | "none";
    target: [number, number] | null;
    movementPath: [number, number][] | null;
    opInvestment: number;
    reasoning: string;
  } {
    const { bot } = gameState;
    if (!bot) {
      return {
        action: "none",
        target: null,
        movementPath: null,
        opInvestment: 0,
        reasoning: "No bot data",
      };
    }

    // Analyze recapture opportunities
    const recaptures = this.analyzeRecaptureOpportunities(gameState);
    const viableRecaptures = recaptures.filter(
      (r) => r.canRecapture && r.priority > 100
    );

    // Analyze capture opportunities
    const captures = this.analyzeCaptureOpportunities(gameState);
    const viableCaptures = captures.filter((c) => c.priority > 80);

    // Analyze reinforcement opportunities
    const reinforcements = this.analyzeReinforcementOpportunities(gameState);
    const viableReinforcements = reinforcements.filter((r) => r.priority > 60);

    // Priority order: Critical recaptures > High-value captures > Reinforcements > Other captures
    if (viableRecaptures.length > 0) {
      const best = viableRecaptures[0];
      const path = this.calculateMovementPath(bot.position, best.centerPos);

      return {
        action: "recapture",
        target: best.centerPos,
        movementPath: path,
        opInvestment: best.requiredOP + Math.min(2, best.efficiency), // Invest extra for security
        reasoning: `Recapture center at [${best.centerPos}] from opponent (${best.opponentOP} OP) with ${best.totalAvailableOP} available OP`,
      };
    }

    if (viableCaptures.length > 0) {
      const best = viableCaptures[0];
      const path = this.calculateMovementPath(bot.position, best.centerPos);

      return {
        action: "capture",
        target: best.centerPos,
        movementPath: path,
        opInvestment: best.recommendedInvestment,
        reasoning: `Capture free center at [${best.centerPos}] with ${best.totalAvailableOP} available OP, investing ${best.recommendedInvestment}`,
      };
    }

    if (viableReinforcements.length > 0) {
      const best = viableReinforcements[0];
      const path = this.calculateMovementPath(bot.position, best.centerPos);

      return {
        action: "reinforce",
        target: best.centerPos,
        movementPath: path,
        opInvestment: best.recommendedInvestment,
        reasoning: `Reinforce owned center at [${best.centerPos}] from ${
          best.currentOP
        } to ${best.currentOP + best.recommendedInvestment} OP`,
      };
    }

    return {
      action: "none",
      target: null,
      movementPath: null,
      opInvestment: 0,
      reasoning: "No viable strategic moves available",
    };
  }

  /**
   * Analyze reinforcement opportunities for owned centers
   */
  private static analyzeReinforcementOpportunities(
    gameState: GameState
  ): Array<{
    centerPos: [number, number];
    currentOP: number;
    movementDistance: number;
    totalAvailableOP: number;
    recommendedInvestment: number;
    priority: number;
  }> {
    const { bot, opponent } = gameState;
    if (!bot || !opponent) return [];

    const opportunities = [];

    for (const myCenter of gameState.botOccupiedPositions) {
      if (myCenter.opSpent >= 10) continue; // Already maxed

      const centerPos: [number, number] = [myCenter.pos[0], myCenter.pos[1]];
      const movementDistance =
        Math.abs(centerPos[0] - bot.position[0]) +
        Math.abs(centerPos[1] - bot.position[1]);

      const totalAvailableOP = bot.power_points + movementDistance;
      const remainingCapacity = 10 - myCenter.opSpent;
      const recommendedInvestment = Math.min(
        remainingCapacity,
        Math.floor(totalAvailableOP * 0.5)
      );

      if (recommendedInvestment < 1) continue;

      // Calculate priority
      let priority = 60;

      // Higher priority for weak centers
      if (myCenter.opSpent <= 3) priority += 40;
      else if (myCenter.opSpent <= 6) priority += 20;

      // Check if opponent threatens this center
      const oppDistance =
        Math.abs(centerPos[0] - opponent.position[0]) +
        Math.abs(centerPos[1] - opponent.position[1]);
      const oppAvailableOP = opponent.power_points + oppDistance;

      if (oppAvailableOP > myCenter.opSpent && oppDistance <= 4) {
        priority += 80; // High threat, need reinforcement
      }

      // Distance penalty
      priority -= movementDistance * 3;

      opportunities.push({
        centerPos,
        currentOP: myCenter.opSpent,
        movementDistance,
        totalAvailableOP,
        recommendedInvestment,
        priority: Math.max(0, priority),
      });
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate a simple movement path (for demonstration - replace with your pathfinding)
   */
  private static calculateMovementPath(
    from: number[],
    to: number[]
  ): [number, number][] {
    const path: [number, number][] = [];
    let current = [...from] as [number, number];

    // Simple Manhattan distance path (replace with proper pathfinding)
    while (current[0] !== to[0] || current[1] !== to[1]) {
      if (current[0] < to[0]) current[0]++;
      else if (current[0] > to[0]) current[0]--;
      else if (current[1] < to[1]) current[1]++;
      else if (current[1] > to[1]) current[1]--;

      path.push([...current] as [number, number]);
    }

    return path;
  }

  /**
   * Test function for your example scenario
   */
  public static testScenario(): void {
    // Your example data
    const bot = {
      coins: 220,
      hp: 37,
      id: 1,
      name: "bot",
      position: [5, 4] as [number, number],
      power_points: 5,
      max_hp: 100,
    };

    const opponent = {
      coins: 185,
      hp: 38,
      id: 2,
      name: "user",
      position: [1, 4] as [number, number],
      power_points: 5,
      max_hp: 100,
    };

    const shopItems = {
      HEALING_POTION: {
        description: "",
        name: "",
        price: 5,
      },
    };

    const botOccupiedPosition = [
      { pos: [4, 0], opSpent: 8 },
      { pos: [7, 1], opSpent: 6 },
      { pos: [7, 7], opSpent: 6 },
    ];

    const opponentOccupiedPosition = [
      { pos: [8, 4], opSpent: 6 },
      { pos: [4, 8], opSpent: 8 },
      { pos: [1, 1], opSpent: 2 },
      { pos: [1, 7], opSpent: 6 },
    ];

    // Create game state
    const gameState = new GameState({
      bot: bot,
      botOccupiedPositions: botOccupiedPosition,
      inventory: [],
      maxHp: 100,
      opponent: opponent,
      opponentOccupiedPositions: opponentOccupiedPosition,
      shopItems: shopItems,
    });

    console.log("=== Testing Movement OP Calculator ===");
    console.log(
      `Bot position: [${bot.position}], Current OP: ${bot.power_points}`
    );
    console.log();

    // Analyze recapture opportunities
    const recaptures = this.analyzeRecaptureOpportunities(gameState);
    console.log("RECAPTURE OPPORTUNITIES:");
    recaptures.forEach((opportunity, index) => {
      console.log(`${index + 1}. Center [${opportunity.centerPos}]:`);
      console.log(`   - Opponent OP: ${opportunity.opponentOP}`);
      console.log(`   - Required OP: ${opportunity.requiredOP}`);
      console.log(`   - Movement distance: ${opportunity.movementDistance}`);
      console.log(`   - Total available OP: ${opportunity.totalAvailableOP}`);
      console.log(
        `   - Can recapture: ${opportunity.canRecapture ? "YES" : "NO"}`
      );
      console.log(`   - OP surplus: ${opportunity.efficiency}`);
      console.log(`   - Priority: ${opportunity.priority}`);
      console.log();
    });

    // Analyze capture opportunities
    const captures = this.analyzeCaptureOpportunities(gameState);
    console.log("CAPTURE OPPORTUNITIES (Top 3):");
    captures.slice(0, 3).forEach((opportunity, index) => {
      console.log(`${index + 1}. Center [${opportunity.centerPos}]:`);
      console.log(`   - Movement distance: ${opportunity.movementDistance}`);
      console.log(`   - Total available OP: ${opportunity.totalAvailableOP}`);
      console.log(
        `   - Recommended investment: ${opportunity.recommendedInvestment}`
      );
      console.log(`   - OP remaining: ${opportunity.efficiency}`);
      console.log(`   - Priority: ${opportunity.priority}`);
      console.log();
    });

    // Find best strategic move
    const bestMove = this.findBestStrategicMove(gameState);
    console.log("BEST STRATEGIC MOVE:");
    console.log(`Action: ${bestMove.action}`);
    console.log(`Target: [${bestMove.target}]`);
    console.log(`OP Investment: ${bestMove.opInvestment}`);
    console.log(`Reasoning: ${bestMove.reasoning}`);

    if (bestMove.movementPath) {
      console.log(
        `Movement path: ${bestMove.movementPath
          .map((pos) => `[${pos}]`)
          .join(" -> ")}`
      );
    }
  }
}
