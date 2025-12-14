export type UnitSystem = 'metric' | 'imperial';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function lbsToKg(lbs: number): number {
  return lbs * KG_PER_LB;
}

export function kgToLbs(kg: number): number {
  return kg / KG_PER_LB;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_IN;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_IN;
}

export function roundTo1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatWeightDisplay(weightKg: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') return `${roundTo1(kgToLbs(weightKg))} lb`;
  return `${roundTo1(weightKg)} kg`;
}


