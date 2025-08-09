import { Player, Position } from "./position";

function isValidMove(from: Position, to: Position): boolean {
  // Implement your game-specific movement rules
  return true;
}

function isWithinBounds(pos: Position): boolean {
  // Example board size: 9x9
  return pos.row >= 0 && pos.row < 9 && pos.col >= 0 && pos.col < 9;
}

function isMoveValid(
  pos: Position,
  from: Position,
  opponentPosition: Position,
  players: Player[]
): boolean {
  const occupied = new Set(players.map((p) => p.position.key()));
  const opposition = Position.oppositionPositions(opponentPosition);
  const center = new Position(4, 4);

  return (
    isValidMove(from, pos) &&
    isWithinBounds(pos) &&
    !occupied.has(pos.key()) &&
    !opposition.has(pos.key()) &&
    !pos.equals(center)
  );
}

function getValidMovePositions(
  from: Position,
  opponentPosition: Position,
  players: Player[]
): Set<string> {
  const result = new Set<string>();
  const occupied = new Set(players.map((p) => p.position.key()));
  const opposition = Position.oppositionPositions(opponentPosition);
  const center = new Position(4, 4);

  for (let x = from.row - 3; x <= from.row + 3; x++) {
    for (let y = from.col - 3; y <= from.col + 3; y++) {
      const pos = new Position(x, y);
      if (
        isValidMove(from, pos) &&
        isWithinBounds(pos) &&
        !occupied.has(pos.key()) &&
        !opposition.has(pos.key()) &&
        !pos.equals(center)
      ) {
        result.add(pos.key());
      }
    }
  }

  return result;
}

function getClosestPositionsToDestination(
  positions: Position[],
  destination: Position
): Position[] {
  let min = 3;
  let result: Position[] = [positions[0]];

  for (const pos of positions) {
    const dist = destination.distanceTo(pos);
    if (dist < min) {
      min = dist;
      result = [pos];
    } else if (dist === min) {
      result.push(pos);
    }
  }

  return result;
}

function distanceToPlayer(destination: Position): number {
  // Replace with actual logic
  return 5;
}

export function calculateMovePath(
  _currentPlayer: Player,
  destination: Position,
  opponent: Player,
  players: Player[]
): Position[] {
  const movePath: Position[] = [];
  let startPosition = _currentPlayer.position;

  for (let i = 0; i < distanceToPlayer(destination); i++) {
    const adjacentPositions = startPosition.getAdjacentPositions();

    const validPositions = adjacentPositions.filter((pos) =>
      isMoveValid(pos, startPosition, opponent.position, players)
    );

    const closestPositions = getClosestPositionsToDestination(
      validPositions,
      destination
    );
    const availablePositions = closestPositions.length;

    if (availablePositions === 0) break;

    const randomIndex = Math.floor(Math.random() * availablePositions);
    startPosition = closestPositions[randomIndex];
    movePath.push(startPosition);
  }

  return movePath;
}
