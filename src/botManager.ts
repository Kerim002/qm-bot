import { GameBot } from "./bot";

// const bots = ["red", "blue"];

export class BotManager {
  private bots: GameBot[] = [];

  constructor(private wsUrl: string) {}

  startBots(count: number) {
    for (let i = 0; i < count; i++) {
      const bot = new GameBot(`Bot ${i}}`, 10, this.wsUrl, (bot, status) => {
        // console.log(`BotManager: ${i} is now ${status}`);
      });
      this.bots.push(bot);
      // bot.connectToGame();
      setTimeout(() => bot.loginToGame(), i * 100);
    }
  }
}
