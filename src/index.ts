import { BotManager } from "./botManager";
import dotenv from "dotenv";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";
const botPassword = process.env.BOT_PASSWORD || "test";
const manager = new BotManager(WS_URL, botPassword);
manager.startBots();

// const testManager = new TestBotManager();

// testManager.startBots();
