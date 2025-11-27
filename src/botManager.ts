import fs from "fs";
import path from "path";
import { GameBot } from "./GameBot";
import logger from "./utils/logger";
import { BOT_RANGES } from "./constants/gameConstants";
// import { GameBot } from "./tests/test-game-bot";

type TrophyRange = {
  min: number;
  max: number;
  names: string[];
  activeNames: Set<string>;
  bots: Map<string, GameBot>;
};

const DEFAULT_PATH = "/app/data/active-bots.json";
const FILE = process.env.ACTIVE_BOTS_FILE || DEFAULT_PATH;
const DEV_PATH = path.join(__dirname, "./data/active-bots.json");
export const PERSIST_FILE =
  process.env.NODE_ENV === "production" ? FILE : DEV_PATH;

// console.log(PERSIST_FILE);
export class BotManager {
  private ranges: TrophyRange[] = [];

  constructor(private wsUrl: string) {
    this.ranges = BOT_RANGES.map((r) => ({
      ...r,
      activeNames: new Set(),
      bots: new Map(),
    }));

    // this.ranges = [
    //   // {
    //   //   min: 0,
    //   //   max: 500,
    //   //   names: ["Grace_miller"],
    //   //   activeNames: new Set(),
    //   //   bots: new Map(),
    //   // },
    //   // {
    //   //   min: 11000,
    //   //   max: 11500,
    //   //   names: ["MARKJACKSON"],
    //   //   activeNames: new Set(),
    //   //   bots: new Map(),
    //   // },
    //   // {
    //   //   min: 11000,
    //   //   max: 11500,
    //   //   names: ["kerim"],
    //   //   activeNames: new Set(),
    //   //   bots: new Map(),
    //   // },
    // ];

    this.ensurePersistFileExists();
    this.loadPersistedBots();
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private ensurePersistFileExists() {
    const dir = path.dirname(PERSIST_FILE);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create file if missing
    if (!fs.existsSync(PERSIST_FILE)) {
      fs.writeFileSync(PERSIST_FILE, JSON.stringify([], null, 2), "utf-8");
      logger.info(`[INIT] Created empty active-bots.json at ${PERSIST_FILE}`);
    }
  }

  private persistActiveBots() {
    const active: { name: string; rangeMin: number; rangeMax: number }[] = [];

    for (const range of this.ranges) {
      for (const bot of range.bots.values()) {
        if (bot.getStatus() === "playing") {
          active.push({
            name: bot.name,
            rangeMin: range.min,
            rangeMax: range.max,
          });
        }
      }
    }

    fs.writeFileSync(PERSIST_FILE, JSON.stringify(active, null, 2), "utf-8");
  }

  private loadPersistedBots() {
    if (!fs.existsSync(PERSIST_FILE)) return;

    try {
      const data = fs.readFileSync(PERSIST_FILE, "utf-8");
      const activeBots: { name: string; rangeMin: number; rangeMax: number }[] =
        JSON.parse(data);

      for (const botInfo of activeBots) {
        const range = this.ranges.find(
          (r) => r.min === botInfo.rangeMin && r.max === botInfo.rangeMax
        );

        if (!range) continue;

        range.activeNames.add(botInfo.name);

        const bot = new GameBot(
          botInfo.name,
          [range.min, range.max],
          this.wsUrl,
          (bot, status) => {
            // console.log(`[${range.min}-${range.max}] ${bot.name} -> ${status}`);
            if (status === "playing") this.persistActiveBots();
            if (status === "idle") {
              range.activeNames.delete(bot.name);
              range.bots.delete(bot.name);
              this.persistActiveBots();
              setTimeout(() => this.ensureSearchingBot(range), 2000);
            }
          }
        );

        range.bots.set(botInfo.name, bot);
        bot.startPlayingPersistent();
      }
    } catch (err) {
      console.error("Failed to load persisted bots:", err);
    }
  }

  private getRandomAvailableName(range: TrophyRange): string | null {
    const available = range.names.filter((n) => !range.activeNames.has(n));
    if (available.length === 0) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }

  async startBots() {
    for (const range of this.ranges) {
      this.ensureSearchingBot(range);
      await this.sleep(200);
    }
  }

  private ensureSearchingBot(range: TrophyRange) {
    const alreadySearching = Array.from(range.bots.values()).some(
      (b) => b.getStatus() === "searching"
    );
    if (alreadySearching) return;

    const username = this.getRandomAvailableName(range);
    if (!username) {
      logger.warn(
        `[BotManager][${range.min}-${range.max}] ⚠️ All names used, waiting...`
      );
      return;
    }

    range.activeNames.add(username);

    const bot = new GameBot(
      username,
      [range.min, range.max],
      this.wsUrl,
      (bot, status) => {
        // console.log(`[${range.min}-${range.max}] ${bot.name} -> ${status}`);

        if (status === "playing") {
          this.persistActiveBots();
          this.ensureSearchingBot(range);
        }

        if (status === "idle") {
          range.activeNames.delete(bot.name);
          range.bots.delete(bot.name);
          this.persistActiveBots();
          setTimeout(() => this.ensureSearchingBot(range), 2000);
        }
      }
    );

    range.bots.set(username, bot);
    bot.startSearching();
  }
}
