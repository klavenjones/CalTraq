export function todayYyyyMmDd(): string {
  return new Date().toISOString().slice(0, 10);
}


