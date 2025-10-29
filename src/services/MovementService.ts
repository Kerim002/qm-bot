import { GameState } from "./GameState";
import { ShopService } from "./ShopService";
import { BoardGamePathfinder } from "../bot/BoardFindBestPlace";
import { findShortestPath } from "../helpers/findShortestPath";
import { getBestShopMove } from "../helpers/bestShopPath";
import { getOpponentBlockedArea } from "../helpers/getOpponentBlockedArea";

export class MovementService {
  private pathfinder = new BoardGamePathfinder();

  constructor(private gameState: GameState, private shopService: ShopService) {}

  getNextMove(): [number, number][] | null {
    const { bot, opponent } = this.gameState;
    if (!bot || !opponent) return null;

    if (this.shopService.shouldGoToShop()) {
      const bestPathToShop = getBestShopMove(bot.position, opponent.position);
      if (bestPathToShop) {
        const opponentBlockedArea = getOpponentBlockedArea({
          x: opponent.position[0],
          y: opponent.position[1],
        });
        const shortestPath = findShortestPath(
          { x: bot.position[0], y: bot.position[1] },
          { x: bestPathToShop[0], y: bestPathToShop[1] },
          ["4,4"],
          opponentBlockedArea
        );

        return shortestPath !== null
          ? shortestPath.map(({ x, y }) => [x, y])
          : null;
      }
    }

    const boardState = {
      blocked: [4, 4] as [number, number],
      myPos: bot.position,
      opponentPos: opponent.position,
      myOP: bot.power_points,
      opponentOP: opponent.power_points,
      myCenters: this.gameState.botOccupiedPositions,
      opponentCenters: this.gameState.opponentOccupiedPositions,
      level: "high" as "high" | "middle" | "low",
    };

    const board = this.pathfinder.convertArrayBoard(boardState);
    const bestPath = this.pathfinder.getBestPath(board);

    // console.log("bestpath", bestPath);

    if (bestPath && bestPath.length > 0) {
      // const target = bestPath[bestPath.length - 1];
      // return findShortestPath(bot.position, [target.x, target.y]);

      return bestPath.map(({ x, y }) => [x, y]);
    }

    return null;
  }
}
