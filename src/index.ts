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
  myPos: [1, 3] as [number, number],
  opponentPos: [0, 4] as [number, number],
  myOP: 0,
  opponentOP: 0,
  myCenters: [
    [4, 0],
    [1, 1],
  ] as [number, number][],
  opponentCenters: [
    [1, 1],
    [1, 7],
    [0, 4],
  ] as [number, number][],
  centers: new Set(["1,1", "4,0", "7,1", "8,4", "7,7", "4,8", "1,7", "0,4"]),
};

const board = pathfinder.convertArrayBoard(arrayBoard);
// console.log(board);
const bestPath = pathfinder.getBestPath(board);
console.log(bestPath);
