import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { Position } from "./types/global";
// import { MovementService } from "./services/MovementService";
// import { GameState } from "./services/GameState";
// import { BoardGamePathfinder } from "./bot/BoardFindBestPlace";
// import { bestMove, BoardState } from "./tests/best-move-test";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";
const manager = new BotManager(WS_URL);
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

// const boardState = {
//   blocked: [4, 4],
//   myPos: [2, 6],
//   opponentPos: [6, 3],
//   myOP: 0,
//   opponentOP: 3,
//   myCenters: [
//     { pos: [4, 8], opSpent: 4 },
//     { pos: [7, 7], opSpent: 2 },
//   ],
//   opponentCenters: [{ pos: [8, 4], opSpent: 6 }],
// };

// const pathfinder = new BoardGamePathfinder();

// const board = pathfinder.convertArrayBoard(boardState);
// const bestPath = pathfinder.getBestPath(board);

// console.log("bestpath", bestPath);
