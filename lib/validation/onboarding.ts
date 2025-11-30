import { z } from 'zod';
import { VALIDATION_BOUNDS } from './constants';

/**
 * Basic stats validation schema
 * Validates height, weight, gender, age, and optional body fat percentage
 */
export const basicStatsSchema = z.object({
  height: z
    .number()
    .positive()
    .min(VALIDATION_BOUNDS.HEIGHT_MIN_CM)
    .max(VALIDATION_BOUNDS.HEIGHT_MAX_CM),
  weight: z
    .number()
    .positive()
    .min(VALIDATION_BOUNDS.WEIGHT_MIN_KG)
    .max(VALIDATION_BOUNDS.WEIGHT_MAX_KG),
  gender: z.enum(['male', 'female', 'other']),
  age: z
    .number()
    .int()
    .min(VALIDATION_BOUNDS.AGE_MIN)
    .max(VALIDATION_BOUNDS.AGE_MAX),
  bodyFatPercentage: z
    .number()
    .min(VALIDATION_BOUNDS.BODY_FAT_MIN)
    .max(VALIDATION_BOUNDS.BODY_FAT_MAX)
    .optional(),
});

export type BasicStats = z.infer<typeof basicStatsSchema>;

/**
 * Body composition validation schema
 * Validates neck, waist, and optional hip measurements (for females)
 */
export const bodyCompositionSchema = z.object({
  neckCircumference: z.number().positive(),
  waistCircumference: z.number().positive(),
  hipCircumference: z.number().positive().optional(),
});

export type BodyComposition = z.infer<typeof bodyCompositionSchema>;

/**
 * Activity level validation schema
 */
export const activityLevelSchema = z.enum([
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
]);

export type ActivityLevel = z.infer<typeof activityLevelSchema>;

/**
 * Goal configuration validation schema
 * Validates goal phase, type, and value
 */
export const goalConfigurationSchema = z.object({
  goalPhase: z.enum(['slow', 'moderate', 'aggressive', 'maintenance']),
  goalType: z.enum(['weekly_change', 'target_weight']),
  goalValue: z.number().positive(),
});

export type GoalConfiguration = z.infer<typeof goalConfigurationSchema>;

