import WebSocket from "ws";
import { guestLogin } from "./authenticateBot";
import { PlayerSchema, WSMessage } from "./types/game";
import { getRandomPosition } from "./helpers/getRandomPosition";
import { getPossibleMovePaths } from "./helpers/getPossibleMoves";
// import { getPossibleMoves } from "./helpers/getPossibleMoves";

// const testArray = [
//   [
//     {
//       x: 0,
//       y: 0,
//       isOccupied: false,
//       isOcuppationCenter: false,
//       hasOwner: null,
//       occupied:null
//     },
//   ],
// ];

const centers = [
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

  private handleGameMessage(message: WSMessage) {
    switch (message.type) {
      case "player_joined":
        break;

      case "game_started": {
        // console.table(message.output.players);
        const bot = message.output.players.find((p) => p.id === this.botId);
        const opponent = message.output.players.find(
          (p) => p.id !== this.botId
        );
        // console.log("bot id " + this.botId);
        // console.log("players");
        // console.table(message.output.players[0]);
        // console.table(message.output.players[1]);
        // console.log("Bot table");
        // console.table(bot);
        // console.log("opponent table");
        // console.table(opponent);
        if (bot) this.bot = bot;
        if (opponent) this.opponent = opponent;
        break;
      }
      case "round_started": {
        // console.log(`[${this.name}] Game started`);
        // console.table(message.output.players[0]);
        // console.table(message.output.players[1]);
        const bot = message.output.players.find((p) => p.id === this.botId);
        const opponent = message.output.players.find(
          (p) => p.id !== this.botId
        );
        // console.log(`oponnent bot id`, opponent?.id);
        // console.log(`[${this.name}] bot id`, bot?.id);
        if (bot) this.bot = bot;
        if (opponent) this.opponent = opponent;
        break;
      }
      case "turn_started":
        // console.log(this.botId + "==" + message.output.player_id);
        if (message.output.player_id === this.botId) {
          // console.log(`[${this.name}] My turn!`);
          // console.log("bot id", this.botId);
          // console.log("message id", message.output.player_id);
          this.takeTurn();
        } else {
          console.log(`[${this.name}] Not my turn`);
        }
        break;

      case "question_asked":
        if (message.output.player_id === this.botId) {
          this.answerQuestion(message.output);
        }
        break;

      case "answer_result":
        console.log(
          `[${this.name}] Answer result:`,
          message.input.is_correct ? "Correct" : "Wrong"
        );
        break;

      case "player_moved":
        console.log(`[${this.name}] Moved:`, message.output.move_path);
        break;

      case "zone_occupied":
        console.log(`[${this.name}] Moved:`, message.output);
        break;

      case "game_over":
        console.log(
          `[${this.name}] Game over. Winner: ${message.output.winner}`
        );
        this.setStatus("idle");
        break;

      default:
        console.log(`[${this.name}] Unhandled message type: ${message}`);
        console.table(message);
        break;
    }
  }

  private takeTurn() {
    // console.log("take turn object id" + this.bot?.id);
    if (this.bot) {
      const movePath = getRandomPosition(
        getPossibleMovePaths({
          x: this.bot.position[0],
          y: this.bot.position[1],
        })
      );

      console.log("take turn id" + this.botId);
      console.log(movePath);

      this.sendMessage({
        type: "move",
        input: { move_path: movePath },
      });

      // Send end turn after short delay
      setTimeout(() => {
        this.sendMessage({ type: "end_turn", input: {} });
      }, 3000);
    }
  }

  private answerQuestion(question: any) {
    const randomOption = Math.floor(Math.random() * question.options.length);
    console.log(
      `[${this.name}] Answering question with option #${randomOption}`
    );

    this.sendMessage({
      type: "submit_answer",
      input: { option: randomOption },
    });
  }

  async connectToGame() {
    try {
      const deviceId = `bot-${this.name}-${Math.random()
        .toString(36)
        .slice(2)}`;
      const login = await guestLogin(deviceId);
      this.sessionId = login.sessionId;
      this.botId = login.userId;

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
        console.log(
          `[${this.name}] Disconnected: ${code} ${reason.toString()}`
        );
        this.setStatus("idle");
      });

      this.ws.on("error", (err) => {
        console.error(`[${this.name}] WebSocket error`, err);
      });
    } catch (err) {
      console.error(`[${this.name}] Failed to connect to game`, err);
    }
  }
}
