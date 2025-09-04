// import { CenterEvaluation, Position } from "../types/global";

// // Fixed addRandomness.ts
// export function addRandomness(
//   score: number,
//   randomnessFactor: number // Changed from level string to direct factor
// ): number {
//   if (randomnessFactor <= 0) return score;
//   const randomMultiplier = 1 + (Math.random() - 0.5) * randomnessFactor;
//   return score * randomMultiplier;
// }

// // Fixed calculateDistance.ts (unchanged - this was correct)

// export function calculateDistance(pos1: Position, pos2: Position): number {
//   return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
// }

// export function evaluateCenter(
//   centerPos: Position,
//   myCurrentOP: number,
//   opponentCenters: Array<{
//     spendedOp: number;
//     position: { x: number; y: number };
//   }>, // Fixed structure
//   myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>, // Fixed structure
//   level: "easy" | "mid" | "hard" | "super" | "ultra" = "hard" // Updated levels
// ): CenterEvaluation {
//   // Check if I already own this center
//   const myOwned = myCenters.find((c) => positionsEqual(c.position, centerPos));
//   if (myOwned) {
//     const remainingCapacity = 10 - myOwned.spendedOp;
//     return { priority: 0, type: "owned", requiredPoints: remainingCapacity };
//   }

//   // Check if opponent owns the center
//   const opponentOwned = opponentCenters.find((c) =>
//     positionsEqual(c.position, centerPos)
//   );
//   if (opponentOwned) {
//     let priority = 150;
//     let requiredPoints = opponentOwned.spendedOp + 1;

//     switch (level) {
//       case "ultra":
//         priority = 300;
//         break;
//       case "super":
//         priority = 250;
//         break;
//       case "hard":
//         priority = 200;
//         break;
//       case "mid":
//         priority = 150;
//         break;
//       case "easy":
//         priority = 100;
//         requiredPoints = opponentOwned.spendedOp + 2;
//         break;
//     }

//     return {
//       priority,
//       type: "recapture",
//       requiredPoints,
//     };
//   }

//   // Free center to capture
//   let priority = 100;
//   switch (level) {
//     case "ultra":
//       priority = 160;
//       break;
//     case "super":
//       priority = 140;
//       break;
//     case "hard":
//       priority = 120;
//       break;
//     case "mid":
//       priority = 100;
//       break;
//     case "easy":
//       priority = 80;
//       break;
//   }

//   return {
//     priority,
//     type: "capture",
//     requiredPoints: 1,
//   };
// }

// // Fixed getAdjacentPositions.ts

// export function isValidPosition(pos: Position): boolean {
//   return pos.x >= 0 && pos.x <= 8 && pos.y >= 0 && pos.y <= 8;
// }

// export function getAdjacentPositions(pos: Position): Position[] {
//   const adjacent: Position[] = [];
//   const directions: Position[] = [
//     { x: 0, y: 1 },
//     { x: 1, y: 0 },
//     { x: 0, y: -1 },
//     { x: -1, y: 0 },
//   ];

//   for (const direction of directions) {
//     const newX = pos.x + direction.x;
//     const newY = pos.y + direction.y;
//     if (isValidPosition({ x: newX, y: newY })) {
//       adjacent.push({ x: newX, y: newY });
//     }
//   }

//   return adjacent;
// }

// // Updated getLevelMultipliers.ts (deprecated - now handled by AI level configs)
// export function getLevelMultipliers(
//   level: "easy" | "mid" | "hard" | "super" | "ultra" = "hard"
// ): {
//   aggression: number;
//   riskTaking: number;
//   efficiency: number;
// } {
//   switch (level) {
//     case "ultra":
//       return {
//         aggression: 1.2,
//         riskTaking: 1.1,
//         efficiency: 1.0,
//       };
//     case "super":
//       return {
//         aggression: 1.0,
//         riskTaking: 1.0,
//         efficiency: 1.0,
//       };
//     case "hard":
//       return {
//         aggression: 0.9,
//         riskTaking: 0.9,
//         efficiency: 0.9,
//       };
//     case "mid":
//       return {
//         aggression: 0.7,
//         riskTaking: 0.8,
//         efficiency: 0.8,
//       };
//     case "easy":
//       return {
//         aggression: 0.4,
//         riskTaking: 0.3,
//         efficiency: 0.5,
//       };
//   }
// }

// // Fixed getOpponentBlockedArea.ts (unchanged - this was correct)

// export function getOpponentBlockedArea(opponentPos: Position): Position[] {
//   const blockedArea: Position[] = [];

//   for (let dx = -1; dx <= 1; dx++) {
//     for (let dy = -1; dy <= 1; dy++) {
//       const x = opponentPos.x + dx;
//       const y = opponentPos.y + dy;

//       if (isValidPosition({ x, y })) {
//         blockedArea.push({ x, y });
//       }
//     }
//   }

//   return blockedArea;
// }

// // Fixed isBlocked.ts

// export function isBlocked(
//   pos: Position,
//   blockedPositions: string[],
//   opponentBlockedArea: Position[]
// ): boolean {
//   const posStr = `${pos.x},${pos.y}`;

//   if (blockedPositions.includes(posStr)) return true;

//   // Check shop area (4x4 center zone from 3,3 to 5,5)
//   if (pos.x >= 3 && pos.x <= 5 && pos.y >= 3 && pos.y <= 5) return true;

//   if (
//     opponentBlockedArea.some(
//       (blocked) => blocked.x === pos.x && blocked.y === pos.y
//     )
//   )
//     return true;

//   return false;
// }

// // Fixed positionsEqual.ts (unchanged - this was correct)

// export function positionsEqual(pos1: Position, pos2: Position): boolean {
//   return pos1.x === pos2.x && pos1.y === pos2.y;
// }

// export const OCCUPATION_CENTERS: Position[] = [
//   { x: 1, y: 1 },
//   { x: 4, y: 0 },
//   { x: 7, y: 1 },
//   { x: 8, y: 4 },
//   { x: 7, y: 7 },
//   { x: 4, y: 8 },
//   { x: 1, y: 7 },
//   { x: 0, y: 4 },
// ];

///////////this is coommment////

// import { OccupiedPosition } from "../types/game";
// import {
//   BestMoveResult,
//   Board,
//   PathNode,
//   Position,
//   CenterEvaluation,
// } from "../types/global";

// // Helper functions integrated into the class
// function calculateDistance(pos1: Position, pos2: Position): number {
//   return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
// }

// function positionsEqual(pos1: Position, pos2: Position): boolean {
//   return pos1.x === pos2.x && pos1.y === pos2.y;
// }

// function isValidPosition(pos: Position): boolean {
//   return pos.x >= 0 && pos.x <= 8 && pos.y >= 0 && pos.y <= 8;
// }

// function getAdjacentPositions(pos: Position): Position[] {
//   const adjacent: Position[] = [];
//   const directions: Position[] = [
//     { x: 0, y: 1 },
//     { x: 1, y: 0 },
//     { x: 0, y: -1 },
//     { x: -1, y: 0 },
//   ];

//   for (const direction of directions) {
//     const newX = pos.x + direction.x;
//     const newY = pos.y + direction.y;
//     if (isValidPosition({ x: newX, y: newY })) {
//       adjacent.push({ x: newX, y: newY });
//     }
//   }

//   return adjacent;
// }

// function getOpponentBlockedArea(opponentPos: Position): Position[] {
//   const blockedArea: Position[] = [];

//   for (let dx = -1; dx <= 1; dx++) {
//     for (let dy = -1; dy <= 1; dy++) {
//       const x = opponentPos.x + dx;
//       const y = opponentPos.y + dy;

//       if (isValidPosition({ x, y })) {
//         blockedArea.push({ x, y });
//       }
//     }
//   }

//   return blockedArea;
// }

// function isBlocked(
//   pos: Position,
//   blockedPositions: string[],
//   opponentBlockedArea: Position[]
// ): boolean {
//   const posStr = `${pos.x},${pos.y}`;

//   if (blockedPositions.includes(posStr)) return true;

//   // Check shop area (4x4 center zone from 3,3 to 5,5)
//   if (pos.x >= 3 && pos.x <= 5 && pos.y >= 3 && pos.y <= 5) return true;

//   if (
//     opponentBlockedArea.some(
//       (blocked) => blocked.x === pos.x && blocked.y === pos.y
//     )
//   )
//     return true;

//   return false;
// }

// function evaluateCenter(
//   centerPos: Position,
//   myCurrentOP: number,
//   opponentCenters: Array<{
//     spendedOp: number;
//     position: { x: number; y: number };
//   }>,
//   myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>,
//   level: AILevel
// ): CenterEvaluation {
//   // Check if I already own this center
//   const myOwned = myCenters.find((c) => positionsEqual(c.position, centerPos));
//   if (myOwned) {
//     const remainingCapacity = 10 - myOwned.spendedOp;
//     return { priority: 0, type: "owned", requiredPoints: remainingCapacity };
//   }

//   // Check if opponent owns the center
//   const opponentOwned = opponentCenters.find((c) =>
//     positionsEqual(c.position, centerPos)
//   );
//   if (opponentOwned) {
//     let priority = 150;
//     let requiredPoints = opponentOwned.spendedOp + 1;

//     switch (level) {
//       case "ultra":
//       case "super":
//         priority = 250;
//         break;
//       case "hard":
//         priority = 200;
//         break;
//       case "mid":
//         priority = 150;
//         break;
//       case "easy":
//         priority = 100;
//         requiredPoints = opponentOwned.spendedOp + 2;
//         break;
//     }

//     return {
//       priority,
//       type: "recapture",
//       requiredPoints,
//     };
//   }

//   // Free center to capture
//   let priority = 100;
//   switch (level) {
//     case "ultra":
//       priority = 140;
//       break;
//     case "super":
//       priority = 130;
//       break;
//     case "hard":
//       priority = 120;
//       break;
//     case "mid":
//       priority = 100;
//       break;
//     case "easy":
//       priority = 80;
//       break;
//   }

//   return {
//     priority,
//     type: "capture",
//     requiredPoints: 1,
//   };
// }

// // Fixed addRandomness function
// function addRandomness(score: number, randomnessFactor: number): number {
//   if (randomnessFactor <= 0) return score;
//   const randomMultiplier = 1 + (Math.random() - 0.5) * randomnessFactor;
//   return score * randomMultiplier;
// }

// export type AILevel = "easy" | "mid" | "hard" | "super" | "ultra";

// export type BoardState = {
//   blocked: number[]; // shop area
//   myPos: number[];
//   opponentPos: number[];
//   mycurrentOP: number;
//   opponentCurrentOP: number;
//   myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>;
//   opponentCenters: Array<{
//     spendedOp: number;
//     position: { x: number; y: number };
//   }>;
//   inventory: string[]; // my bought items
//   positionsHistory: Array<{ x: number; y: number }>;
//   totalCoin: number;
//   health: number;
//   level?: AILevel;
// };

// export class BoardGamePathfinder {
//   private readonly OCCUPATION_CENTERS: Position[] = [
//     { x: 1, y: 1 },
//     { x: 4, y: 0 },
//     { x: 7, y: 1 },
//     { x: 8, y: 4 },
//     { x: 7, y: 7 },
//     { x: 4, y: 8 },
//     { x: 1, y: 7 },
//     { x: 0, y: 4 },
//   ];
//   private readonly TELEPORT_CORNERS: Position[] = [
//     { x: 0, y: 0 },
//     { x: 0, y: 8 },
//     { x: 8, y: 0 },
//     { x: 8, y: 8 },
//   ];
//   private readonly SHOP_AREA = { x: 4, y: 4 }; // 4x4 center
//   private readonly SHOP_ADJACENT_POSITIONS: Position[] = [
//     // Left side
//     { x: 2, y: 3 },
//     { x: 2, y: 4 },
//     { x: 2, y: 5 },
//     // Right side
//     { x: 6, y: 3 },
//     { x: 6, y: 4 },
//     { x: 6, y: 5 },
//     // Top side
//     { x: 3, y: 2 },
//     { x: 4, y: 2 },
//     { x: 5, y: 2 },
//     // Bottom side
//     { x: 3, y: 6 },
//     { x: 4, y: 6 },
//     { x: 5, y: 6 },
//   ];

//   private getAILevelConfig(level: AILevel) {
//     const configs = {
//       easy: {
//         maxLookahead: 1,
//         aggressionWeight: 0.3,
//         defenseWeight: 0.1,
//         efficiencyWeight: 0.2,
//         randomnessFactor: 0.4,
//         shopStrategy: false,
//         teleportStrategy: false,
//         historyAvoidance: false,
//         healthManagement: false,
//       },
//       mid: {
//         maxLookahead: 2,
//         aggressionWeight: 0.6,
//         defenseWeight: 0.3,
//         efficiencyWeight: 0.4,
//         randomnessFactor: 0.2,
//         shopStrategy: true,
//         teleportStrategy: false,
//         historyAvoidance: true,
//         healthManagement: true,
//       },
//       hard: {
//         maxLookahead: 3,
//         aggressionWeight: 0.8,
//         defenseWeight: 0.6,
//         efficiencyWeight: 0.7,
//         randomnessFactor: 0.1,
//         shopStrategy: true,
//         teleportStrategy: true,
//         historyAvoidance: true,
//         healthManagement: true,
//       },
//       super: {
//         maxLookahead: 4,
//         aggressionWeight: 1.0,
//         defenseWeight: 0.8,
//         efficiencyWeight: 0.9,
//         randomnessFactor: 0.05,
//         shopStrategy: true,
//         teleportStrategy: true,
//         historyAvoidance: true,
//         healthManagement: true,
//       },
//       ultra: {
//         maxLookahead: 5,
//         aggressionWeight: 1.2,
//         defenseWeight: 1.0,
//         efficiencyWeight: 1.0,
//         randomnessFactor: 0.02,
//         shopStrategy: true,
//         teleportStrategy: true,
//         historyAvoidance: true,
//         healthManagement: true,
//       },
//     };
//     return configs[level];
//   }

//   private isInShopArea(pos: Position): boolean {
//     return pos.x >= 3 && pos.x <= 5 && pos.y >= 3 && pos.y <= 5;
//   }

//   private isAdjacentToShop(pos: Position): boolean {
//     // Shop area is 4x4 from (3,3) to (5,5), so adjacent positions are around this area
//     return (
//       // Left side of shop
//       (pos.x === 2 && pos.y >= 3 && pos.y <= 5) ||
//       // Right side of shop
//       (pos.x === 6 && pos.y >= 3 && pos.y <= 5) ||
//       // Top side of shop
//       (pos.y === 2 && pos.x >= 3 && pos.x <= 5) ||
//       // Bottom side of shop
//       (pos.y === 6 && pos.x >= 3 && pos.x <= 5)
//     );
//   }

//   private isTeleportCorner(pos: Position): boolean {
//     return this.TELEPORT_CORNERS.some((corner) => positionsEqual(pos, corner));
//   }

//   private shouldBuyHealthPotion(board: BoardState, config: any): boolean {
//     if (!config.healthManagement) return false;
//     return (
//       board.health <= 15 && board.totalCoin >= 5 && board.inventory.length < 4
//     );
//   }

//   private shouldBuyTeleportStone(board: BoardState, config: any): boolean {
//     if (!config.teleportStrategy) return false;
//     return (
//       board.totalCoin >= 10 &&
//       board.inventory.length < 4 &&
//       !board.inventory.includes("TELEPORT_STONE")
//     );
//   }

//   private shouldBuyLuckyCharm(board: BoardState, config: any): boolean {
//     if (!config.shopStrategy) return false;
//     return (
//       board.totalCoin >= 15 &&
//       board.inventory.length < 4 &&
//       !board.inventory.includes("LUCKY_CHARM")
//     );
//   }

//   //   private evaluateShopMove(
//   //     board: BoardState,
//   //     config: any
//   //   ): BestMoveResult | null {
//   //     const myPos = { x: board.myPos[0], y: board.myPos[1] };

//   //     // If already adjacent to shop, return empty path (buy action)
//   //     if (this.isAdjacentToShop(myPos)) {
//   //       return {
//   //         targetCenter: myPos,
//   //         path: [],
//   //         occupationPoints: 0,
//   //         strategy: "buy",
//   //       };
//   //     }

//   //     // Find path to shop
//   //     const opponentBlockedArea = getOpponentBlockedArea({
//   //       x: board.opponentPos[0],
//   //       y: board.opponentPos[1],
//   //     });

//   //     const blockedPositions = board.blocked
//   //       ? [`${board.blocked[0]},${board.blocked[1]}`]
//   //       : [];

//   //     let bestShopPath: Position[] | null = null;
//   //     let bestDistance = Infinity;

//   //     for (const shopPos of this.SHOP_ADJACENT_POSITIONS) {
//   //       const path = this.findShortestPath(
//   //         myPos,
//   //         shopPos,
//   //         blockedPositions,
//   //         opponentBlockedArea,
//   //         config.maxLookahead
//   //       );

//   //       if (path && path.length < bestDistance) {
//   //         bestDistance = path.length;
//   //         bestShopPath = path;
//   //       }
//   //     }

//   //     if (bestShopPath) {
//   //       return {
//   //         targetCenter: bestShopPath[bestShopPath.length - 1],
//   //         path: bestShopPath,
//   //         occupationPoints: bestShopPath.length,
//   //         strategy: "shop_approach",
//   //       };
//   //     }

//   //     return null;
//   //   }

//   private evaluateShopMove(
//     board: BoardState,
//     config: any
//   ): BestMoveResult | null {
//     const myPos = { x: board.myPos[0], y: board.myPos[1] };

//     // Check if we should go to shop
//     const shouldShop =
//       this.shouldBuyHealthPotion(board, config) ||
//       this.shouldBuyTeleportStone(board, config) ||
//       this.shouldBuyLuckyCharm(board, config);

//     if (!shouldShop) return null;

//     // Find path to shop adjacent position
//     const opponentBlockedArea = getOpponentBlockedArea({
//       x: board.opponentPos[0],
//       y: board.opponentPos[1],
//     });

//     const blockedPositions = board.blocked
//       ? [`${board.blocked[0]},${board.blocked[1]}`]
//       : [];

//     let bestShopPath: Position[] | null = null;
//     let bestDistance = Infinity;

//     for (const shopPos of this.SHOP_ADJACENT_POSITIONS) {
//       const path = this.findShortestPath(
//         myPos,
//         shopPos,
//         blockedPositions,
//         opponentBlockedArea,
//         config.maxLookahead
//       );

//       if (path && path.length < bestDistance) {
//         bestDistance = path.length;
//         bestShopPath = path;
//       }
//     }

//     if (bestShopPath) {
//       return {
//         targetCenter: bestShopPath[bestShopPath.length - 1],
//         path: bestShopPath,
//         occupationPoints: bestShopPath.length,
//         strategy: "shop",
//       };
//     }

//     return null;
//   }

//   private evaluateTeleportMove(
//     board: BoardState,
//     config: any
//   ): BestMoveResult | null {
//     if (
//       !config.teleportStrategy ||
//       !board.inventory.includes("TELEPORT_STONE")
//     ) {
//       return null;
//     }

//     const myPos = { x: board.myPos[0], y: board.myPos[1] };

//     // If already on teleport corner, evaluate teleporting
//     if (this.isTeleportCorner(myPos)) {
//       const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };

//       let bestTeleportTarget: Position | null = null;
//       let bestScore = -Infinity;

//       for (const corner of this.TELEPORT_CORNERS) {
//         if (positionsEqual(corner, myPos)) continue; // Don't teleport to same position

//         // Calculate strategic value of this corner
//         let score = 0;

//         // Prefer corners closer to valuable occupation centers
//         for (const center of this.OCCUPATION_CENTERS) {
//           const centerEval = evaluateCenter(
//             center,
//             board.mycurrentOP,
//             board.opponentCenters,
//             board.myCenters,
//             board.level || "hard"
//           );

//           if (centerEval.type !== "owned") {
//             const distance = calculateDistance(corner, center);
//             score += centerEval.priority / (distance + 1);
//           }
//         }

//         // Avoid corners too close to opponent
//         const distanceToOpponent = calculateDistance(corner, opponentPos);
//         if (distanceToOpponent < 3) score -= 500;

//         if (score > bestScore) {
//           bestScore = score;
//           bestTeleportTarget = corner;
//         }
//       }

//       if (bestTeleportTarget) {
//         return {
//           targetCenter: bestTeleportTarget,
//           path: [bestTeleportTarget], // Instant teleport
//           occupationPoints: 0, // Teleport doesn't give OP
//           strategy: "teleport",
//         };
//       }
//     } else {
//       // Try to get to a teleport corner
//       const opponentBlockedArea = getOpponentBlockedArea({
//         x: board.opponentPos[0],
//         y: board.opponentPos[1],
//       });

//       const blockedPositions = board.blocked
//         ? [`${board.blocked[0]},${board.blocked[1]}`]
//         : [];

//       let bestCornerPath: Position[] | null = null;
//       let bestDistance = Infinity;

//       for (const corner of this.TELEPORT_CORNERS) {
//         const path = this.findShortestPath(
//           myPos,
//           corner,
//           blockedPositions,
//           opponentBlockedArea,
//           config.maxLookahead
//         );

//         if (path && path.length < bestDistance) {
//           bestDistance = path.length;
//           bestCornerPath = path;
//         }
//       }

//       if (bestCornerPath && bestDistance <= 2) {
//         // Only if corner is close
//         return {
//           targetCenter: bestCornerPath[bestCornerPath.length - 1],
//           path: bestCornerPath,
//           occupationPoints: bestCornerPath.length,
//           strategy: "teleport_approach",
//         };
//       }
//     }

//     return null;
//   }

//   private evaluatePositionHistory(
//     pos: Position,
//     positionsHistory: Array<{ x: number; y: number }>,
//     config: any
//   ): number {
//     if (!config.historyAvoidance) return 0;

//     const recentVisits = positionsHistory.slice(-10); // Check last 10 moves
//     const visitCount = recentVisits.filter((histPos) =>
//       positionsEqual(pos, { x: histPos.x, y: histPos.y })
//     ).length;

//     // Heavy penalty for repeatedly visiting same position
//     return -visitCount * 200;
//   }

//   private findShortestPath(
//     start: Position,
//     target: Position,
//     blockedPositions: string[],
//     opponentBlockedArea: Position[],
//     maxSteps: number = 3
//   ): Position[] | null {
//     if (positionsEqual(start, target)) {
//       return [];
//     }

//     const queue: PathNode[] = [
//       {
//         pos: start,
//         path: [],
//         steps: 0,
//       },
//     ];

//     const visited = new Set<string>();
//     visited.add(`${start.x},${start.y}`);

//     while (queue.length > 0) {
//       const current = queue.shift()!;

//       if (current.steps >= maxSteps) continue;

//       const adjacent = getAdjacentPositions(current.pos);

//       for (const nextPos of adjacent) {
//         const posKey = `${nextPos.x},${nextPos.y}`;

//         if (visited.has(posKey)) continue;
//         if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;
//         if (this.isInShopArea(nextPos)) continue; // Can't enter shop area

//         const newPath = [...current.path, nextPos];

//         if (positionsEqual(nextPos, target)) {
//           return newPath;
//         }

//         visited.add(posKey);
//         queue.push({
//           pos: nextPos,
//           path: newPath,
//           steps: current.steps + 1,
//         });
//       }
//     }

//     return null;
//   }

//   private findBestMoveToward(
//     start: Position,
//     target: Position,
//     blockedPositions: string[],
//     opponentBlockedArea: Position[],
//     config: any
//   ): Position[] | null {
//     let bestPath: Position[] | null = null;
//     let bestScore = -Infinity;

//     for (let steps = 1; steps <= config.maxLookahead; steps++) {
//       const paths = this.getAllPathsOfLength(
//         start,
//         blockedPositions,
//         opponentBlockedArea,
//         steps
//       );

//       for (const path of paths) {
//         const endPos = path[path.length - 1];
//         const distanceToTarget = calculateDistance(endPos, target);
//         const startDistance = calculateDistance(start, target);
//         const progress = startDistance - distanceToTarget;

//         let score =
//           progress * 100 * config.efficiencyWeight +
//           path.length * 20 * config.aggressionWeight;

//         if (score > bestScore) {
//           bestScore = score;
//           bestPath = path;
//         }
//       }
//     }

//     return bestPath;
//   }

//   private getAllPathsOfLength(
//     start: Position,
//     blockedPositions: string[],
//     opponentBlockedArea: Position[],
//     targetLength: number
//   ): Position[][] {
//     const results: Position[][] = [];

//     const queue: PathNode[] = [
//       {
//         pos: start,
//         path: [],
//         steps: 0,
//       },
//     ];

//     while (queue.length > 0) {
//       const current = queue.shift()!;

//       if (current.steps === targetLength) {
//         results.push(current.path);
//         continue;
//       }

//       if (current.steps >= targetLength) continue;

//       const adjacent = getAdjacentPositions(current.pos);

//       for (const nextPos of adjacent) {
//         if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;
//         if (this.isInShopArea(nextPos)) continue;

//         queue.push({
//           pos: nextPos,
//           path: [...current.path, nextPos],
//           steps: current.steps + 1,
//         });
//       }
//     }

//     return results;
//   }

//   private evaluateDefensiveMove(
//     board: BoardState,
//     config: any
//   ): BestMoveResult | null {
//     if (!config.defenseWeight) return null;

//     const myPos = { x: board.myPos[0], y: board.myPos[1] };
//     const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };

//     // Check if opponent can threaten our centers
//     const threatenedCenters = board.myCenters.filter((center) => {
//       const distanceToOpponent = calculateDistance(
//         opponentPos,
//         center.position
//       );
//       return (
//         distanceToOpponent <= 3 && board.opponentCurrentOP > center.spendedOp
//       );
//     });

//     if (threatenedCenters.length === 0) return null;

//     // Find defensive position to protect our centers
//     const opponentBlockedArea = getOpponentBlockedArea(opponentPos);
//     const blockedPositions = board.blocked
//       ? [`${board.blocked[0]},${board.blocked[1]}`]
//       : [];

//     let bestDefensePath: Position[] | null = null;
//     let bestDefenseScore = -Infinity;

//     for (const threatenedCenter of threatenedCenters) {
//       // Try to position between opponent and our center
//       const adjacent = getAdjacentPositions(threatenedCenter.position);

//       for (const defensePos of adjacent) {
//         if (isBlocked(defensePos, blockedPositions, opponentBlockedArea))
//           continue;

//         const path = this.findShortestPath(
//           myPos,
//           defensePos,
//           blockedPositions,
//           opponentBlockedArea,
//           config.maxLookahead
//         );

//         if (path) {
//           const distanceToOpponent = calculateDistance(defensePos, opponentPos);
//           const score = distanceToOpponent * 50 + path.length * 10;

//           if (score > bestDefenseScore) {
//             bestDefenseScore = score;
//             bestDefensePath = path;
//           }
//         }
//       }
//     }

//     if (bestDefensePath) {
//       return {
//         targetCenter: bestDefensePath[bestDefensePath.length - 1],
//         path: bestDefensePath,
//         occupationPoints: bestDefensePath.length,
//         strategy: "defense",
//       };
//     }

//     return null;
//   }

//   private findBestMove(board: BoardState): BestMoveResult {
//     const level = board.level || "hard";
//     const config = this.getAILevelConfig(level);

//     const myPos = { x: board.myPos[0], y: board.myPos[1] };
//     const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };
//     const blockedPositions: string[] = [];

//     if (board.blocked) {
//       blockedPositions.push(`${board.blocked[0]},${board.blocked[1]}`);
//     }

//     const opponentBlockedArea = getOpponentBlockedArea(opponentPos);

//     // Priority 1: Health management (if health is critical)
//     if (config.healthManagement && board.health <= 10) {
//       const shopMove = this.evaluateShopMove(board, config);
//       if (shopMove) return shopMove;
//     }

//     // Priority 2: Teleport strategy (ultra/super levels)
//     if (config.teleportStrategy) {
//       const teleportMove = this.evaluateTeleportMove(board, config);
//       if (teleportMove) return teleportMove;
//     }

//     // Priority 3: Shop strategy (if beneficial)
//     if (
//       config.shopStrategy &&
//       (this.shouldBuyHealthPotion(board, config) ||
//         this.shouldBuyTeleportStone(board, config) ||
//         this.shouldBuyLuckyCharm(board, config))
//     ) {
//       const shopMove = this.evaluateShopMove(board, config);
//       if (shopMove) return shopMove;
//     }

//     // Priority 4: Defensive moves (protect our centers)
//     if (config.defenseWeight > 0.5) {
//       const defensiveMove = this.evaluateDefensiveMove(board, config);
//       if (defensiveMove) return defensiveMove;
//     }

//     let bestMove: Position | null = null;
//     let bestScore: number = -Infinity;
//     let bestPath: Position[] | null = null;
//     let bestStrategy: string = "none";

//     for (const center of this.OCCUPATION_CENTERS) {
//       const evaluation = evaluateCenter(
//         center,
//         board.mycurrentOP,
//         board.opponentCenters,
//         board.myCenters,
//         level
//       );

//       if (evaluation.type === "owned") continue;

//       let path = this.findShortestPath(
//         myPos,
//         center,
//         blockedPositions,
//         opponentBlockedArea,
//         config.maxLookahead
//       );
//       let strategy = evaluation.type;

//       if (path) {
//         const pathPoints = path.length;
//         const totalPointsAfterMove = board.mycurrentOP + pathPoints;
//         const canCapture =
//           totalPointsAfterMove >= (evaluation.requiredPoints || 1);

//         let score = evaluation.priority * config.aggressionWeight;

//         if (canCapture) {
//           const captureBonus = strategy === "recapture" ? 3000 : 2000;
//           score += captureBonus * config.aggressionWeight;
//         } else {
//           score += 150 * config.efficiencyWeight;
//         }

//         // History avoidance penalty
//         if (config.historyAvoidance) {
//           const endPos = path[path.length - 1];
//           score += this.evaluatePositionHistory(
//             endPos,
//             board.positionsHistory,
//             config
//           );
//         }

//         // Add strategic bonuses for higher levels
//         if (level === "super" || level === "ultra") {
//           // Bonus for moves that cut off opponent's paths
//           const opponentDistance = calculateDistance(opponentPos, center);
//           const myDistance = calculateDistance(myPos, center);
//           if (myDistance < opponentDistance) {
//             score += 500;
//           }

//           // Bonus for controlling multiple centers
//           const controlledCenters = board.myCenters.length;
//           score += controlledCenters * 200;
//         }

//         score = addRandomness(score, config.randomnessFactor);

//         if (score > bestScore) {
//           bestScore = score;
//           bestMove = center;
//           bestPath = path;
//           bestStrategy = canCapture ? strategy : "approach";
//         }
//       } else {
//         // Try to move toward the center if direct path is blocked
//         path = this.findBestMoveToward(
//           myPos,
//           center,
//           blockedPositions,
//           opponentBlockedArea,
//           config
//         );

//         if (path) {
//           const startDistance = calculateDistance(myPos, center);
//           const endPos = path[path.length - 1];
//           const endDistance = calculateDistance(endPos, center);
//           const progress = startDistance - endDistance;

//           let score =
//             progress * 120 * config.efficiencyWeight +
//             path.length * 25 * config.aggressionWeight +
//             evaluation.priority * 0.5;

//           // History avoidance penalty
//           if (config.historyAvoidance) {
//             score += this.evaluatePositionHistory(
//               endPos,
//               board.positionsHistory,
//               config
//             );
//           }

//           score = addRandomness(score, config.randomnessFactor);

//           if (score > bestScore) {
//             bestScore = score;
//             bestMove = center;
//             bestPath = path;
//             bestStrategy = "approach";
//           }
//         }
//       }
//     }

//     return {
//       targetCenter: bestMove,
//       path: bestPath,
//       occupationPoints: bestPath ? bestPath.length : 0,
//       strategy: bestStrategy,
//     };
//   }

//   public getBestPath(board: BoardState): number[][] {
//     const result = this.findBestMove(board);

//     if (!result.path || result.path.length === 0) {
//       return [];
//     }

//     return result.path.map((pos) => [pos.x, pos.y] as number[]);
//   }

//   public getBestMove(board: BoardState): BestMoveResult {
//     return this.findBestMove(board);
//   }
// }

// // Usage example:
// export function bestMove(board: BoardState): number[][] {
//   const pathfinder = new BoardGamePathfinder();
//   return pathfinder.getBestPath(board);
// }

import { OccupiedPosition } from "../types/game";
import {
  BestMoveResult,
  Board,
  PathNode,
  Position,
  CenterEvaluation,
} from "../types/global";

// Helper functions integrated into the class
function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function isValidPosition(pos: Position): boolean {
  return pos.x >= 0 && pos.x <= 8 && pos.y >= 0 && pos.y <= 8;
}

function getAdjacentPositions(pos: Position): Position[] {
  const adjacent: Position[] = [];
  const directions: Position[] = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
  ];

  for (const direction of directions) {
    const newX = pos.x + direction.x;
    const newY = pos.y + direction.y;
    if (isValidPosition({ x: newX, y: newY })) {
      adjacent.push({ x: newX, y: newY });
    }
  }

  return adjacent;
}

function getOpponentBlockedArea(opponentPos: Position): Position[] {
  const blockedArea: Position[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = opponentPos.x + dx;
      const y = opponentPos.y + dy;

      if (isValidPosition({ x, y })) {
        blockedArea.push({ x, y });
      }
    }
  }

  return blockedArea;
}

function isBlocked(
  pos: Position,
  blockedPositions: string[],
  opponentBlockedArea: Position[]
): boolean {
  const posStr = `${pos.x},${pos.y}`;

  if (blockedPositions.includes(posStr)) return true;

  // Check shop area (4x4 center zone from 3,3 to 5,5)
  if (pos.x >= 3 && pos.x <= 5 && pos.y >= 3 && pos.y <= 5) return true;

  if (
    opponentBlockedArea.some(
      (blocked) => blocked.x === pos.x && blocked.y === pos.y
    )
  )
    return true;

  return false;
}

function evaluateCenter(
  centerPos: Position,
  myCurrentOP: number,
  opponentCenters: Array<{
    spendedOp: number;
    position: { x: number; y: number };
  }>,
  myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>,
  level: AILevel
): CenterEvaluation {
  // Check if I already own this center
  const myOwned = myCenters.find((c) => positionsEqual(c.position, centerPos));
  if (myOwned) {
    const remainingCapacity = 10 - myOwned.spendedOp;
    return { priority: 0, type: "owned", requiredPoints: remainingCapacity };
  }

  // Check if opponent owns the center
  const opponentOwned = opponentCenters.find((c) =>
    positionsEqual(c.position, centerPos)
  );
  if (opponentOwned) {
    let priority = 150;
    let requiredPoints = opponentOwned.spendedOp + 1;

    switch (level) {
      case "ultra":
      case "super":
        priority = 250;
        break;
      case "hard":
        priority = 200;
        break;
      case "mid":
        priority = 150;
        break;
      case "easy":
        priority = 100;
        requiredPoints = opponentOwned.spendedOp + 2;
        break;
    }

    return {
      priority,
      type: "recapture",
      requiredPoints,
    };
  }

  // Free center to capture
  let priority = 100;
  switch (level) {
    case "ultra":
      priority = 140;
      break;
    case "super":
      priority = 130;
      break;
    case "hard":
      priority = 120;
      break;
    case "mid":
      priority = 100;
      break;
    case "easy":
      priority = 80;
      break;
  }

  return {
    priority,
    type: "capture",
    requiredPoints: 1,
  };
}

// Fixed addRandomness function
function addRandomness(score: number, randomnessFactor: number): number {
  if (randomnessFactor <= 0) return score;
  const randomMultiplier = 1 + (Math.random() - 0.5) * randomnessFactor;
  return score * randomMultiplier;
}

export type AILevel = "easy" | "mid" | "hard" | "super" | "ultra";

export type BoardState = {
  blocked: [number, number]; // shop area
  myPos: [number, number];
  opponentPos: [number, number];
  mycurrentOP: number;
  opponentCurrentOP: number;
  myCenters: Array<{ spendedOp: number; position: { x: number; y: number } }>;
  opponentCenters: Array<{
    spendedOp: number;
    position: { x: number; y: number };
  }>;
  inventory: string[]; // my bought items
  positionsHistory: Array<{ x: number; y: number }>;
  totalCoin: number;
  health: number;
  level?: AILevel;
};

export class BoardGamePathfinder {
  private readonly OCCUPATION_CENTERS: Position[] = [
    { x: 1, y: 1 },
    { x: 4, y: 0 },
    { x: 7, y: 1 },
    { x: 8, y: 4 },
    { x: 7, y: 7 },
    { x: 4, y: 8 },
    { x: 1, y: 7 },
    { x: 0, y: 4 },
  ];
  private readonly TELEPORT_CORNERS: Position[] = [
    { x: 0, y: 0 },
    { x: 0, y: 8 },
    { x: 8, y: 0 },
    { x: 8, y: 8 },
  ];
  private readonly SHOP_AREA = { x: 4, y: 4 }; // 4x4 center
  private readonly SHOP_ADJACENT_POSITIONS: Position[] = [
    // Left side
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
    // Right side
    { x: 6, y: 3 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },
    // Top side
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    // Bottom side
    { x: 3, y: 6 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
  ];

  private validateMovePath(path: Position[]): boolean {
    // Validate path doesn't exceed 3 steps
    if (path.length > 3) return false;

    // Validate each step is adjacent (no diagonal movement)
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      const distance = calculateDistance(current, next);
      if (distance !== 1) return false; // Each step must be exactly 1 unit away
    }

    return true;
  }

  private getAILevelConfig(level: AILevel) {
    const configs = {
      easy: {
        maxLookahead: 1,
        aggressionWeight: 0.3,
        defenseWeight: 0.1,
        efficiencyWeight: 0.2,
        randomnessFactor: 0.4,
        shopStrategy: false,
        teleportStrategy: false,
        historyAvoidance: false,
        healthManagement: false,
      },
      mid: {
        maxLookahead: 2,
        aggressionWeight: 0.6,
        defenseWeight: 0.3,
        efficiencyWeight: 0.4,
        randomnessFactor: 0.2,
        shopStrategy: true,
        teleportStrategy: false,
        historyAvoidance: true,
        healthManagement: true,
      },
      hard: {
        maxLookahead: 3,
        aggressionWeight: 0.8,
        defenseWeight: 0.6,
        efficiencyWeight: 0.7,
        randomnessFactor: 0.1,
        shopStrategy: true,
        teleportStrategy: true,
        historyAvoidance: true,
        healthManagement: true,
      },
      super: {
        maxLookahead: 3, // Fixed: Maximum 3 steps
        aggressionWeight: 1.0,
        defenseWeight: 0.8,
        efficiencyWeight: 0.9,
        randomnessFactor: 0.05,
        shopStrategy: true,
        teleportStrategy: true,
        historyAvoidance: true,
        healthManagement: true,
      },
      ultra: {
        maxLookahead: 3, // Fixed: Maximum 3 steps
        aggressionWeight: 1.2,
        defenseWeight: 1.0,
        efficiencyWeight: 1.0,
        randomnessFactor: 0.02,
        shopStrategy: true,
        teleportStrategy: true,
        historyAvoidance: true,
        healthManagement: true,
      },
    };
    return configs[level];
  }

  private isInShopArea(pos: Position): boolean {
    return pos.x >= 3 && pos.x <= 5 && pos.y >= 3 && pos.y <= 5;
  }

  private isAdjacentToShop(pos: Position): boolean {
    // Shop area is 4x4 from (3,3) to (5,5), so adjacent positions are around this area
    return (
      // Left side of shop
      (pos.x === 2 && pos.y >= 3 && pos.y <= 5) ||
      // Right side of shop
      (pos.x === 6 && pos.y >= 3 && pos.y <= 5) ||
      // Top side of shop
      (pos.y === 2 && pos.x >= 3 && pos.x <= 5) ||
      // Bottom side of shop
      (pos.y === 6 && pos.x >= 3 && pos.x <= 5)
    );
  }

  private isTeleportCorner(pos: Position): boolean {
    return this.TELEPORT_CORNERS.some((corner) => positionsEqual(pos, corner));
  }

  private shouldBuyHealthPotion(board: BoardState, config: any): boolean {
    if (!config.healthManagement) return false;
    return (
      board.health <= 15 && board.totalCoin >= 5 && board.inventory.length < 4
    );
  }

  private shouldBuyTeleportStone(board: BoardState, config: any): boolean {
    if (!config.teleportStrategy) return false;
    return (
      board.totalCoin >= 10 &&
      board.inventory.length < 4 &&
      !board.inventory.includes("TELEPORT_STONE")
    );
  }

  private shouldBuyLuckyCharm(board: BoardState, config: any): boolean {
    if (!config.shopStrategy) return false;
    return (
      board.totalCoin >= 15 &&
      board.inventory.length < 4 &&
      !board.inventory.includes("LUCKY_CHARM")
    );
  }

  private evaluateShopMove(
    board: BoardState,
    config: any
  ): BestMoveResult | null {
    const myPos = { x: board.myPos[0], y: board.myPos[1] };

    // Check if we should go to shop
    const shouldShop =
      this.shouldBuyHealthPotion(board, config) ||
      this.shouldBuyTeleportStone(board, config) ||
      this.shouldBuyLuckyCharm(board, config);

    if (!shouldShop) return null;

    // Find path to shop adjacent position
    const opponentBlockedArea = getOpponentBlockedArea({
      x: board.opponentPos[0],
      y: board.opponentPos[1],
    });

    const blockedPositions = board.blocked
      ? [`${board.blocked[0]},${board.blocked[1]}`]
      : [];

    let bestShopPath: Position[] | null = null;
    let bestDistance = Infinity;

    for (const shopPos of this.SHOP_ADJACENT_POSITIONS) {
      const path = this.findShortestPath(
        myPos,
        shopPos,
        blockedPositions,
        opponentBlockedArea,
        config.maxLookahead
      );

      if (path && path.length < bestDistance) {
        bestDistance = path.length;
        bestShopPath = path;
      }
    }

    if (bestShopPath) {
      return {
        targetCenter: bestShopPath[bestShopPath.length - 1],
        path: bestShopPath,
        occupationPoints: bestShopPath.length,
        strategy: "shop",
      };
    }

    return null;
  }

  private evaluateTeleportMove(
    board: BoardState,
    config: any
  ): BestMoveResult | null {
    if (
      !config.teleportStrategy ||
      !board.inventory.includes("TELEPORT_STONE")
    ) {
      return null;
    }

    const myPos = { x: board.myPos[0], y: board.myPos[1] };

    // If already on teleport corner, evaluate teleporting
    if (this.isTeleportCorner(myPos)) {
      const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };

      let bestTeleportTarget: Position | null = null;
      let bestScore = -Infinity;

      for (const corner of this.TELEPORT_CORNERS) {
        if (positionsEqual(corner, myPos)) continue; // Don't teleport to same position

        // Calculate strategic value of this corner
        let score = 0;

        // Prefer corners closer to valuable occupation centers
        for (const center of this.OCCUPATION_CENTERS) {
          const centerEval = evaluateCenter(
            center,
            board.mycurrentOP,
            board.opponentCenters,
            board.myCenters,
            board.level || "hard"
          );

          if (centerEval.type !== "owned") {
            const distance = calculateDistance(corner, center);
            score += centerEval.priority / (distance + 1);
          }
        }

        // Avoid corners too close to opponent
        const distanceToOpponent = calculateDistance(corner, opponentPos);
        if (distanceToOpponent < 3) score -= 500;

        if (score > bestScore) {
          bestScore = score;
          bestTeleportTarget = corner;
        }
      }

      if (bestTeleportTarget) {
        return {
          targetCenter: bestTeleportTarget,
          path: [bestTeleportTarget], // Instant teleport
          occupationPoints: 0, // Teleport doesn't give OP
          strategy: "teleport",
        };
      }
    } else {
      // Try to get to a teleport corner
      const opponentBlockedArea = getOpponentBlockedArea({
        x: board.opponentPos[0],
        y: board.opponentPos[1],
      });

      const blockedPositions = board.blocked
        ? [`${board.blocked[0]},${board.blocked[1]}`]
        : [];

      let bestCornerPath: Position[] | null = null;
      let bestDistance = Infinity;

      for (const corner of this.TELEPORT_CORNERS) {
        const path = this.findShortestPath(
          myPos,
          corner,
          blockedPositions,
          opponentBlockedArea,
          config.maxLookahead
        );

        if (path && path.length < bestDistance) {
          bestDistance = path.length;
          bestCornerPath = path;
        }
      }

      if (bestCornerPath && bestDistance <= 3) {
        // Fixed: Only if corner is reachable within 3 steps
        return {
          targetCenter: bestCornerPath[bestCornerPath.length - 1],
          path: bestCornerPath,
          occupationPoints: bestCornerPath.length,
          strategy: "teleport_approach",
        };
      }
    }

    return null;
  }

  private evaluatePositionHistory(
    pos: Position,
    positionsHistory: Array<{ x: number; y: number }>,
    config: any
  ): number {
    if (!config.historyAvoidance) return 0;

    const recentVisits = positionsHistory.slice(-10); // Check last 10 moves
    const visitCount = recentVisits.filter((histPos) =>
      positionsEqual(pos, { x: histPos.x, y: histPos.y })
    ).length;

    // Heavy penalty for repeatedly visiting same position
    return -visitCount * 200;
  }

  private findShortestPath(
    start: Position,
    target: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    maxSteps: number = 3
  ): Position[] | null {
    if (positionsEqual(start, target)) {
      return [];
    }

    const queue: PathNode[] = [
      {
        pos: start,
        path: [],
        steps: 0,
      },
    ];

    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.steps >= maxSteps) continue;

      const adjacent = getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        const posKey = `${nextPos.x},${nextPos.y}`;

        if (visited.has(posKey)) continue;
        if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;
        if (this.isInShopArea(nextPos)) continue; // Can't enter shop area

        const newPath = [...current.path, nextPos];

        if (positionsEqual(nextPos, target)) {
          return newPath;
        }

        visited.add(posKey);
        queue.push({
          pos: nextPos,
          path: newPath,
          steps: current.steps + 1,
        });
      }
    }

    return null;
  }

  private findBestMoveToward(
    start: Position,
    target: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    config: any
  ): Position[] | null {
    let bestPath: Position[] | null = null;
    let bestScore = -Infinity;

    for (let steps = 1; steps <= config.maxLookahead; steps++) {
      const paths = this.getAllPathsOfLength(
        start,
        blockedPositions,
        opponentBlockedArea,
        steps
      );

      for (const path of paths) {
        const endPos = path[path.length - 1];
        const distanceToTarget = calculateDistance(endPos, target);
        const startDistance = calculateDistance(start, target);
        const progress = startDistance - distanceToTarget;

        let score =
          progress * 100 * config.efficiencyWeight +
          path.length * 20 * config.aggressionWeight;

        if (score > bestScore) {
          bestScore = score;
          bestPath = path;
        }
      }
    }

    return bestPath;
  }

  private getAllPathsOfLength(
    start: Position,
    blockedPositions: string[],
    opponentBlockedArea: Position[],
    targetLength: number
  ): Position[][] {
    const results: Position[][] = [];

    // Ensure we don't exceed 3 steps maximum
    if (targetLength > 3) targetLength = 3;

    const queue: PathNode[] = [
      {
        pos: start,
        path: [],
        steps: 0,
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.steps === targetLength) {
        results.push(current.path);
        continue;
      }

      if (current.steps >= targetLength) continue;

      const adjacent = getAdjacentPositions(current.pos);

      for (const nextPos of adjacent) {
        if (isBlocked(nextPos, blockedPositions, opponentBlockedArea)) continue;
        if (this.isInShopArea(nextPos)) continue;

        queue.push({
          pos: nextPos,
          path: [...current.path, nextPos],
          steps: current.steps + 1,
        });
      }
    }

    return results;
  }

  private evaluateDefensiveMove(
    board: BoardState,
    config: any
  ): BestMoveResult | null {
    if (!config.defenseWeight) return null;

    const myPos = { x: board.myPos[0], y: board.myPos[1] };
    const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };

    // Check if opponent can threaten our centers
    const threatenedCenters = board.myCenters.filter((center) => {
      const distanceToOpponent = calculateDistance(
        opponentPos,
        center.position
      );
      return (
        distanceToOpponent <= 3 && board.opponentCurrentOP > center.spendedOp
      );
    });

    if (threatenedCenters.length === 0) return null;

    // Find defensive position to protect our centers
    const opponentBlockedArea = getOpponentBlockedArea(opponentPos);
    const blockedPositions = board.blocked
      ? [`${board.blocked[0]},${board.blocked[1]}`]
      : [];

    let bestDefensePath: Position[] | null = null;
    let bestDefenseScore = -Infinity;

    for (const threatenedCenter of threatenedCenters) {
      // Try to position between opponent and our center
      const adjacent = getAdjacentPositions(threatenedCenter.position);

      for (const defensePos of adjacent) {
        if (isBlocked(defensePos, blockedPositions, opponentBlockedArea))
          continue;

        const path = this.findShortestPath(
          myPos,
          defensePos,
          blockedPositions,
          opponentBlockedArea,
          config.maxLookahead
        );

        if (path) {
          const distanceToOpponent = calculateDistance(defensePos, opponentPos);
          const score = distanceToOpponent * 50 + path.length * 10;

          if (score > bestDefenseScore) {
            bestDefenseScore = score;
            bestDefensePath = path;
          }
        }
      }
    }

    if (bestDefensePath) {
      return {
        targetCenter: bestDefensePath[bestDefensePath.length - 1],
        path: bestDefensePath,
        occupationPoints: bestDefensePath.length,
        strategy: "defense",
      };
    }

    return null;
  }

  private findBestMove(board: BoardState): BestMoveResult {
    const level = board.level || "hard";
    const config = this.getAILevelConfig(level);

    const myPos = { x: board.myPos[0], y: board.myPos[1] };
    const opponentPos = { x: board.opponentPos[0], y: board.opponentPos[1] };
    const blockedPositions: string[] = [];

    if (board.blocked) {
      blockedPositions.push(`${board.blocked[0]},${board.blocked[1]}`);
    }

    const opponentBlockedArea = getOpponentBlockedArea(opponentPos);

    // Priority 1: Health management (if health is critical)
    if (config.healthManagement && board.health <= 10) {
      const shopMove = this.evaluateShopMove(board, config);
      if (shopMove) return shopMove;
    }

    // Priority 2: Teleport strategy (ultra/super levels)
    if (config.teleportStrategy) {
      const teleportMove = this.evaluateTeleportMove(board, config);
      if (teleportMove) return teleportMove;
    }

    // Priority 3: Shop strategy (if beneficial)
    if (
      config.shopStrategy &&
      (this.shouldBuyHealthPotion(board, config) ||
        this.shouldBuyTeleportStone(board, config) ||
        this.shouldBuyLuckyCharm(board, config))
    ) {
      const shopMove = this.evaluateShopMove(board, config);
      if (shopMove) return shopMove;
    }

    // Priority 4: Defensive moves (protect our centers)
    if (config.defenseWeight > 0.5) {
      const defensiveMove = this.evaluateDefensiveMove(board, config);
      if (defensiveMove) return defensiveMove;
    }

    // Priority 5: Aggressive/Strategic moves
    let bestMove: Position | null = null;
    let bestScore: number = -Infinity;
    let bestPath: Position[] | null = null;
    let bestStrategy: string = "none";

    for (const center of this.OCCUPATION_CENTERS) {
      const evaluation = evaluateCenter(
        center,
        board.mycurrentOP,
        board.opponentCenters,
        board.myCenters,
        level
      );

      if (evaluation.type === "owned") continue;

      let path = this.findShortestPath(
        myPos,
        center,
        blockedPositions,
        opponentBlockedArea,
        config.maxLookahead
      );
      let strategy = evaluation.type;

      if (path) {
        const pathPoints = path.length;
        const totalPointsAfterMove = board.mycurrentOP + pathPoints;
        const canCapture =
          totalPointsAfterMove >= (evaluation.requiredPoints || 1);

        let score = evaluation.priority * config.aggressionWeight;

        if (canCapture) {
          const captureBonus = strategy === "recapture" ? 3000 : 2000;
          score += captureBonus * config.aggressionWeight;
        } else {
          score += 150 * config.efficiencyWeight;
        }

        // History avoidance penalty
        if (config.historyAvoidance) {
          const endPos = path[path.length - 1];
          score += this.evaluatePositionHistory(
            endPos,
            board.positionsHistory,
            config
          );
        }

        // Add strategic bonuses for higher levels
        if (level === "super" || level === "ultra") {
          // Bonus for moves that cut off opponent's paths
          const opponentDistance = calculateDistance(opponentPos, center);
          const myDistance = calculateDistance(myPos, center);
          if (myDistance < opponentDistance) {
            score += 500;
          }

          // Bonus for controlling multiple centers
          const controlledCenters = board.myCenters.length;
          score += controlledCenters * 200;
        }

        score = addRandomness(score, config.randomnessFactor);

        if (score > bestScore) {
          bestScore = score;
          bestMove = center;
          bestPath = path;
          bestStrategy = canCapture ? strategy : "approach";
        }
      } else {
        // Try to move toward the center if direct path is blocked
        path = this.findBestMoveToward(
          myPos,
          center,
          blockedPositions,
          opponentBlockedArea,
          config
        );

        if (path) {
          const startDistance = calculateDistance(myPos, center);
          const endPos = path[path.length - 1];
          const endDistance = calculateDistance(endPos, center);
          const progress = startDistance - endDistance;

          let score =
            progress * 120 * config.efficiencyWeight +
            path.length * 25 * config.aggressionWeight +
            evaluation.priority * 0.5;

          // History avoidance penalty
          if (config.historyAvoidance) {
            score += this.evaluatePositionHistory(
              endPos,
              board.positionsHistory,
              config
            );
          }

          score = addRandomness(score, config.randomnessFactor);

          if (score > bestScore) {
            bestScore = score;
            bestMove = center;
            bestPath = path;
            bestStrategy = "approach";
          }
        }
      }
    }

    return {
      targetCenter: bestMove,
      path: bestPath,
      occupationPoints: bestPath ? bestPath.length : 0,
      strategy: bestStrategy,
    };
  }

  public getBestPath(board: BoardState): [number, number][] {
    const result = this.findBestMove(board);

    if (!result.path || result.path.length === 0) {
      return [];
    }

    return result.path.map((pos) => [pos.x, pos.y] as [number, number]);
  }

  public getBestMove(board: BoardState): BestMoveResult {
    return this.findBestMove(board);
  }

  public convertToArrayPath(path: Position[]): [number, number][] {
    return path.map((pos) => [pos.x, pos.y] as [number, number]);
  }
}

// Usage example:
export function bestMove(board: BoardState): [number, number][] {
  const pathfinder = new BoardGamePathfinder();
  return pathfinder.getBestPath(board);
}
