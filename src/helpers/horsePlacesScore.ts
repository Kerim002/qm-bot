import { Position } from "../types/global";

export const horsePlacesScore = ({ x, y }: Position) => {
  if (
    (x === 2 || x === 3 || x === 5 || x === 6) &&
    (y === 2 || y === 3 || y === 5 || y === 6)
  ) {
    return 50;
  } else if (
    (x === 1 || x === 4 || x === 7) &&
    (y === 1 || y === 4 || y === 7)
  ) {
    return 20;
  } else {
    return 0;
  }
};
