import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { filterZones } from "../helpers/filterZones";
import {
  OccupiedPosition,
  PlayerSchema,
  PlayerTeleportSchema,
  ShopItemSchema,
  ZoneSchema,
} from "../types/game";

export interface GameStateOptions {
  bot?: PlayerSchema;
  opponent?: PlayerSchema;
  botOccupiedPositions?: OccupiedPosition[];
  opponentOccupiedPositions?: OccupiedPosition[];
  shopItems?: {
    [key: string]: ShopItemSchema;
  };
  inventory?: string[];
  maxHp?: number;
}

export class GameState {
  public bot?: PlayerSchema;
  public opponent?: PlayerSchema;
  public botOccupiedPositions: OccupiedPosition[] = [];
  public opponentOccupiedPositions: OccupiedPosition[] = [];
  public shopItems: {
    [key: string]: ShopItemSchema;
  } = {};
  public inventory: string[] = [];
  public maxHp: number = 0;

  constructor(options: GameStateOptions = {}) {
    this.bot = options.bot;
    this.opponent = options.opponent;
    this.botOccupiedPositions = options.botOccupiedPositions ?? [];
    this.opponentOccupiedPositions = options.opponentOccupiedPositions ?? [];
    this.shopItems = options.shopItems ?? {};
    this.inventory = options.inventory ?? [];
    this.maxHp = options.maxHp ?? 0;
  }

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

  updatePlayerOnTeleport(payload: PlayerTeleportSchema) {
    if (this.bot && this.opponent) {
      if (this.bot.id == payload.player_id) {
        this.bot.position = payload.teleported_position;
      } else if (this.opponent.id == payload.player_id) {
        this.opponent.position == payload.teleported_position;
      }
    }
  }

  updateMaxHp(hp: number) {
    this.maxHp = hp;
  }

  updateOccupation(payload: ZoneSchema) {
    const takePosition = filterZones([payload])[0];
    const occupandId = takePosition.occupant_id;
    const occupiedPosition = takePosition.position;
    const occupationPoints = takePosition.occupation_points;

    const isSamePos = (a: number[], b: number[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);

    // Remove the position from both bot and opponent
    this.botOccupiedPositions = this.botOccupiedPositions.filter(
      (item) => !isSamePos(item.pos, occupiedPosition)
    );
    this.opponentOccupiedPositions = this.opponentOccupiedPositions.filter(
      (item) => !isSamePos(item.pos, occupiedPosition)
    );

    // If no occupant, we're done (clears the spot)
    if (!occupandId) return;

    // Otherwise, add new occupation
    const newItem: OccupiedPosition = {
      opSpent: occupationPoints,
      pos: occupiedPosition,
    };

    if (this.bot?.id === occupandId) {
      this.botOccupiedPositions.push(newItem);
    } else if (this.opponent?.id === occupandId) {
      this.opponentOccupiedPositions.push(newItem);
    }
  }

  updateOccupationOnRecconnect(
    position: number[],
    isBot: boolean,
    opSpent: number
  ) {
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

  logAllStates() {
    console.log("bot occupied postions");
    console.table(this.botOccupiedPositions);
    console.log("opponent occupied postions");
    console.table(this.opponentOccupiedPositions);
    console.log("inventory", this.inventory);
    console.log("bot");
    console.table(this.bot);
    console.log("opponent");
    console.table(this.opponent);
  }
}
