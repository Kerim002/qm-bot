import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { findShortestPath } from "./helpers/findShortestPath";
import { getBestShopMove } from "./helpers/bestShopPath";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";

const manager = new BotManager(WS_URL);
manager.startBots(1);

// Example usage:

// const bestMove = getBestShopMove([1, 5], [4, 3]);

// console.log(bestMove);

// console.log(findShortestPath([5, 3], [4, 5]));
