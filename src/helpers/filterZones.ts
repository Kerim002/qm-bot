import { OCCUPATION_CENTERS } from "../constants/gameConstants";
import { ZoneSchema } from "../types/game";

export const filterZones = (
  array: ZoneSchema[]
): (ZoneSchema & { position: number[] })[] => {
  const filterBlocks = array.filter((item) => item.subject_key);

  const adjustBlocks: (ZoneSchema & { position: number[] })[] =
    filterBlocks.map((item) => {
      if (item.block > 4) {
        return {
          block: item.block,
          occupant_id: item.occupant_id,
          occupation_points: item.occupation_points,
          subject_key: item.subject_key,
          subject_name: item.subject_name,
          position: [
            OCCUPATION_CENTERS[item.block - 1][0],
            OCCUPATION_CENTERS[item.block - 1][1],
          ],
        };
      } else {
        return {
          ...item,
          position: [
            OCCUPATION_CENTERS[item.block][0],
            OCCUPATION_CENTERS[item.block][1],
          ],
        };
      }
    });

  return adjustBlocks; // Changed from return adjustBlocks()
};
