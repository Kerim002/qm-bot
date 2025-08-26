import { OccupiedPosition } from "../types/game";
import { CenterEvaluation, Position } from "../types/global";
import { positionsEqual } from "./positionsEqual";

export function evaluateCenter(
  centerPos: Position,
  myCurrentOP: number,
  opponentCenters: OccupiedPosition[],
  myCenters: OccupiedPosition[],
  level: "high" | "middle" | "low" = "high"
): CenterEvaluation {
  // Check if I already own this center
  const myOwned = myCenters.find((c) =>
    positionsEqual({ x: c.pos[0], y: c.pos[1] }, centerPos)
  );
  if (myOwned) {
    // If already mine, it can still be reinforced (max 10 OP per center)
    const remainingCapacity = 10 - myOwned.opSpent;
    return { priority: 0, type: "owned", requiredPoints: remainingCapacity };
  }

  // Check if opponent owns the center
  const opponentOwned = opponentCenters.find((c) =>
    positionsEqual({ x: c.pos[0], y: c.pos[1] }, centerPos)
  );
  if (opponentOwned) {
    let priority = 150;
    let requiredPoints = opponentOwned.opSpent + 1; // must spend more than opponent's opSpent to recapture

    switch (level) {
      case "high":
        priority = 200;
        break;
      case "middle":
        priority = 150;
        break;
      case "low":
        priority = 100;
        requiredPoints = opponentOwned.opSpent + 2; // slightly higher for low
        break;
    }

    return {
      priority,
      type: "recapture",
      requiredPoints,
    };
  }

  // Otherwise, it's free to capture
  let priority = 100;
  switch (level) {
    case "high":
      priority = 120;
      break;
    case "middle":
      priority = 100;
      break;
    case "low":
      priority = 80;
      break;
  }

  return {
    priority,
    type: "capture",
    requiredPoints: 1,
  };
}

// import { OccupiedPosition } from "../types/game";
// import { CenterEvaluation, Position } from "../types/global";
// import { positionsEqual } from "./positionsEqual";

// export function evaluateCenter(
//   centerPos: Position,
//   myCurrentOP: number,
//   opponentCenters: OccupiedPosition[],
//   myCenters: OccupiedPosition[],
//   level: "high" | "middle" | "low" = "high"
// ): CenterEvaluation {
//   if (myCenters.some((c) => positionsEqual(c, centerPos))) {
//     return { priority: 0, type: "owned" };
//   }

//   const opponentOwned = opponentCenters.find((c) =>
//     positionsEqual(c, centerPos)
//   );
//   if (opponentOwned) {
//     let priority = 150;
//     let requiredPoints = 2;

//     switch (level) {
//       case "high":
//         priority = 200;
//         requiredPoints = 2;
//         break;
//       case "middle":
//         priority = 150;
//         requiredPoints = 2;
//         break;
//       case "low":
//         priority = 100;
//         requiredPoints = 3;
//         break;
//     }

//     return {
//       priority,
//       type: "recapture",
//       requiredPoints,
//     };
//   }

//   let priority = 100;

//   switch (level) {
//     case "high":
//       priority = 120;
//       break;
//     case "middle":
//       priority = 100;
//       break;
//     case "low":
//       priority = 80;
//       break;
//   }

//   return {
//     priority,
//     type: "capture",
//     requiredPoints: 1,
//   };
// }
