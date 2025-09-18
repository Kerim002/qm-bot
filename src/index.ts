import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { OccupiedPosition, PlayerSchema, ShopItemSchema } from "./types/game";
import { GameState } from "./services/GameState";
import { ShopService } from "./services/ShopService";
import { MovementService } from "./services/MovementService";

// import { MovementService } from "./services/MovementService";
// import { GameState } from "./services/GameState";
// import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
// import { bestMove, BoardState } from "./tests/best-move-test";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";
const manager = new BotManager(WS_URL);
manager.startBots();

// const boardState = {
//   blocked: [4, 4],
//   myPos: [1, 4],
//   opponentPos: [3, 5],
//   myOP: 3,
//   opponentOP: 3,
//   myCenters: [
//     { pos: [4, 0], opSpent: 4 },
//     { pos: [7, 1], opSpent: 6 },
//     { pos: [8, 4], opSpent: 6 },
//     { pos: [7, 1], opSpent: 4 },
//   ],
//   opponentCenters: [
//     { pos: [0, 4], opSpent: 6 },
//     { pos: [4, 8], opSpent: 8 },
//   ],
// };

// const pathfinder = new BoardGamePathfinder();

// const board = pathfinder.convertArrayBoard(boardState);
// const bestPath = pathfinder.getBestPath(board);
// console.log("bestpath", bestPath);

// const bot: PlayerSchema = {
//   coins: 220,
//   hp: 37,
//   id: 1,
//   name: "bot",
//   position: [7, 7],
//   power_points: 3,
// };

// const opponent: PlayerSchema = {
//   coins: 185,
//   hp: 38,
//   id: 2,
//   name: "user",
//   position: [4, 7],
//   power_points: 0,
// };

// const shopItems: {
//   [key: string]: ShopItemSchema;
// } = {
//   HEALING_POTION: {
//     description: "",
//     name: "",
//     price: 5,
//   },
// };

// const botOccupiedPosition: OccupiedPosition[] = [
//   { pos: [4, 0], opSpent: 8 },
//   { pos: [7, 1], opSpent: 6 },
//   { pos: [7, 7], opSpent: 6 },
// ];
// const opponentOccupiedPosition: OccupiedPosition[] = [
//   { pos: [8, 4], opSpent: 6 },
//   { pos: [4, 8], opSpent: 8 },
//   { pos: [1, 1], opSpent: 2 },
//   //   { pos: [1, 7], opSpent: 6 },
// ];
// const gameState = new GameState({
//   bot: bot,
//   botOccupiedPositions: botOccupiedPosition,
//   inventory: [],
//   maxHp: 100,
//   opponent: opponent,
//   opponentOccupiedPositions: opponentOccupiedPosition,
//   shopItems: shopItems,
// });

// const shopService = new ShopService(gameState);

// const movementService = new MovementService(gameState, shopService);

// console.log(movementService.getNextMove());
