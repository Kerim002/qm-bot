// TestGameBot.ts
export class TestGameBot {
  private status: "idle" | "searching" | "playing" = "idle";
  private searchTimeout?: NodeJS.Timeout;
  private playTimeout?: NodeJS.Timeout;

  constructor(
    public name: string,
    private onStatusChange?: (bot: TestGameBot, status: string) => void
  ) {}

  private setStatus(status: "idle" | "searching" | "playing") {
    this.status = status;
    console.log(`[${this.name}] status -> ${status}`);
    this.onStatusChange?.(this, status);
  }

  /** Simulate starting the search */
  startSearching() {
    if (this.status !== "idle") return;
    this.setStatus("searching");

    const searchDuration = 10_000 + Math.random() * 10_000; // 10–30 sec
    this.searchTimeout = setTimeout(() => {
      this.startPlaying();
    }, searchDuration);
  }

  /** Simulate finding a game */
  private startPlaying() {
    this.setStatus("playing");

    this.playTimeout = setTimeout(() => {
      this.finishGame();
    }, 20_000); // play for 30 sec
  }

  /** Simulate finishing a game */
  private finishGame() {
    this.setStatus("idle");
  }

  startPlayingPersistent() {
    if (this.status !== "idle") return;
    this.setStatus("playing");
    this.playTimeout = setTimeout(() => this.finishGame(), 30_000);
  }

  /** Clear timeouts (cleanup) */
  stop() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (this.playTimeout) clearTimeout(this.playTimeout);
    this.setStatus("idle");
  }

  getStatus() {
    return this.status;
  }
}
