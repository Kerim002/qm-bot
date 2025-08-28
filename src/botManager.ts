// // import { GameBot } from "./bot";

// import { GameBot } from "./GameBot";

// // const bots = ["red", "blue"];

// export class BotManager {
//   private bots: GameBot[] = [];

//   constructor(private wsUrl: string, private password: string) {}

//   startBots(count: number) {
//     for (let i = 0; i < count; i++) {
//       const bot = new GameBot(`Bot ${i}}`, 10, this.wsUrl, (bot, status) => {
//         console.log(`BotManager: ${i} is now ${status}`);
//       });
//       this.bots.push(bot);
//       setTimeout(
//         () => bot.loginToGame({ password: this.password, username: "bot000" }),
//         i * 100
//       );
//     }
//   }
// }

import fs from "fs";
import path from "path";

import { GameBot } from "./GameBot";
import { BOT_RANGES } from "./constants/gameConstants";

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

export class BotManager {
  private ranges: TrophyRange[] = [];

  constructor(private wsUrl: string, private password: string) {
    // this.ranges = BOT_RANGES.map((r) => ({
    //   ...r,
    //   activeNames: new Set(),
    //   bots: new Map(),
    // }));

    this.ranges = [
      {
        activeNames: new Set(),
        bots: new Map(),
        max: 0,
        min: 500,
        names: ["PixelSeeker", "KingLingo"],
      },
      {
        activeNames: new Set(),
        bots: new Map(),
        max: 12000,
        min: 11500,
        names: ["smartpro", "Cool_bird"],
      },
    ];

    this.ensurePersistFileExists();
    this.loadPersistedBots();
  }

  private ensurePersistFileExists() {
    const dir = path.dirname(PERSIST_FILE);

    // Create directory if missing
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create file if missing
    if (!fs.existsSync(PERSIST_FILE)) {
      fs.writeFileSync(PERSIST_FILE, JSON.stringify([], null, 2), "utf-8");
      console.log(`[INIT] Created empty active-bots.json at ${PERSIST_FILE}`);
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

        const bot = new GameBot(botInfo.name, this.wsUrl, (bot, status) => {
          console.log(`[${range.min}-${range.max}] ${bot.name} -> ${status}`);
          if (status === "playing") this.persistActiveBots();
          if (status === "idle") {
            range.activeNames.delete(bot.name);
            range.bots.delete(bot.name);
            this.persistActiveBots();
            setTimeout(() => this.ensureSearchingBot(range), 2000);
          }
        });

        range.bots.set(botInfo.name, bot);
        bot.startPlayingPersistent(this.password);
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

  startBots() {
    for (const range of this.ranges) {
      this.ensureSearchingBot(range);
    }
  }

  private ensureSearchingBot(range: TrophyRange) {
    const alreadySearching = Array.from(range.bots.values()).some(
      (b) => b.getStatus() === "searching"
    );
    if (alreadySearching) return;

    const username = this.getRandomAvailableName(range);
    if (!username) {
      console.log(
        `[BotManager][${range.min}-${range.max}] ⚠️ All names used, waiting...`
      );
      return;
    }

    range.activeNames.add(username);

    const bot = new GameBot(username, this.wsUrl, (bot, status) => {
      console.log(`[${range.min}-${range.max}] ${bot.name} -> ${status}`);

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
    });

    range.bots.set(username, bot);
    bot.startSearching(this.password);
  }
}
