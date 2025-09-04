import { BotManager } from "./botManager";
import dotenv from "dotenv";
// import { MovementService } from "./services/MovementService";
// import { GameState } from "./services/GameState";
// import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
// import { bestMove, BoardState } from "./tests/best-move-test";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";
const botPassword = process.env.BOT_PASSWORD || "test";
const manager = new BotManager(WS_URL, botPassword);
manager.startBots();

// const boardState: BoardState = {
//   blocked: [4, 4],
//   myPos: [4, 8],
//   opponentPos: [2, 1],
//   mycurrentOP: 0,
//   opponentCurrentOP: 3,
//   myCenters: [
//     { position: { x: 1, y: 7 }, spendedOp: 4 },
//     { position: { x: 7, y: 7 }, spendedOp: 6 },
//     { position: { x: 7, y: 1 }, spendedOp: 6 },
//   ],
//   opponentCenters: [
//     { position: { x: 4, y: 8 }, spendedOp: 5 },
//     { position: { x: 8, y: 4 }, spendedOp: 10 },
//   ],
//   level: "easy",
//   health: 300,
//   inventory: [],
//   positionsHistory: [],
//   totalCoin: 5,
// };

// console.log(bestMove(boardState));

// const boardState = {
//   blocked: [4, 4],
//   myPos: [6, 6],
//   opponentPos: [2, 1],
//   myOP: 4,
//   opponentOP: 3,
//   myCenters: [
//     { pos: [1, 7], opSpent: 4 },
//     { pos: [7, 7], opSpent: 6 },
//     { pos: [7, 1], opSpent: 6 },
//   ],
//   opponentCenters: [
//     { pos: [4, 8], opSpent: 4 },
//     { pos: [8, 4], opSpent: 7 },
//   ],
// };

// const historyRed = [
//   [3, 5],
//   [4, 7],
//   [7, 7],
//   [7, 4],
// ];
// const historyBlue = [
//   [5, 3],
//   [5, 0],
//   [4, 0],
//   [1, 0],
// ];
// const boardState = {
//   blocked: [4, 4],
//   myPos: [4, 7],
//   opponentPos: [5, 3],
//   myOP: 8,
//   opponentOP: 3,
//   myCenters: [
//     // { pos: [7, 1], opSpent: 4 },
//     // { pos: [4, 0], opSpent: 4 },
//   ],
//   opponentCenters: [
//     // { pos: [8, 4], opSpent: 4 },
//     // { pos: [7, 7], opSpent: 4 },
//     // { pos: [4, 8], opSpent: 2 },
//   ],
// };

// const pathfinder = new BoardGamePathfinder();

// const board = pathfinder.convertArrayBoard(boardState);
// const bestPath = pathfinder.getBestPath(board);

// console.log(bestPath);
