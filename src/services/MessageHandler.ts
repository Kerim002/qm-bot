import { filterZones } from "../helpers/filterZones";
import { BotStatus } from "../types/bot";
import { MovedOutput, WSMessage, ZoneSchema } from "../types/game";
import { GameState } from "./GameState";
import { ShopService } from "./ShopService";

export class MessageHandler {
  constructor(
    private gameState: GameState,
    private shopService: ShopService,
    private botId: number,
    private onTurnStart: () => void,
    private onQuestionAsked: () => void,
    private onEndTurn: () => void,
    private onGameOver: () => void,
    private onConnectGame: (payload: boolean) => void,
    private makeAuth: () => void,
    private setStatus: (payload: BotStatus) => void
  ) {}

  handleMessage(message: WSMessage) {
    switch (message.type) {
      case "player_joined":
        break;

      case "game_started":
        this.setStatus("playing");
        this.gameState.updatePlayers(message.output.players, this.botId);
        this.gameState.shopItems = message.output.shop_items;
        break;

      case "round_started":
        this.gameState.updatePlayers(message.output.players, this.botId);
        break;

      case "turn_started":
        setTimeout(() => {
          this.handleTurnStart(message.output.player_id);
        }, 2000);
        break;

      case "question_asked":
        if (message.output.player_id === this.botId) {
          this.onQuestionAsked();
        }
        break;

      case "player_moved":
        this.handlePlayerMoved(message.output);
        break;

      case "item_bought":
        this.handleItemBought(message.output);
        break;

      case "player_healed":
        this.handlePlayerHealed(message.output);
        break;

      case "game_over":
        console.log(`Game over. Winner: ${message.output.winner}`);
        this.gameState.reset();
        this.onGameOver();
        break;

      case "player_disconnected":
        console.log("Player disconnected");
        break;

      case "answer_result":
        console.log("Answer result");
        console.table(message.output);
        break;

      case "player_reconnected":
        if (this.botId === message.output.player_id) {
          console.log("reconnecting");
          this.gameState.updatePlayers(message.output.players, this.botId);
          filterZones(message.output.zones).forEach((item) => {
            if (item.occupant_id === this.botId) {
              this.gameState.updateOccupation(
                item.position,
                true,
                item.occupation_points
              );
            } else if (item.occupant_id) {
              this.gameState.updateOccupation(
                item.position,
                false,
                item.occupation_points
              );
            }
          });

          const inventoryArray: string[] = Object.entries(
            message.output.inventory
          ).flatMap(([item, count]) => Array(count).fill(item));

          inventoryArray.forEach((i) => {
            this.gameState.addToInventory(i);
          });

          const { phase, player_id } = message.output.turn;
          if (player_id === this.botId) {
            console.log("phase", phase);
            if (phase === "AWAITING_MOVE") {
              this.handleTurnStart(player_id);
            } else if (phase === "QUESTION_ASKED") {
              this.onQuestionAsked();
            } else if (phase === "POST_MOVE") {
              this.onEndTurn();
            }
          }
        }

      // case "error":
      //   console.log("error");
      //   if (message.type === "error") {
      //     console.table(message);
      //     // console.log("message key", message.key);
      //     console.log("message.error.key", message.error.key);
      //     if (message.key === "AUTH_SESSION_EXPIRED") {
      //       this.makeAuth();
      //     } else if (message.key === "GAME_NOT_FOUND_TO_RECONNECTION") {
      //       this.onConnectGame(false);
      //     } else if (message.key === "MATCHMAKING_TIMEOUT") {
      //       this.onConnectGame(false);
      //     }
      //   }
      //   break;

      case "error":
        console.log("error");
        if (message.type === "error") {
          console.log("message key", message.error.key);
          if (message.error.key === "AUTH_ERROR") {
            this.makeAuth();
          } else if (message.error.key === "GAME_NOT_FOUND_TO_RECONNECTION") {
            this.onConnectGame(false);
          } else if (message.error.key === "MATCHMAKING_TIMEOUT") {
            this.onConnectGame(false);
          }
        }
        break;
      default:
        console.log(`Unhandled message type: ${message.type} `);

        break;
    }
  }

  private handleTurnStart(playerId: number) {
    if (playerId === this.botId) {
      this.onTurnStart();
    }
  }

  private handlePlayerMoved(output: MovedOutput) {
    const movePath = output.move_path;
    const lastPosition = movePath[movePath.length - 1] as [number, number];
    const isBot = output.player_id === this.botId;

    if (isBot && this.gameState.bot) {
      this.gameState.bot.position = lastPosition;
      if (this.shopService.isInShopArea(lastPosition)) {
        this.onEndTurn();
      }
    } else if (this.gameState.opponent) {
      this.gameState.opponent.position = lastPosition;
    }

    this.gameState.updateOccupation(lastPosition, isBot, output.power_points);
  }

  private handleItemBought(output: any) {
    if (output.player_id === this.botId && this.gameState.bot) {
      this.gameState.addToInventory(output.item_type);
      this.gameState.bot.coins = output.remaining_coins;
      // console.log("Remaining coins:", this.gameState.bot.coins);
      // console.log("Inventory:", this.gameState.inventory);
    }
  }

  private handlePlayerHealed(output: any) {
    if (output.player_id === this.botId && this.gameState.bot) {
      this.gameState.removeFromInventory("HEALING_POTION");
      this.gameState.bot.hp = output.player_hp;
      // console.log("New HP:", this.gameState.bot.hp);
      // console.log("Updated inventory:", this.gameState.inventory);
    }
  }
}
