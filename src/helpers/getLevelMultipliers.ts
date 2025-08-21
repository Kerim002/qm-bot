export function getLevelMultipliers(
  level: "high" | "middle" | "low" = "high"
): {
  aggression: number;
  riskTaking: number;
  efficiency: number;
} {
  //   switch (level) {
  //     case "high":
  //       return {
  //         aggression: 1.5,
  //         riskTaking: 1.2,
  //         efficiency: 1.3,
  //       };
  //     case "middle":
  //       return {
  //         aggression: 1.0,
  //         riskTaking: 1.0,
  //         efficiency: 1.0,
  //       };
  //     case "low":
  //       return {
  //         aggression: 0.7,
  //         riskTaking: 0.8,
  //         efficiency: 0.9,
  //       };
  //   }

  switch (level) {
    case "high":
      return {
        aggression: 2.5,
        riskTaking: 1.2,
        efficiency: 1.7,
      };
    case "middle":
      return {
        aggression: 1.0,
        riskTaking: 1.0,
        efficiency: 1.0,
      };
    case "low":
      return {
        aggression: 0.7,
        riskTaking: 0.8,
        efficiency: 0.9,
      };
  }
  //   switch (level) {
  //     case "high":
  //       return {
  //         aggression: 1,
  //         riskTaking: 1,
  //         efficiency: 1,
  //       };
  //     case "middle":
  //       return {
  //         aggression: 0.7,
  //         riskTaking: 0.8,
  //         efficiency: 0.9,
  //       };
  //     case "low":
  //       return {
  //         aggression: 0.3,
  //         riskTaking: 0.2,
  //         efficiency: 0.2,
  //       };
  //   }
}
