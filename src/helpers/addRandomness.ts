export function addRandomness(
  score: number,
  level: "high" | "middle" | "low" = "high"
): number {
  let randomFactor = 0;
  //original
  switch (level) {
    case "high":
      randomFactor = 0.05;
      break;
    case "middle":
      randomFactor = 0.15;
      break;
    case "low":
      randomFactor = 0.25;
      break;
  }

  // switch (level) {
  //   case "high":
  //     randomFactor = 0.01;
  //     break;
  //   case "middle":
  //     randomFactor = 0.15;
  //     break;
  //   case "low":
  //     randomFactor = 0.25;
  //     break;
  // }

  //low

  // switch (level) {
  //   case "high":
  //     randomFactor = 0.15;
  //     break;
  //   case "middle":
  //     randomFactor = 0.35;
  //     break;
  //   case "low":
  //     randomFactor = 0.65;
  //     break;
  // }

  const randomMultiplier = 1 + (Math.random() - 0.5) * randomFactor;
  return score * randomMultiplier;
}
