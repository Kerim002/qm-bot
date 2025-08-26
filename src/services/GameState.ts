import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { OccupiedPosition, PlayerSchema, ShopItemsSchema } from "../types/game";

export class GameState {
  public bot?: PlayerSchema;
  public opponent?: PlayerSchema;
  public botOccupiedPositions: OccupiedPosition[] = [];
  public opponentOccupiedPositions: OccupiedPosition[] = [];
  public shopItems: ShopItemsSchema = {};
  public inventory: string[] = [];

  reset() {
    this.bot = undefined;
    this.opponent = undefined;
    this.botOccupiedPositions = [];
    this.opponentOccupiedPositions = [];
    this.inventory = [];
  }

  updatePlayers(players: PlayerSchema[], botId: number) {
    this.bot = players.find((p) => p.id === botId);
    this.opponent = players.find((p) => p.id !== botId);
  }

  updateOccupation(position: number[], isBot: boolean, opSpent: number) {
    const isOccupationCenter = OCCUPATION_CENTERS.some(
      ([x, y]) => x === position[0] && y === position[1]
    );

    if (!isOccupationCenter) return;

    if (isBot) {
      // Remove from opponent's list if present
      this.opponentOccupiedPositions = this.opponentOccupiedPositions.filter(
        (pos) => !(pos.pos[0] === position[0] && pos.pos[1] === position[1])
      );

      // Add or update bot's list
      const existing = this.botOccupiedPositions.find(
        (pos) => pos.pos[0] === position[0] && pos.pos[1] === position[1]
      );

      if (existing) {
        // Reinforce: add OP but max 10
        existing.opSpent = Math.min(existing.opSpent + opSpent, 10);
      } else {
        this.botOccupiedPositions.push({ pos: position, opSpent });
      }
    } else {
      // Remove from bot's list if present
      this.botOccupiedPositions = this.botOccupiedPositions.filter(
        (pos) => !(pos.pos[0] === position[0] && pos.pos[1] === position[1])
      );

      // Add or update opponent's list
      const existing = this.opponentOccupiedPositions.find(
        (pos) => pos.pos[0] === position[0] && pos.pos[1] === position[1]
      );

      if (existing) {
        // Assume opponent also max 10
        existing.opSpent = Math.min(existing.opSpent + opSpent, 10);
      } else {
        this.opponentOccupiedPositions.push({ pos: position, opSpent });
      }
    }
  }

  addToInventory(item: string) {
    this.inventory.push(item);
  }

  removeFromInventory(item: string) {
    this.inventory = this.inventory.filter((i) => i !== item);
  }

  hasItem(item: string): boolean {
    return this.inventory.includes(item);
  }
}
