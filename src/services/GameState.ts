import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { PlayerSchema, ShopItemsSchema } from "../types/game";

export class GameState {
  public bot?: PlayerSchema;
  public opponent?: PlayerSchema;
  public botOccupiedPositions: [number, number][] = [];
  public opponentOccupiedPositions: [number, number][] = [];
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

  updateOccupation(position: [number, number], isBot: boolean) {
    const isOccupationCenter = OCCUPATION_CENTERS.some(
      ([x, y]) => x === position[0] && y === position[1]
    );

    if (!isOccupationCenter) return;

    if (isBot) {
      // Remove from opponent's list
      this.opponentOccupiedPositions = this.opponentOccupiedPositions.filter(
        ([ox, oy]) => !(ox === position[0] && oy === position[1])
      );

      // Add to bot's list if not already there
      const alreadyOccupied = this.botOccupiedPositions.some(
        ([bx, by]) => bx === position[0] && by === position[1]
      );

      if (!alreadyOccupied) {
        this.botOccupiedPositions.push(position);
      }
    } else {
      // Remove from bot's list
      this.botOccupiedPositions = this.botOccupiedPositions.filter(
        ([bx, by]) => !(bx === position[0] && by === position[1])
      );

      // Add to opponent's list if not already there
      const alreadyOccupied = this.opponentOccupiedPositions.some(
        ([ox, oy]) => ox === position[0] && oy === position[1]
      );

      if (!alreadyOccupied) {
        this.opponentOccupiedPositions.push(position);
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
