import { BotManager } from "./botManager";
import BoardGamePathfinder from "./testFiles/BoardFindBestPlace";
import dotenv from "dotenv";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";

// const manager = new BotManager(WS_URL);
// manager.startBots(1);

const pathfinder = new BoardGamePathfinder();
//red
const arrayBoard = {
  blocked: [4, 4] as [number, number],
  myPos: [7, 7] as [number, number],
  opponentPos: [4, 7] as [number, number],
  myOP: 0,
  opponentOP: 3,
  myCenters: [
    [7, 1],
    [8, 4],
    [7, 7],
  ] as [number, number][],
  opponentCenters: [
    [4, 8],
    [1, 7],
  ] as [number, number][],
  centers: new Set(["1,1", "4,0", "7,1", "8,4", "7,7", "4,8", "1,7", "0,4"]),
  level: "high" as "high" | "middle" | "low",
};

const board = pathfinder.convertArrayBoard(arrayBoard);
// console.log(board);
const bestPath = pathfinder.getBestPath(board);
console.log(bestPath);
