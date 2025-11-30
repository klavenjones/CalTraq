/**
 * Body fat percentage calculation using U.S. Navy method
 * All measurements must be in centimeters
 */

import { VALIDATION_BOUNDS } from '../validation/constants';

/**
 * Calculate body fat percentage for males using U.S. Navy formula
 * Formula: bodyFatPercentage = 495 / (1.0324 - 0.19077 × log₁₀(waist - neck) + 0.15456 × log₁₀(height)) - 450
 * @param heightCm - Height in centimeters
 * @param neckCm - Neck circumference in centimeters
 * @param waistCm - Waist circumference in centimeters
 * @returns Body fat percentage (0-50%)
 */
export function calculateBodyFatMale(
  heightCm: number,
  neckCm: number,
  waistCm: number
): number {
  const logWaistNeck = Math.log10(waistCm - neckCm);
  const logHeight = Math.log10(heightCm);
  const denominator = 1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight;
  const bodyFat = 495 / denominator - 450;

  // Clamp to physiologically reasonable range
  return Math.max(
    VALIDATION_BOUNDS.BODY_FAT_MIN,
    Math.min(VALIDATION_BOUNDS.BODY_FAT_MAX, bodyFat)
  );
}

/**
 * Calculate body fat percentage for females using U.S. Navy formula
 * Formula: bodyFatPercentage = 495 / (1.29579 - 0.35004 × log₁₀(waist + hip - neck) + 0.221 × log₁₀(height)) - 450
 * @param heightCm - Height in centimeters
 * @param neckCm - Neck circumference in centimeters
 * @param waistCm - Waist circumference in centimeters
 * @param hipCm - Hip circumference in centimeters
 * @returns Body fat percentage (0-50%)
 */
export function calculateBodyFatFemale(
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm: number
): number {
  const logWaistHipNeck = Math.log10(waistCm + hipCm - neckCm);
  const logHeight = Math.log10(heightCm);
  const denominator = 1.29579 - 0.35004 * logWaistHipNeck + 0.221 * logHeight;
  const bodyFat = 495 / denominator - 450;

  // Clamp to physiologically reasonable range
  return Math.max(
    VALIDATION_BOUNDS.BODY_FAT_MIN,
    Math.min(VALIDATION_BOUNDS.BODY_FAT_MAX, bodyFat)
  );
}

/**
 * Calculate body fat percentage with gender-based routing
 * For "other" gender, uses male formula as default
 * @param gender - Gender ('male', 'female', 'other')
 * @param heightCm - Height in centimeters
 * @param neckCm - Neck circumference in centimeters
 * @param waistCm - Waist circumference in centimeters
 * @param hipCm - Hip circumference in centimeters (required for females)
 * @returns Body fat percentage (0-50%)
 */
export function calculateBodyFat(
  gender: 'male' | 'female' | 'other',
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm?: number
): number {
  if (gender === 'female') {
    if (hipCm === undefined) {
      throw new Error('Hip circumference is required for female body fat calculation');
    }
    return calculateBodyFatFemale(heightCm, neckCm, waistCm, hipCm);
  }

  // Use male formula for males and "other" gender
  return calculateBodyFatMale(heightCm, neckCm, waistCm);
}

/**
 * Calculate lean body mass from weight and body fat percentage
 * LBM = weight × (1 - bodyFatPercentage / 100)
 * @param weightKg - Body weight in kilograms
 * @param bodyFatPercentage - Body fat percentage (0-50)
 * @returns Lean body mass in kilograms
 */
export function calculateLeanBodyMass(weightKg: number, bodyFatPercentage: number): number {
  // Clamp body fat percentage to valid range
  const clampedBodyFat = Math.max(
    VALIDATION_BOUNDS.BODY_FAT_MIN,
    Math.min(VALIDATION_BOUNDS.BODY_FAT_MAX, bodyFatPercentage)
  );

  return weightKg * (1 - clampedBodyFat / 100);
}

