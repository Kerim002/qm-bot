import { WSMessage } from "../types/game";
import { GameState } from "./GameState";
import { ShopService } from "./ShopService";

export class MessageHandler {
  constructor(
    private gameState: GameState,
    private shopService: ShopService,
    private botId: number,
    private onTurnStart: () => void,
    private onGameOver: () => void,
    private onQuestionAsked: (question: any) => void
  ) {}

  handleMessage(message: WSMessage) {
    switch (message.type) {
      case "player_joined":
        console.log("Player joined");
        break;

      case "game_started":
        this.gameState.updatePlayers(message.output.players, this.botId);
        this.gameState.shopItems = message.output.shop_items;
        break;

      case "round_started":
        this.gameState.updatePlayers(message.output.players, this.botId);
        break;

      case "turn_started":
        this.handleTurnStart(message.output.player_id);
        break;

      case "question_asked":
        if (message.output.player_id === this.botId) {
          this.onQuestionAsked(message.output);
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
        this.onGameOver();
        break;

      case "player_disconnected":
        console.log("Player disconnected");
        break;

      case "answer_result":
        console.log("Answer result");

      default:
        console.log(
          `Unhandled message type: ${message.type} ${message.output}`
        );
        break;
    }
  }

  private handleTurnStart(playerId: number) {
    if (playerId === this.botId) {
      this.onTurnStart();
    }

    if (this.shopService.canBuyHealingPotion()) {
      console.log("Should buy healing potion");
    }

    if (this.shopService.shouldUseHealingPotion()) {
      console.log("Should use healing potion");
    }
  }

  private handlePlayerMoved(output: any) {
    const movePath = output.move_path;
    const lastPosition = movePath[movePath.length - 1] as [number, number];
    const isBot = output.player_id === this.botId;

    if (isBot && this.gameState.bot) {
      this.gameState.bot.position = lastPosition;
    } else if (this.gameState.opponent) {
      this.gameState.opponent.position = lastPosition;
    }

    this.gameState.updateOccupation(lastPosition, isBot);
  }

  private handleItemBought(output: any) {
    if (output.player_id === this.botId && this.gameState.bot) {
      this.gameState.addToInventory(output.item_type);
      this.gameState.bot.coins = output.remaining_coins;
      console.log("Remaining coins:", this.gameState.bot.coins);
      console.log("Inventory:", this.gameState.inventory);
    }
  }

  private handlePlayerHealed(output: any) {
    if (output.player_id === this.botId && this.gameState.bot) {
      this.gameState.removeFromInventory("HEALING_POTION");
      this.gameState.bot.hp = output.player_hp;
      console.log("New HP:", this.gameState.bot.hp);
      console.log("Updated inventory:", this.gameState.inventory);
    }
  }
}
