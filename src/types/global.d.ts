export type Position = { x: number; y: number };
export interface Board {
  blocked?: Position;
  myPos: Position;
  opponentPos: Position;
  myOP: number;
  opponentOP: number;
  myCenters: Position[];
  opponentCenters: Position[];
  level?: "high" | "middle" | "low";
}

export interface PathNode {
  pos: Position;
  path: Position[];
  steps: number;
}

export interface CenterEvaluation {
  priority: number;
  type: "owned" | "recapture" | "capture";
  requiredPoints?: number;
}

export interface BestMoveResult {
  targetCenter: Position | null;
  path: Position[] | null;
  occupationPoints: number;
  strategy: string;
}
