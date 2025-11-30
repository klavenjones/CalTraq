/**
 * Katch–McArdle BMR and TDEE calculation utilities
 * Based on lean body mass (LBM) for more accurate calorie calculations
 */

/**
 * Activity multiplier constants for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;

/**
 * Goal phase adjustment constants for calorie targets
 */
export const GOAL_PHASE_ADJUSTMENTS = {
  slow: 0.9, // -10%
  moderate: 0.8, // -20%
  aggressive: 0.7, // -30%
  maintenance: 1.0, // 0%
} as const;

export type GoalPhase = keyof typeof GOAL_PHASE_ADJUSTMENTS;

/**
 * Protein multiplier constants (grams per kg of body weight)
 */
export const PROTEIN_MULTIPLIERS = {
  slow: 1.6,
  moderate: 1.8,
  aggressive: 2.2,
  maintenance: 1.8,
} as const;

/**
 * Calculate Basal Metabolic Rate (BMR) using Katch–McArdle formula
 * BMR = 370 + (21.6 × LBM in kg)
 * @param leanBodyMassKg - Lean body mass in kilograms
 * @returns BMR in calories per day
 */
export function calculateBMR(leanBodyMassKg: number): number {
  return 370 + 21.6 * leanBodyMassKg;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 * @param bmr - Basal Metabolic Rate in calories
 * @param activityLevel - Activity level
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return bmr * multiplier;
}

/**
 * Calculate goal calories with phase adjustment
 * Goal Calories = TDEE × Goal Phase Adjustment
 * @param tdee - Total Daily Energy Expenditure in calories
 * @param goalPhase - Goal phase (slow, moderate, aggressive, maintenance)
 * @returns Goal calories per day
 */
export function calculateGoalCalories(tdee: number, goalPhase: GoalPhase): number {
  const adjustment = GOAL_PHASE_ADJUSTMENTS[goalPhase];
  return Math.round(tdee * adjustment);
}

/**
 * Calculate protein target based on body weight and goal phase
 * Protein Target = Weight (kg) × Protein Multiplier
 * @param weightKg - Body weight in kilograms
 * @param goalPhase - Goal phase
 * @returns Protein target in grams per day
 */
export function calculateProteinTarget(weightKg: number, goalPhase: GoalPhase): number {
  const multiplier = PROTEIN_MULTIPLIERS[goalPhase];
  return Math.round(weightKg * multiplier);
}

