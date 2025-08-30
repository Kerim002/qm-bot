import WebSocket from "ws";
import { basicLogin, guestLogin } from "./auth/authenticateBot";
import { GameState } from "./services/GameState";
import { ShopService } from "./services/ShopService";
import { MovementService } from "./services/MovementService";
import { MessageHandler } from "./services/MessageHandler";
import { GAME_CONFIG, GAME_TIMES } from "./constants/gameConstants";
import { BotStatus } from "./types/bot";
import { getRandomTimeInMs } from "./helpers/getRandomTimeInMs";

export class GameBot {
  private ws?: WebSocket;
  private status: BotStatus = "idle";
  private sessionId: string = "";
  private botId: number = -1;
  private password?: string;

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
    private serverUrl: string,
    private onStatusChange?: (bot: GameBot, status: string) => void
  ) {
    this.messageHandler = new MessageHandler(
      this.gameState,
      this.shopService,
      this.botId,
      () => this.takeTurn(),
      () => this.answerQuestion(),
      () => this.endTurn(),
      () => this.onGameOver(),
      (payload: boolean) => this.connectToGame(payload),
      () => this.relogin(),
      (payload: BotStatus) => this.setStatus(payload)
    );
  }

  private setStatus(status: BotStatus) {
    this.status = status;
    this.onStatusChange?.(this, status);
  }

  private sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private onGameOver() {
    this.setStatus("idle");
  }

  private takeTurn() {
    if (this.shopService.shouldUseHealingPotion()) {
      this.sendMessage({ type: "use_healing_potion", input: {} });
    }

    if (this.shopService.canBuyHealingPotion()) {
      this.sendMessage({
        type: "buy_item",
        input: { item_type: "HEALING_POTION" },
      });
    }

    // Handle movement
    const nextMove = this.movementService.getNextMove();
    if (nextMove) {
      setTimeout(() => {
        this.sendMessage({
          type: "move",
          input: { move_path: nextMove },
        });
      }, getRandomTimeInMs(GAME_TIMES.POSITION_MIN, GAME_TIMES.POSITION_MAX));
    }
  }

  private endTurn() {
    setTimeout(() => {
      this.sendMessage({ type: "end_turn", input: {} });
    }, getRandomTimeInMs(GAME_TIMES.TURN_MIN, GAME_TIMES.TURN_MAX));
  }

  private answerQuestion() {
    setTimeout(() => {
      this.sendMessage({
        type: "submit_answer",
        input: { option_idx: 0 },
      });
      this.endTurn();
    }, getRandomTimeInMs(GAME_TIMES.ANSWER_MIN, GAME_TIMES.ANSWER_MAX));
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
        `[${this.name}] Connected to game${
          reconnect ? " (reconnected)" : "connected"
        }`
      );
      // this.setStatus("playing");
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
      // console.log(`[${this.username}] Disconnected from server`);
      // this.updateStatus("idle");

      // try reconnect after delay
      // setTimeout(() => {
      //   // this.refreshSession(); // or login again if session invalid
      //   console.log("recconnect");
      //   this.connectToGame(true);
      // }, 5000);
      // this.connectToGame(false);
    });

    this.ws.on("error", (err) => {
      console.error(`[${this.name}] WebSocket error`, err);
    });
  }

  async loginToGame(payload: { username: string; password: string }) {
    try {
      // const deviceId = `bot-${this.name}-${Math.random()
      //   .toString(36)
      //   .slice(2)}`;
      const login = await basicLogin(payload);
      this.sessionId = login.sessionId;
      this.botId = login.userId;

      this.messageHandler = new MessageHandler(
        this.gameState,
        this.shopService,
        this.botId,
        () => this.takeTurn(),
        () => this.answerQuestion(),
        () => this.endTurn(),
        () => this.onGameOver(),
        (payload: boolean) => this.connectToGame(payload),
        () => this.relogin(),
        (payload: BotStatus) => this.setStatus(payload)
      );

      this.connectToGame(true);
    } catch (err) {
      console.error(`[${this.name}] Failed to connect to game`, err);
      this.setStatus("idle");
    }
  }

  async startSearching(password: string) {
    this.setStatus("searching");
    if (this.botId > 1) {
      this.connectToGame();
    } else {
      await this.loginToGame({ username: this.name, password });
    }
  }

  private async relogin() {
    if (!this.password) {
      console.error(`[${this.name}] No password stored, cannot relogin.`);
      return;
    }
    console.log(`[${this.name}] Session expired, relogging in...`);
    await this.loginToGame({ username: this.name, password: this.password });
  }

  async startPlayingPersistent(password: string) {
    this.setStatus("playing");
    await this.loginToGame({ username: this.name, password });
  }

  getStatus() {
    return this.status;
  }
}
