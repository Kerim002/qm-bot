import { BotManager } from "./botManager";
import dotenv from "dotenv";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";

// const manager = new BotManager(WS_URL);
// manager.startBots(1);
