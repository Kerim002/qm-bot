import WebSocket from "ws";
import { guestLogin } from "./auth/authenticateBot";
import { PlayerSchema, WSMessage } from "./types/game";
import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
import { findShortestPath } from "./helpers/findShortestPath";

const ocupationCenters = [
  [1, 1],
  [4, 0],
  [7, 1],
  [8, 4],
  [7, 7],
  [4, 8],
  [1, 7],
  [0, 4],
];
export class GameBot {
  private ws?: WebSocket;
  private status: "idle" | "searching" | "playing" = "idle";
  private sessionId: string = "";
  private botId: number = -1;
  private bot?: PlayerSchema = undefined;
  private opponent?: PlayerSchema = undefined;
  private botOccupiedPositions = [] as [number, number][];
  private opponentOccupiedPositions = [] as [number, number][];

  constructor(
    public name: string,
    public rank: number,
    private serverUrl: string,
    private onStatusChange?: (bot: GameBot, status: string) => void
  ) {}

  private setStatus(status: "idle" | "searching" | "playing") {
    this.status = status;
    this.onStatusChange?.(this, status);
  }

  private sendMessage(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn(`[${this.name}] Cannot send, WebSocket not open`);
    }
  }

  private pathfinder = new BoardGamePathfinder();

  private handleGameMessage(message: WSMessage) {
    switch (message.type) {
      case "player_joined":
        console.log("player joined");
        break;

      case "game_started": {
        // console.table(message.output.players);
        const bot = message.output.players.find((p) => p.id === this.botId);
        const opponent = message.output.players.find(
          (p) => p.id !== this.botId
        );

        if (bot) this.bot = bot;
        if (opponent) this.opponent = opponent;
        break;
      }
      case "round_started": {
        const bot = message.output.players.find((p) => p.id === this.botId);
        const opponent = message.output.players.find(
          (p) => p.id !== this.botId
        );
        console.log("round statered");

        if (bot) this.bot = bot;
        if (opponent) this.opponent = opponent;
        break;
      }
      case "turn_started":
        if (message.output.player_id === this.botId) {
          this.takeTurn();
        } else {
          console.log(`[${this.name}] Not my turn`);
        }
        break;

      case "question_asked":
        console.log("question asked");
        console.table(message.output);
        if (message.output.player_id === this.botId) {
          this.answerQuestion(message.output);
        }
        break;

      case "answer_result":
        console.log("answer result", message);
        console.table(message.output);
        break;

      case "player_moved":
        const movedPosition = message.output.move_path;
        const lastPos = movedPosition[movedPosition.length - 1];

        const isOccupationCenter = ocupationCenters.some(
          ([x, y]) => x === lastPos[0] && y === lastPos[1]
        );

        if (message.output.player_id === this.botId) {
          // BOT movement
          if (this.bot) {
            this.bot.position = lastPos;

            if (isOccupationCenter) {
              this.opponentOccupiedPositions =
                this.opponentOccupiedPositions.filter(
                  ([ox, oy]) => !(ox === lastPos[0] && oy === lastPos[1])
                );

              const alreadyInBot = this.botOccupiedPositions.some(
                ([bx, by]) => bx === lastPos[0] && by === lastPos[1]
              );

              if (!alreadyInBot) {
                this.botOccupiedPositions = [
                  ...this.botOccupiedPositions,
                  lastPos,
                ];
              }
            }
          }
        } else {
          // OPPONENT movement
          if (this.opponent) {
            this.opponent.position = lastPos;

            if (isOccupationCenter) {
              // Remove from bot's occupied list
              this.botOccupiedPositions = this.botOccupiedPositions.filter(
                ([bx, by]) => !(bx === lastPos[0] && by === lastPos[1])
              );

              // Add only if not already in opponent's list
              const alreadyInOpponent = this.opponentOccupiedPositions.some(
                ([ox, oy]) => ox === lastPos[0] && oy === lastPos[1]
              );

              if (!alreadyInOpponent) {
                this.opponentOccupiedPositions = [
                  ...this.opponentOccupiedPositions,
                  lastPos,
                ];
              }
            }
          }
        }

        console.log(`[${this.name}] Moved:`, movedPosition);
        break;
      case "zone_occupation_attempted":
        console.log(`[${this.name}] Moved:`, message.output);
        break;

      case "game_over":
        console.log(
          `[${this.name}] Game over. Winner: ${message.output.winner}`
        );
        this.reconnectGame();

        break;

      case "player_disconnected":
      // this.reconnectGame();

      default:
        console.log(`[${this.name}] Unhandled message type: ${message}`);
        console.table(message);
        break;
    }
  }

  private takeTurn() {
    const arrayBoard = {
      blocked: [4, 4] as [number, number],
      myPos: this.bot?.position as [number, number],
      opponentPos: this.opponent?.position as [number, number],
      myOP: this.bot?.power_points ?? 0,
      opponentOP: this.bot?.power_points ?? 0,
      myCenters: this.botOccupiedPositions as [number, number][],
      opponentCenters: this.opponentOccupiedPositions as [number, number][],
      centers: new Set([
        "1,1",
        "4,0",
        "7,1",
        "8,4",
        "7,7",
        "4,8",
        "1,7",
        "0,4",
      ]),
      level: "high" as "high" | "middle" | "low",
    };

    // console.log("take turn object id" + this.bot?.id);
    if (this.bot) {
      const board = this.pathfinder.convertArrayBoard(arrayBoard);
      const bestPath = this.pathfinder.getBestPath(board);
      if (bestPath) {
        console.log(bestPath[bestPath.length - 1]);
        const shortestMove = findShortestPath(this.bot.position, [
          bestPath[bestPath.length - 1].x,
          bestPath[bestPath.length - 1].y,
        ]);
        this.sendMessage({
          type: "move",
          input: { move_path: shortestMove },
        });
      }

      // Send end turn after short delay
      setTimeout(() => {
        this.sendMessage({ type: "end_turn", input: {} });
      }, 3000);
    }
  }

  private answerQuestion(question: any) {
    const randomOption = Math.floor(Math.random() * 3);

    console.log(
      `[${this.name}] Answering question with option #${randomOption}`
    );

    console.log("send option id", randomOption);

    this.sendMessage({
      type: "submit_answer",
      input: { option_idx: 2 },
    });
  }

  private async connectToGame() {
    this.ws = new WebSocket(this.serverUrl + "/ws/game", {
      headers: {
        authorization: `Session ${this.sessionId}`,
      },
    });

    this.ws.on("open", () => {
      console.log(`[${this.name}] Connected to game`);
      this.setStatus("playing");
    });

    this.ws.on("message", (data) => {
      const raw = data.toString();
      try {
        const message = JSON.parse(raw);
        this.handleGameMessage(message);
      } catch (err) {
        console.error(`[${this.name}] Invalid message format`, err);
      }
    });

    this.ws.on("close", (code, reason) => {
      console.log(`[${this.name}] Disconnected: ${code} ${reason.toString()}`);
      this.reconnectGame();
    });

    this.ws.on("error", (err) => {
      console.error(`[${this.name}] WebSocket error`, err);
    });
  }

  private reconnectGame() {
    this.bot = undefined;
    this.opponent = undefined;
    this.botOccupiedPositions = [];
    this.opponentOccupiedPositions = [];
    this.setStatus("idle");
    setTimeout(() => {
      this.connectToGame();
    }, 5000);
  }

  async loginToGame() {
    try {
      const deviceId = `bot-${this.name}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const login = await guestLogin(deviceId);
      this.sessionId = login.sessionId;
      this.botId = login.userId;
      this.connectToGame();
    } catch (err) {
      console.error(`[${this.name}] Failed to connect to game`, err);
    }
  }
}
