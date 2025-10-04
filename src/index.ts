import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { OccupiedPosition, PlayerSchema, ShopItemSchema } from "./types/game";
import { GameState } from "./services/GameState";
import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
// import { ShopService } from "./tests/test-shop-service";
// import { MovementService } from "./tests/test-movement-service";

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
//   myPos: [2, 5],
//   opponentPos: [4, 8],
//   myOP: 10,
//   opponentOP: 3,
//   myCenters: [{ pos: [1, 1], opSpent: 9 }],
//   opponentCenters: [
//     { pos: [0, 4], opSpent: 1 },
//     { pos: [4, 0], opSpent: 4 },
//     { pos: [7, 2], opSpent: 4 },
//     { pos: [7, 7], opSpent: 6 },
//     { pos: [4, 8], opSpent: 4 },
//   ],
// };

// const pathfinder = new BoardGamePathfinder();

// const board = pathfinder.convertArrayBoard(boardState);
// const bestPath = pathfinder.getBestPath(board);
// console.log("bestpath", bestPath);

// new ai

// const bot: PlayerSchema = {
//   coins: 150,
//   hp: 10,
//   id: 1,
//   name: "bot",
//   position: [3, 3],
//   power_points: 6,
// };

// const opponent: PlayerSchema = {
//   coins: 180,
//   hp: 9,
//   id: 2,
//   name: "user",
//   position: [5, 5],
//   power_points: 6,
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
//   { pos: [8, 4], opSpent: 6 },
//   { pos: [7, 1], opSpent: 6 },
// ];
// const opponentOccupiedPosition: OccupiedPosition[] = [
//   { pos: [1, 7], opSpent: 10 },
//   { pos: [4, 0], opSpent: 6 },
//   { pos: [0, 4], opSpent: 6 },
//   { pos: [1, 1], opSpent: 6 },
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
