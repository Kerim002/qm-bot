// import { GameBot } from "./bot";

import { GameBot } from "./GameBot";

// const bots = ["red", "blue"];

const botNames = [
  "bot1000",
  "bot2000",
  "bot3000",
  "bot4000",
  "bot5000",
  "bot6000",
  "bot7000",
  "bot8000",
  "bot9000",
  "bot10000",
  "bot11000",
  "bot12000",
];

export class BotManager {
  private bots: GameBot[] = [];

  constructor(private wsUrl: string, private password: string) {}

  startBots(count: number) {
    for (let i = 0; i < count; i++) {
      const bot = new GameBot(`Bot ${i}}`, 10, this.wsUrl, (bot, status) => {
        console.log(`BotManager: ${i} is now ${status}`);
      });
      this.bots.push(bot);
      setTimeout(
        () => bot.loginToGame({ password: this.password, username: "bot1000" }),
        i * 100
      );
    }
  }
}
