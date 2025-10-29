// services/ShopService.ts
import { SHOP_AREA, GAME_CONFIG } from "../constants/gameConstants";
import { GameState } from "./GameState";
import { getBestShopMove } from "../helpers/bestShopPath";

export class ShopService {
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
    const { bot, opponent, inventory } = this.gameState;
    if (!bot || !opponent) return false;

    const needsHealing = bot.hp < this.gameState.maxHp / 3;

    const hasEnoughCoins =
      bot.coins > this.gameState.shopItems["HEALING_POTION"]?.price;
    // console.log(inventory);
    // console.log(inventory.includes("HEALING_POTION"));
    // console.log(hasEnoughCoins);
    // console.log(this.gameState.shopItems["HEALING_POTION"]);
    // console.log(bot.coins);

    if (
      !needsHealing ||
      !hasEnoughCoins ||
      inventory.includes("HEALING_POTION")
    )
      return false;

    const bestShopPath = getBestShopMove(bot.position, opponent.position);
    return bestShopPath ? true : false;
  }

  canBuyHealingPotion(): boolean {
    const { bot } = this.gameState;
    if (!bot || this.gameState.inventory.length === 4) return false;

    return (
      this.isInShopArea(bot.position) &&
      bot.hp < this.gameState.maxHp / 2 &&
      bot.coins > this.gameState.shopItems["HEALING_POTION"]?.price
    );
  }

  shouldUseHealingPotion(): boolean {
    const { bot, maxHp } = this.gameState;
    return Boolean(
      bot && this.gameState.hasItem("HEALING_POTION") && bot.hp < maxHp / 4
    );
  }

  canBuyTeleport(): boolean {
    const { bot } = this.gameState;
    if (!bot || this.gameState.inventory.length === 4) return false;

    return (
      this.isInShopArea(bot.position) &&
      bot.coins > this.gameState.shopItems["TELEPORT_STONE"]?.price
    );
  }
}
