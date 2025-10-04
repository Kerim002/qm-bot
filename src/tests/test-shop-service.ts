import { SHOP_AREA } from "../constants/gameConstants";
import { GameState } from "../services/GameState";

interface ShopStrategy {
  priority: number;
  reason: string;
  action: "buy_healing" | "buy_teleport" | "use_healing" | "none";
}

export class ShopService {
  private lastShopVisit: number = 0;
  private emergencyThreshold: number = 0.2; // 20% HP
  private comfortThreshold: number = 0.6; // 60% HP

  constructor(private gameState: GameState) {}

  isInShopArea(position: number[]): boolean {
    return (
      position[0] >= SHOP_AREA.MIN_X &&
      position[0] <= SHOP_AREA.MAX_X &&
      position[1] >= SHOP_AREA.MIN_Y &&
      position[1] <= SHOP_AREA.MAX_Y
    );
  }

  shouldGoToShop(): boolean {
    const strategy = this.evaluateShopStrategy();
    return strategy.priority > 70 && strategy.action !== "none";
  }

  private evaluateShopStrategy(): ShopStrategy {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) {
      return { priority: 0, reason: "No bot/opponent data", action: "none" };
    }

    const strategies: ShopStrategy[] = [];

    // Strategy 1: Emergency healing
    const hpPercent = bot.hp / this.gameState.maxHp;
    if (hpPercent <= this.emergencyThreshold) {
      const healingPotionPrice =
        this.gameState.shopItems["HEALING_POTION"]?.price || 0;
      const canAfford = bot.coins >= healingPotionPrice;
      const hasHealing = this.gameState.hasItem("HEALING_POTION");

      if (hasHealing) {
        strategies.push({
          priority: 100,
          reason: "Critical HP - use healing potion",
          action: "use_healing",
        });
      } else if (canAfford && this.gameState.inventory.length < 4) {
        strategies.push({
          priority: 95,
          reason: "Critical HP - buy healing potion",
          action: "buy_healing",
        });
      }
    }

    // Strategy 2: Preventive healing
    if (
      hpPercent <= this.comfortThreshold &&
      hpPercent > this.emergencyThreshold
    ) {
      const healingPotionPrice =
        this.gameState.shopItems["HEALING_POTION"]?.price || 0;
      const canAfford = bot.coins >= healingPotionPrice;
      const hasHealing = this.gameState.hasItem("HEALING_POTION");

      // Consider threat level
      const threatLevel = this.assessThreatLevel();
      const basePriority = 60 - hpPercent * 30; // Lower HP = higher priority

      if (hasHealing && threatLevel > 0.5) {
        strategies.push({
          priority: basePriority + 20,
          reason: "Moderate HP with high threat - use healing",
          action: "use_healing",
        });
      } else if (canAfford && this.gameState.inventory.length < 4) {
        strategies.push({
          priority: basePriority,
          reason: "Preventive healing purchase",
          action: "buy_healing",
        });
      }
    }

    // Strategy 3: Strategic item stocking
    const stockingStrategy = this.evaluateStockingStrategy();
    if (stockingStrategy.priority > 0) {
      strategies.push(stockingStrategy);
    }

    // Strategy 4: Teleport stone acquisition
    const teleportStrategy = this.evaluateTeleportStrategy();
    if (teleportStrategy.priority > 0) {
      strategies.push(teleportStrategy);
    }

    // Return the highest priority strategy
    strategies.sort((a, b) => b.priority - a.priority);
    return strategies.length > 0
      ? strategies[0]
      : { priority: 0, reason: "No beneficial shop action", action: "none" };
  }

  private assessThreatLevel(): number {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return 0;

    let threatScore = 0;

    // Distance threat - closer opponent is more dangerous
    const distance =
      Math.abs(bot.position[0] - opponent.position[0]) +
      Math.abs(bot.position[1] - opponent.position[1]);
    if (distance <= 3) {
      threatScore += 0.4;
    } else if (distance <= 5) {
      threatScore += 0.2;
    }

    // HP differential threat
    const hpDiff = opponent.hp - bot.hp;
    if (hpDiff > 0) {
      threatScore += Math.min(0.3, hpDiff / this.gameState.maxHp);
    }

    // Opponent's power points (ability to contest centers)
    if (opponent.power_points > bot.power_points) {
      threatScore += 0.2;
    }

    // Territorial control - if opponent controls more centers
    const myControlledCenters = this.gameState.botOccupiedPositions.length;
    const oppControlledCenters =
      this.gameState.opponentOccupiedPositions.length;
    if (oppControlledCenters > myControlledCenters) {
      threatScore += 0.3;
    }

    return Math.min(1.0, threatScore);
  }

  private evaluateStockingStrategy(): ShopStrategy {
    const { bot } = this.gameState;
    if (!bot || this.gameState.inventory.length >= 4) {
      return { priority: 0, reason: "Inventory full", action: "none" };
    }

    const healingPotionPrice =
      this.gameState.shopItems["HEALING_POTION"]?.price || 0;
    const healingPotionsOwned = this.gameState.inventory.filter(
      (item) => item === "HEALING_POTION"
    ).length;

    // If we have coins and inventory space, consider stocking up
    if (bot.coins >= healingPotionPrice * 2 && healingPotionsOwned < 2) {
      const hpPercent = bot.hp / this.gameState.maxHp;
      const basePriority = 40;

      // Adjust based on current HP
      const hpBonus = hpPercent < 0.8 ? 20 : 0;

      // Adjust based on game state
      const gameStateBonus =
        this.gameState.botOccupiedPositions.length < 2 ? 10 : 0;

      return {
        priority: basePriority + hpBonus + gameStateBonus,
        reason: "Strategic healing potion stocking",
        action: "buy_healing",
      };
    }

    return { priority: 0, reason: "No stocking needed", action: "none" };
  }

  private evaluateTeleportStrategy(): ShopStrategy {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent || this.gameState.inventory.length >= 4) {
      return { priority: 0, reason: "No teleport needed", action: "none" };
    }

    const teleportPrice =
      this.gameState.shopItems["TELEPORT_STONE"]?.price || 0;
    const hasTeleport = this.gameState.hasItem("TELEPORT_STONE");

    if (hasTeleport || bot.coins < teleportPrice) {
      return {
        priority: 0,
        reason: "Already have teleport or can't afford",
        action: "none",
      };
    }

    let priority = 0;
    let reason = "";

    // High value if we're far from important centers
    const importantCenters = this.getImportantUncontrolledCenters();
    if (importantCenters.length > 0) {
      const closestDistance = Math.min(
        ...importantCenters.map(
          (center) =>
            Math.abs(center[0] - bot.position[0]) +
            Math.abs(center[1] - bot.position[1])
        )
      );

      if (closestDistance > 4) {
        priority = 70;
        reason = "Far from important centers - teleport valuable";
      }
    }

    // High value if opponent is blocking our path
    const isBlocked = this.isPathToImportantCentersBlocked();
    if (isBlocked) {
      priority = Math.max(priority, 65);
      reason = "Opponent blocking path - teleport needed";
    }

    // Consider if we have excess coins
    if (bot.coins >= teleportPrice * 1.5) {
      priority = Math.max(priority, 50);
      reason = "Excess coins - teleport investment";
    }

    return priority > 0
      ? { priority, reason, action: "buy_teleport" }
      : { priority: 0, reason: "Teleport not strategic", action: "none" };
  }

  private getImportantUncontrolledCenters(): number[][] {
    // This would need to import OCCUPATION_CENTERS or receive it as parameter
    // For now, returning empty array - you should integrate with your constants
    return [];
  }

  private isPathToImportantCentersBlocked(): boolean {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return false;

    // Simple heuristic: if opponent is between us and center of board
    const boardCenter = [4, 4];
    const botToCenter =
      Math.abs(bot.position[0] - boardCenter[0]) +
      Math.abs(bot.position[1] - boardCenter[1]);
    const oppToCenter =
      Math.abs(opponent.position[0] - boardCenter[0]) +
      Math.abs(opponent.position[1] - boardCenter[1]);
    const botToOpp =
      Math.abs(bot.position[0] - opponent.position[0]) +
      Math.abs(bot.position[1] - opponent.position[1]);

    // If opponent is closer to center and close to us, they might be blocking
    return oppToCenter < botToCenter && botToOpp <= 3;
  }

  canBuyHealingPotion(): boolean {
    const { bot } = this.gameState;
    if (!bot || this.gameState.inventory.length >= 4) return false;

    const strategy = this.evaluateShopStrategy();
    return (
      this.isInShopArea(bot.position) &&
      strategy.action === "buy_healing" &&
      strategy.priority > 50
    );
  }

  shouldUseHealingPotion(): boolean {
    const strategy = this.evaluateShopStrategy();
    return strategy.action === "use_healing" && strategy.priority > 80;
  }

  canBuyTeleport(): boolean {
    const { bot } = this.gameState;
    if (!bot || this.gameState.inventory.length >= 4) return false;

    const strategy = this.evaluateShopStrategy();
    return (
      this.isInShopArea(bot.position) &&
      strategy.action === "buy_teleport" &&
      strategy.priority > 50
    );
  }

  // Additional strategic methods
  shouldVisitShopSoon(): boolean {
    const { bot } = this.gameState;
    if (!bot) return false;

    const hpPercent = bot.hp / this.gameState.maxHp;
    const hasHealing = this.gameState.hasItem("HEALING_POTION");

    // If HP is getting low and we don't have healing
    if (hpPercent < 0.5 && !hasHealing) {
      const healingPrice =
        this.gameState.shopItems["HEALING_POTION"]?.price || 0;
      return bot.coins >= healingPrice;
    }

    // If we have excess coins and inventory space
    if (bot.coins > 100 && this.gameState.inventory.length < 3) {
      return true;
    }

    return false;
  }

  getShopPriority(): number {
    const strategy = this.evaluateShopStrategy();
    return strategy.priority;
  }

  getOptimalShopTiming(): "immediate" | "soon" | "when_convenient" | "avoid" {
    const priority = this.getShopPriority();

    if (priority >= 90) return "immediate";
    if (priority >= 70) return "soon";
    if (priority >= 40) return "when_convenient";
    return "avoid";
  }
}
