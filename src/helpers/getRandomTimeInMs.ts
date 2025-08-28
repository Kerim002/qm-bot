export function getRandomTimeInMs(start: number, end: number): number {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const random = Math.random() * (max - min) + min;
  return random * 1000;
}
