import { GameBot } from "./bot";
import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { getSectionCenters } from "./helpers/getCenters";
import { calculateMovePath } from "./testFiles/helperFunction";
import { Player, Position } from "./testFiles/position";
import {
  getPossibleMovePaths,
  //   getPossibleMovePaths,
  getPossibleMoves,
} from "./helpers/getPossibleMoves";
import { getRandomPosition } from "./helpers/getRandomPosition";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";

// console.log(getRandomPosition(getPossibleMovePaths({ x: 0, y: 0 })));
// console.log(getPossibleMoves({ x: 0, y: 0 }));
const manager = new BotManager(WS_URL);
manager.startBots(1);

// const bot = new GameBot("BotAlpha", 1000, WS_URL, (bot, status) => {
//   console.log(`[STATUS] ${bot.name} is now ${status}`);
// });

// bot.connectToGame();

// const players: Player[] = [
//   { position: new Position(0, 0) },
//   { position: new Position(2, 2) },
// ];

// const currentPlayer = players[0];
// const opponent = players[1];
// const destination = new Position(8, 8);

// const path = calculateMovePath(currentPlayer, destination, opponent, players);
// console.log(path);
