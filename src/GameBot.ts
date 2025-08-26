// GameBot.ts (Refactored main class)
import WebSocket from "ws";
import { basicLogin, guestLogin } from "./auth/authenticateBot";
import { GameState } from "./services/GameState";
import { ShopService } from "./services/ShopService";
import { MovementService } from "./services/MovementService";
import { MessageHandler } from "./services/MessageHandler";
import { GAME_CONFIG } from "./constants/gameConstants";
import { tryCatch } from "graphql-request/build/lib/prelude";

export class GameBot {
  private ws?: WebSocket;
  private status: "idle" | "searching" | "playing" = "idle";
  private sessionId: string = "";
  private botId: number = -1;

  // Services
  private gameState = new GameState();
  private shopService = new ShopService(this.gameState);
  private movementService = new MovementService(
    this.gameState,
    this.shopService
  );
  private messageHandler: MessageHandler;

  constructor(
    public name: string,
    public rank: number,
    private serverUrl: string,
    private onStatusChange?: (bot: GameBot, status: string) => void
  ) {
    this.messageHandler = new MessageHandler(
      this.gameState,
      this.shopService,
      this.botId,
      () => this.takeTurn(),
      () => this.restartGame(),
      () => this.answerQuestion(),
      () => this.endTurn(),
      () => this.reconnectGame()
    );
  }

  private setStatus(status: "idle" | "searching" | "playing") {
    this.status = status;
    this.onStatusChange?.(this, status);
  }

  private sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private takeTurn() {
    // Handle shop actions first
    if (this.shopService.shouldUseHealingPotion()) {
      this.sendMessage({ type: "use_healing_potion", input: {} });
      //   return;
    }

    if (this.shopService.canBuyHealingPotion()) {
      this.sendMessage({
        type: "buy_item",
        input: { item_type: "HEALING_POTION" },
      });
      //   return;
    }

    // Handle movement
    const nextMove = this.movementService.getNextMove();
    if (nextMove) {
      this.sendMessage({
        type: "move",
        input: { move_path: nextMove },
      });
    }

    // End turn after timeout
    this.endTurn();
  }

  private endTurn() {
    setTimeout(() => {
      this.sendMessage({ type: "end_turn", input: {} });
    }, GAME_CONFIG.TURN_TIMEOUT);
  }

  private answerQuestion() {
    // const randomOption = Math.floor(Math.random() * 1); // Fixed: was * 1
    this.sendMessage({
      type: "submit_answer",
      input: { option_idx: 0 },
    });
  }

  private async reconnectGame() {
    try {
      await this.connectToGame(true);
    } catch (error) {
      console.log("error reconnnecting", error);
      await this.connectToGame();
    }
  }

  private async connectToGame(reconnect: boolean = false) {
    const url = reconnect
      ? `${this.serverUrl}/ws/game?reconnect=true`
      : `${this.serverUrl}/ws/game`;

    this.ws = new WebSocket(url, {
      headers: {
        authorization: `Session ${this.sessionId}`,
      },
    });

    this.ws.on("open", () => {
      console.log(
        `[${this.name}] Connected to game${reconnect ? " (reconnected)" : ""}`
      );
      this.setStatus("playing");
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.messageHandler.handleMessage(message);
      } catch (err) {
        console.error(`[${this.name}] Invalid message format`, err);
      }
    });

    this.ws.on("close", (code, reason) => {
      console.log(`[${this.name}] Disconnected: ${code} ${reason.toString()}`);
      this.restartGame();
    });

    this.ws.on("error", (err) => {
      console.error(`[${this.name}] WebSocket error`, err);
      this.restartGame();
    });
  }

  private restartGame() {
    this.gameState.reset();
    this.setStatus("idle");
    setTimeout(() => {
      this.connectToGame();
    }, GAME_CONFIG.RECONNECT_DELAY);
  }

  async loginToGame(payload: { username: string; password: string }) {
    try {
      const deviceId = `bot-${this.name}-${Math.random()
        .toString(36)
        .slice(2)}`;
      // const login = await guestLogin(deviceId);
      const login = await basicLogin(payload);
      this.sessionId = login.sessionId;
      this.botId = login.userId;

      // Update message handler with the correct bot ID
      this.messageHandler = new MessageHandler(
        this.gameState,
        this.shopService,
        this.botId,
        () => this.takeTurn(),
        () => this.restartGame(),
        () => this.answerQuestion(),
        () => this.endTurn(),
        () => this.reconnectGame()
      );

      this.reconnectGame().then((res) => console.log("res: ", res));
    } catch (err) {
      console.error(`[${this.name}] Failed to connect to game`, err);
    }
  }
}
