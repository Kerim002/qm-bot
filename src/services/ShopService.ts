// services/ShopService.ts
import { SHOP_AREA, GAME_CONFIG } from "../constants/gameConstants";
import { GameState } from "./GameState";
import { getBestShopMove } from "../helpers/bestShopPath";

export class ShopService {
  constructor(private gameState: GameState) {}

  isInShopArea(position: [number, number]): boolean {
    return (
      position[0] >= SHOP_AREA.MIN_X &&
      position[0] <= SHOP_AREA.MAX_X &&
      position[1] >= SHOP_AREA.MIN_Y &&
      position[1] <= SHOP_AREA.MAX_Y
    );
  }

  shouldGoToShop(): boolean {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return false;

    const needsHealing = bot.hp < GAME_CONFIG.HEAL_THRESHOLD;
    const hasEnoughCoins =
      bot.coins > this.gameState.shopItems["HEALING_POTION"]?.price;

    if (!needsHealing || !hasEnoughCoins) return false;

    const bestShopPath = getBestShopMove(bot.position, opponent.position);
    return bestShopPath ? this.isInShopArea(bestShopPath) : false;
  }

  canBuyHealingPotion(): boolean {
    const { bot } = this.gameState;
    if (!bot) return false;

    return (
      this.isInShopArea(bot.position) &&
      bot.hp < GAME_CONFIG.MAX_HEAL_THRESHOLD &&
      bot.coins > this.gameState.shopItems["HEALING_POTION"]?.price
    );
  }

  shouldUseHealingPotion(): boolean {
    const { bot } = this.gameState;
    return Boolean(
      bot &&
        this.gameState.hasItem("HEALING_POTION") &&
        bot.hp < GAME_CONFIG.USE_HEAL_HP
    );
  }
}
