import { basicLogin } from "../auth/authenticateBot";
import { GAME_TIMES } from "../constants/gameConstants";
import { getRandomTimeInMs } from "../helpers/getRandomTimeInMs";
import { GameState } from "../services/GameState";
import { BotStatus } from "../types/bot";
import logger from "../utils/logger";
import { MessageHandler } from "./test-message-handler";
import { MovementService } from "./test-movement-service";
import { ShopService } from "./test-shop-service";
import WebSocket from "ws";

const botPassword = process.env.BOT_PASSWORD || "test";

interface GameAnalytics {
  gamesPlayed: number;
  winRate: number;
  avgGameLength: number;
  strategicDecisions: {
    shopVisits: number;
    centersCaptured: number;
    centersLost: number;
    emergencyHeals: number;
  };
}

export class GameBot {
  private ws?: WebSocket;
  private status: BotStatus = "idle";
  private sessionId: string = "";
  private botId: number = -1;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private gameStartTime: number = 0;
  private analytics: GameAnalytics = {
    gamesPlayed: 0,
    winRate: 0,
    avgGameLength: 0,
    strategicDecisions: {
      shopVisits: 0,
      centersCaptured: 0,
      centersLost: 0,
      emergencyHeals: 0,
    },
  };

  // Services
  private gameState = new GameState();
  private shopService = new ShopService(this.gameState);
  private movementService = new MovementService(
    this.gameState,
    this.shopService
  );
  private messageHandler?: MessageHandler;

  // Strategy adaptation
  private difficultyLevel: "high" | "middle" | "low" = "high";
  private adaptiveStrategy: boolean = true;

  constructor(
    public name: string,
    public range: number[],
    private serverUrl: string,
    private onStatusChange?: (bot: GameBot, status: string) => void
  ) {}

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
    const gameLength = Date.now() - this.gameStartTime;
    this.updateAnalytics(gameLength);
    this.setStatus("idle");

    // Log game summary
    logger.info(`[${this.name}] Game completed. Length: ${gameLength}ms`);
    this.logGameAnalytics();
  }

  private updateAnalytics(gameLength: number) {
    this.analytics.gamesPlayed++;
    this.analytics.avgGameLength =
      (this.analytics.avgGameLength * (this.analytics.gamesPlayed - 1) +
        gameLength) /
      this.analytics.gamesPlayed;
  }

  private logGameAnalytics() {
    logger.info(`[${this.name}] Analytics:`, {
      gamesPlayed: this.analytics.gamesPlayed,
      avgGameLength: `${Math.round(this.analytics.avgGameLength / 1000)}s`,
      strategicDecisions: this.analytics.strategicDecisions,
    });
  }

  private takeTurn() {
    try {
      const { bot } = this.gameState;
      if (!bot) return;

      // Priority 1: Emergency actions
      if (this.handleEmergencyActions()) {
        return;
      }

      // Priority 2: Strategic item usage
      this.handleStrategicItemUsage();

      // Priority 3: Shop decisions
      this.handleShopDecisions();

      // Priority 4: Movement with timing strategy
      this.handleMovementWithTiming();
    } catch (error) {
      logger.error(`[${this.name}] Error in takeTurn:`, error);
      // Fallback to basic turn end
      this.endTurn();
    }
  }

  private handleEmergencyActions(): boolean {
    const { bot } = this.gameState;
    if (!bot) return false;

    const criticalHpThreshold = this.gameState.maxHp * 0.15;

    if (
      bot.hp <= criticalHpThreshold &&
      this.gameState.hasItem("HEALING_POTION")
    ) {
      logger.info(`[${this.name}] Emergency healing at ${bot.hp} HP`);
      this.analytics.strategicDecisions.emergencyHeals++;

      setTimeout(() => {
        this.sendMessage({ type: "use_healing_potion", input: {} });
      }, getRandomTimeInMs(200, 500));

      return true;
    }

    return false;
  }

  private handleStrategicItemUsage() {
    if (this.shopService.shouldUseHealingPotion()) {
      setTimeout(() => {
        this.sendMessage({ type: "use_healing_potion", input: {} });
      }, getRandomTimeInMs(300, 800));
    }
  }

  private handleShopDecisions() {
    const { bot } = this.gameState;
    if (!bot) return;

    // Smart healing potion purchase
    if (this.shopService.canBuyHealingPotion()) {
      const timing = this.calculateOptimalShopTiming();

      setTimeout(() => {
        this.sendMessage({
          type: "buy_item",
          input: { item_type: "HEALING_POTION" },
        });
        this.analytics.strategicDecisions.shopVisits++;
      }, timing);
    }

    // Strategic teleport purchase
    if (this.shopService.canBuyTeleport()) {
      const timing = this.calculateOptimalShopTiming();

      setTimeout(() => {
        this.sendMessage({
          type: "buy_item",
          input: { item_type: "TELEPORT_STONE" },
        });
      }, timing);
    }
  }

  private calculateOptimalShopTiming(): number {
    const shopTiming = this.shopService.getOptimalShopTiming();

    switch (shopTiming) {
      case "immediate":
        return getRandomTimeInMs(100, 300);
      case "soon":
        return getRandomTimeInMs(300, 600);
      case "when_convenient":
        return getRandomTimeInMs(600, 1200);
      default:
        return getRandomTimeInMs(800, 1500);
    }
  }

  private handleMovementWithTiming() {
    this.gameState.logAllStates();

    const nextMove = this.movementService.getNextMove();
    console.log("nextMove", nextMove);
    if (nextMove && nextMove.length > 0) {
      // Calculate movement timing based on strategic importance
      const movementTiming = this.calculateMovementTiming(nextMove);
      console.log("movementTiming", movementTiming);
      setTimeout(() => {
        this.sendMessage({
          type: "move",
          input: { move_path: nextMove },
        });
      }, 2000);
    } else {
      // If no move is available, end turn quickly
      this.endTurn();
    }
  }

  private calculateMovementTiming(movePath: [number, number][]): number {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) {
      return getRandomTimeInMs(
        GAME_TIMES.POSITION_MIN,
        GAME_TIMES.POSITION_MAX
      );
    }

    // Base timing
    let minTime = GAME_TIMES.POSITION_MIN;
    let maxTime = GAME_TIMES.POSITION_MAX;

    // Adjust based on urgency
    const finalPosition = movePath[movePath.length - 1];
    const distanceToOpponent =
      Math.abs(finalPosition[0] - opponent.position[0]) +
      Math.abs(finalPosition[1] - opponent.position[1]);

    // If moving close to opponent (competitive scenario), move faster
    if (distanceToOpponent <= 2) {
      minTime = Math.max(200, minTime - 500);
      maxTime = Math.max(minTime + 200, maxTime - 800);
    }

    // If low HP, move more cautiously (slower)
    const hpPercent = bot.hp / this.gameState.maxHp;
    if (hpPercent < 0.3) {
      minTime += 300;
      maxTime += 600;
    }

    // If we have significant advantage, can afford to be more deliberate
    const powerAdvantage = bot.power_points - opponent.power_points;
    if (powerAdvantage > 2) {
      minTime += 200;
      maxTime += 400;
    }

    return getRandomTimeInMs(minTime, maxTime);
  }

  private endTurn() {
    const endTurnTiming = this.calculateEndTurnTiming();

    setTimeout(() => {
      this.sendMessage({ type: "end_turn", input: {} });
    }, endTurnTiming);
  }

  private calculateEndTurnTiming(): number {
    const { bot, opponent } = this.gameState;
    let minTime = GAME_TIMES.TURN_MIN;
    let maxTime = GAME_TIMES.TURN_MAX;

    if (bot && opponent) {
      // If we're in a strong position, can take more time
      const myControlledCenters = this.gameState.botOccupiedPositions.length;
      const oppControlledCenters =
        this.gameState.opponentOccupiedPositions.length;

      if (myControlledCenters > oppControlledCenters) {
        minTime += 200;
        maxTime += 500;
      }

      // If low HP, end turn quickly to avoid prolonged exposure
      const hpPercent = bot.hp / this.gameState.maxHp;
      if (hpPercent < 0.25) {
        minTime = Math.max(300, minTime - 400);
        maxTime = Math.max(minTime + 200, maxTime - 600);
      }
    }

    return getRandomTimeInMs(minTime, maxTime);
  }

  private answerQuestion() {
    // Enhanced question answering with adaptive timing
    const answerTiming = this.calculateAnswerTiming();

    setTimeout(() => {
      // Could implement smarter question answering here
      // For now, still defaulting to option 0 but with better timing
      this.sendMessage({
        type: "submit_answer",
        input: { option_idx: 0 },
      });
      this.endTurn();
    }, answerTiming);
  }

  private calculateAnswerTiming(): number {
    // Simulate thinking time based on difficulty
    const baseTime = getRandomTimeInMs(
      GAME_TIMES.ANSWER_MIN,
      GAME_TIMES.ANSWER_MAX
    );

    switch (this.difficultyLevel) {
      case "high":
        return Math.min(baseTime, getRandomTimeInMs(1000, 3000)); // Quick but thoughtful
      case "middle":
        return getRandomTimeInMs(2000, 5000); // Moderate thinking time
      case "low":
        return getRandomTimeInMs(3000, 8000); // Longer thinking time
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
      logger.info(
        `[${this.range[0]}] [${this.name}] Connected to game ${
          reconnect ? " (reconnected)" : ""
        }`
      );
      this.reconnectAttempts = 0; // Reset on successful connection
      this.gameStartTime = Date.now();
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.messageHandler?.handleMessage(message);
      } catch (err) {
        logger.error(`[${this.name}] Invalid message format`, err);
      }
    });

    this.ws.on("close", (code, reason) => {
      logger.info(`[${this.name}] WebSocket closed with code: ${code}`);

      if (code === 1012) {
        // Service restart - reconnect immediately
        this.connectToGame();
      } else if (code === 1006) {
        // Abnormal closure - attempt reconnect with backoff
        logger.error(
          `[${this.name}] Abnormal disconnection: ${code} ${reason.toString()}`
        );
        this.handleReconnectWithBackoff();
      }
    });

    this.ws.on("error", (err) => {
      logger.error(`[${this.name}] WebSocket error`, err);
    });
  }

  private handleReconnectWithBackoff() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        `[${this.name}] Max reconnection attempts reached. Giving up.`
      );
      this.setStatus("idle");
      return;
    }

    this.reconnectAttempts++;
    const backoffDelay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );

    logger.info(
      `[${this.name}] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${backoffDelay}ms`
    );

    setTimeout(() => {
      this.connectWithRetry(backoffDelay);
    }, backoffDelay);
  }

  async loginToGame(payload: { username: string; password: string }) {
    try {
      const login = await basicLogin(payload);
      this.sessionId = login.sessionId;
      this.botId = login.userId;

      this.messageHandler = new MessageHandler(
        this.gameState,
        this.shopService,
        this.botId,
        this.range,
        this.name,
        () => this.takeTurn(),
        () => this.answerQuestion(),
        () => this.endTurn(),
        () => this.onGameOver(),
        (payload: boolean) => this.connectToGame(payload),
        () => this.relogin(),
        (payload: BotStatus) => this.setStatus(payload)
      );

      this.connectToGame();
    } catch (err) {
      logger.error(`[${this.name}] Failed to connect to game`, err);
      this.setStatus("idle");
    }
  }

  async startSearching() {
    this.setStatus("searching");
    if (this.botId > 1) {
      this.connectToGame();
    } else {
      await this.loginToGame({ username: this.name, password: botPassword });
    }
  }

  private async connectWithRetry(delay = 10000) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        await this.connectToGame(true);
        logger.info(
          `[${this.name}] Connected successfully after ${
            attempts + 1
          } attempts!`
        );
        return;
      } catch (err) {
        attempts++;
        logger.error(
          `[${
            this.name
          }] Connection attempt ${attempts}/${maxAttempts} failed. ${
            attempts < maxAttempts
              ? `Retrying in ${delay / 1000}s...`
              : "Giving up."
          }`
        );

        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, delay));
          delay = Math.min(delay * 1.5, 60000); // Exponential backoff with cap
        }
      }
    }

    this.setStatus("idle");
  }

  private async relogin() {
    if (!botPassword) {
      logger.error(`[${this.name}] No password stored, cannot relogin.`);
      return;
    }
    logger.info(`[${this.name}] Session expired, attempting relogin...`);
    await this.loginToGame({ username: this.name, password: botPassword });
  }

  async startPlayingPersistent() {
    this.setStatus("playing");
    await this.loginToGame({ username: this.name, password: botPassword });
  }

  getStatus() {
    return this.status;
  }

  getAnalytics() {
    return this.analytics;
  }

  // Configuration methods for adaptive difficulty
  setDifficultyLevel(level: "high" | "middle" | "low") {
    this.difficultyLevel = level;
    logger.info(`[${this.name}] Difficulty level set to: ${level}`);
  }

  toggleAdaptiveStrategy(enabled: boolean) {
    this.adaptiveStrategy = enabled;
    logger.info(
      `[${this.name}] Adaptive strategy ${enabled ? "enabled" : "disabled"}`
    );
  }

  // Health check method
  isHealthy(): boolean {
    return (
      this.ws?.readyState === WebSocket.OPEN &&
      this.reconnectAttempts < this.maxReconnectAttempts
    );
  }
}
