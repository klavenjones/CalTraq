/**
 * Validation constants for onboarding forms
 * These bounds are used across validation schemas and calculations
 */

export const VALIDATION_BOUNDS = {
  /** Age bounds in years */
  AGE_MIN: 13,
  AGE_MAX: 120,

  /** Weight bounds in kilograms */
  WEIGHT_MIN_KG: 20,
  WEIGHT_MAX_KG: 500,

  /** Height bounds in centimeters */
  HEIGHT_MIN_CM: 30,
  HEIGHT_MAX_CM: 300,

  /** Body fat percentage bounds */
  BODY_FAT_MIN: 0,
  BODY_FAT_MAX: 50,

  /** Minimum safe calorie threshold for adults */
  MIN_SAFE_CALORIES: 1200,

  /** Maximum reasonable calorie target */
  MAX_CALORIES: 5000,

  /** Protein target bounds in grams */
  PROTEIN_MIN_G: 20,
  PROTEIN_MAX_G: 500,
} as const;

