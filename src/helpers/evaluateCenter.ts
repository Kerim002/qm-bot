import { CenterEvaluation, Position } from "../types/global";
import { positionsEqual } from "./positionsEqual";

export function evaluateCenter(
  centerPos: Position,
  myCurrentOP: number,
  opponentCenters: Position[],
  myCenters: Position[],
  level: "high" | "middle" | "low" = "high"
): CenterEvaluation {
  if (myCenters.some((c) => positionsEqual(c, centerPos))) {
    return { priority: 0, type: "owned" };
  }

  const opponentOwned = opponentCenters.find((c) =>
    positionsEqual(c, centerPos)
  );
  if (opponentOwned) {
    let priority = 150;
    let requiredPoints = 2;

    switch (level) {
      case "high":
        priority = 200;
        requiredPoints = 2;
        break;
      case "middle":
        priority = 150;
        requiredPoints = 2;
        break;
      case "low":
        priority = 100;
        requiredPoints = 3;
        break;
    }

    return {
      priority,
      type: "recapture",
      requiredPoints,
    };
  }

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
