import { GameState } from "../src/services/GameState";
import { MovementService } from "../src/services/MovementService";
import { ShopService } from "../src/services/ShopService";
import { PlayerSchema, OccupiedPosition } from "../src/types/game";

describe("MovementService", () => {
  let gameState: GameState;
  let shopService: ShopService;
  let movementService: MovementService;

  beforeEach(() => {
    gameState = new GameState();

    // mock players
    const bot: PlayerSchema = {
      id: 12,
      name: "red",
      position: [2, 3] as [number, number],
      hp: 300,
      coins: 0,
      power_points: 0,
    };

    const opponent: PlayerSchema = {
      id: 15,
      name: "blue",
      position: [4, 5],
      hp: 300,
      coins: 0,
      power_points: 0,
    };

    gameState.updatePlayers([bot, opponent], bot.id);

    // mock occupied centers
    const botCenters: OccupiedPosition[] = [];
    const opponentCenters: OccupiedPosition[] = [];

    gameState.botOccupiedPositions = botCenters;
    gameState.opponentOccupiedPositions = opponentCenters;

    shopService = new ShopService(gameState);
    movementService = new MovementService(gameState, shopService);
  });

  it("should find a path to the best move", () => {
    const path = movementService.getNextMove();
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });

  it("should prioritize shop if ShopService says so", () => {
    // force shop mode
    jest.spyOn(shopService, "shouldGoToShop").mockReturnValue(true);

    const path = movementService.getNextMove();
    expect(path).not.toBeNull();
    expect(path![0]).toEqual([0, 0]); // starts from bot position
  });

  it("should return null if bot or opponent missing", () => {
    gameState.bot = undefined;
    const path = movementService.getNextMove();
    expect(path).toBeNull();
  });
});
