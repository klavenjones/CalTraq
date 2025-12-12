import type { ActivityLevel, Goal } from '@/lib/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  not_very_active: 1.2,
  lightly_active: 1.375,
  active: 1.55,
  very_active: 1.725,
};

export function calculateLeanBodyMassKg(weightKg: number, bodyFatPercentage: number): number {
  const bf = clamp(bodyFatPercentage, 0, 100) / 100;
  return weightKg * (1 - bf);
}

// Katch–McArdle (uses lean body mass in kg)
export function calculateBmrKatchMcArdle(leanBodyMassKg: number): number {
  return 370 + 21.6 * leanBodyMassKg;
}

export function calculateEstimatedTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateDailyCalorieTarget(estimatedTdee: number, goal: Goal): number {
  switch (goal) {
    case 'lose':
      return estimatedTdee - 500;
    case 'gain':
      return estimatedTdee + 500;
    case 'maintain':
    default:
      return estimatedTdee;
  }
}

// Simple default: 2.2g/kg bodyweight (≈1g/lb)
export function calculateDailyProteinTargetGrams(weightKg: number): number {
  return Math.round(weightKg * 2.2);
}

export type TdeeEstimationLog = {
  date: string; // YYYY-MM-DD
  calories?: number;
  weight?: number; // kg
};

/**
 * Estimate "real world" TDEE from intake and weight change:
 * TDEE ≈ avgCalories - (ΔweightKgPerDay * 7700)
 *
 * Requires at least 7 days between first and last weight entries and
 * at least 5 days of calorie entries (within that window).
 */
export function estimateRealWorldTdeeKcal(recentLogs: TdeeEstimationLog[]): number | undefined {
  const logs = [...recentLogs].sort((a, b) => a.date.localeCompare(b.date));

  const start = logs.find((l) => typeof l.weight === 'number');
  const end = [...logs].reverse().find((l) => typeof l.weight === 'number');
  if (!start || !end) return undefined;

  const startDate = parseYyyyMmDdUtc(start.date);
  const endDate = parseYyyyMmDdUtc(end.date);
  if (!startDate || !endDate) return undefined;

  const daysBetween = diffDaysUtc(startDate, endDate);
  if (daysBetween < 7) return undefined;

  const windowLogs = logs.filter((l) => l.date >= start.date && l.date <= end.date);
  const calorieDays = windowLogs.filter((l) => typeof l.calories === 'number') as Array<
    TdeeEstimationLog & { calories: number }
  >;
  if (calorieDays.length < 5) return undefined;

  const avgCalories = calorieDays.reduce((sum, l) => sum + l.calories, 0) / calorieDays.length;
  const weightChangeKgPerDay = ((end.weight as number) - (start.weight as number)) / daysBetween;

  const tdee = avgCalories - weightChangeKgPerDay * 7700;
  return Number.isFinite(tdee) ? tdee : undefined;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseYyyyMmDdUtc(date: string): Date | undefined {
  // Avoid local timezone shifting
  const d = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function diffDaysUtc(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}


