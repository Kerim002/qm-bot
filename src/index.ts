import { BotManager } from "./botManager";
import dotenv from "dotenv";
import { ZoneSchema } from "./types/game";
import { OCCUPATION_CENTERS } from "./constants/gameConstants";
import { filterZones } from "./helpers/filterZones";

dotenv.config();

const WS_URL = process.env.WS_URL || "ws://localhost:8000/ws";
const botPassword = process.env.BOT_PASSWORD || "test";
const manager = new BotManager(WS_URL, botPassword);
manager.startBots(1);
