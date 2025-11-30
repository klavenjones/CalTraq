/**
 * Unit conversion utilities for onboarding flow
 * All values are stored in metric (kg, cm) and converted for display
 */

/** Conversion constants */
export const CONVERSION_CONSTANTS = {
  /** Kilograms to pounds */
  KG_TO_LB: 2.20462,
  /** Pounds to kilograms */
  LB_TO_KG: 1 / 2.20462,
  /** Centimeters to inches */
  CM_TO_IN: 0.393701,
  /** Inches to centimeters */
  IN_TO_CM: 1 / 0.393701,
} as const;

/**
 * Convert kilograms to pounds with 1 decimal precision
 */
export function convertKgToLb(kg: number): number {
  return Math.round(kg * CONVERSION_CONSTANTS.KG_TO_LB * 10) / 10;
}

/**
 * Convert pounds to kilograms with precision preservation
 */
export function convertLbToKg(lb: number): number {
  return lb * CONVERSION_CONSTANTS.LB_TO_KG;
}

/**
 * Convert centimeters to inches with 1 decimal precision
 */
export function convertCmToIn(cm: number): number {
  return Math.round(cm * CONVERSION_CONSTANTS.CM_TO_IN * 10) / 10;
}

/**
 * Convert inches to centimeters with precision preservation
 */
export function convertInToCm(inches: number): number {
  return inches * CONVERSION_CONSTANTS.IN_TO_CM;
}

/**
 * Onboarding data structure for unit conversion
 */
export interface OnboardingDataForConversion {
  height?: number; // in cm
  weight?: number; // in kg
  neckCircumference?: number; // in cm
  waistCircumference?: number; // in cm
  hipCircumference?: number; // in cm
}

/**
 * Convert onboarding data from one unit system to another
 * @param data - Data in current unit system (metric)
 * @param fromUnits - Current unit system
 * @param toUnits - Target unit system
 * @returns Converted data
 */
export function convertOnboardingData(
  data: OnboardingDataForConversion,
  fromUnits: 'imperial' | 'metric',
  toUnits: 'imperial' | 'metric'
): OnboardingDataForConversion {
  if (fromUnits === toUnits) {
    return { ...data };
  }

  const converted: OnboardingDataForConversion = {};

  if (data.height !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.height = convertCmToIn(data.height);
    } else {
      converted.height = convertInToCm(data.height);
    }
  }

  if (data.weight !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.weight = convertKgToLb(data.weight);
    } else {
      converted.weight = convertLbToKg(data.weight);
    }
  }

  if (data.neckCircumference !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.neckCircumference = convertCmToIn(data.neckCircumference);
    } else {
      converted.neckCircumference = convertInToCm(data.neckCircumference);
    }
  }

  if (data.waistCircumference !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.waistCircumference = convertCmToIn(data.waistCircumference);
    } else {
      converted.waistCircumference = convertInToCm(data.waistCircumference);
    }
  }

  if (data.hipCircumference !== undefined) {
    if (fromUnits === 'metric' && toUnits === 'imperial') {
      converted.hipCircumference = convertCmToIn(data.hipCircumference);
    } else {
      converted.hipCircumference = convertInToCm(data.hipCircumference);
    }
  }

  return converted;
}

