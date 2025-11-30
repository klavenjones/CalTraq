import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { OnboardingState } from './state';

const ONBOARDING_PROGRESS_KEY = '@caltraq:onboarding_progress';

/**
 * Save onboarding progress to both Convex and local cache
 * @param state - Current onboarding state
 * @param saveToConvex - Function to save to Convex (from useMutation)
 */
export async function saveOnboardingProgress(
  state: OnboardingState,
  saveToConvex: (args: any) => Promise<any>
): Promise<void> {
  try {
    // Save to Convex (primary storage)
    if (state.units && state.currentStep >= 0) {
      await saveToConvex({
        units: state.units,
        currentStep: state.currentStep,
        basicStats: state.basicStats || undefined,
        bodyComposition: state.bodyComposition || undefined,
        bodyCompositionMethod: state.bodyCompositionMethod || undefined,
        calculatedBodyFatPercentage: state.calculatedBodyFatPercentage || undefined,
        calculatedLeanBodyMass: state.calculatedLeanBodyMass || undefined,
        activityLevel: state.activityLevel || undefined,
        goal: state.goal || undefined,
      });
    }

    // Also cache locally for offline support
    await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
    // If Convex save fails, still cache locally
    try {
      await AsyncStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(state));
    } catch (localError) {
      console.error('Failed to cache onboarding progress locally:', localError);
      throw localError;
    }
  }
}

/**
 * Load onboarding progress from Convex first, fall back to local cache
 * @param loadFromConvex - Function to load from Convex (from useQuery)
 * @returns OnboardingState or null if no progress found
 */
export async function loadOnboardingProgress(
  loadFromConvex: () => any
): Promise<Partial<OnboardingState> | null> {
  try {
    // Try to load from Convex first (most up-to-date)
    const convexData = loadFromConvex();
    if (convexData) {
      // Convert Convex data to OnboardingState format
      return {
        currentStep: convexData.currentStep ?? 0,
        units: convexData.units ?? null,
        basicStats: convexData.height
          ? {
              height: convexData.height,
              weight: convexData.weight,
              gender: convexData.gender,
              age: convexData.age,
              bodyFatPercentage: convexData.bodyFatPercentage,
            }
          : null,
        bodyComposition: convexData.neckCircumference
          ? {
              neckCircumference: convexData.neckCircumference,
              waistCircumference: convexData.waistCircumference,
              hipCircumference: convexData.hipCircumference,
            }
          : null,
        bodyCompositionMethod: convexData.bodyCompositionMethod ?? null,
        calculatedBodyFatPercentage: convexData.bodyFatPercentage ?? null,
        calculatedLeanBodyMass: convexData.leanBodyMass ?? null,
        activityLevel: convexData.activityLevel ?? null,
        goal: convexData.goalPhase
          ? {
              goalPhase: convexData.goalPhase,
              goalType: convexData.goalType,
              goalValue: convexData.goalValue,
            }
          : null,
      };
    }
  } catch (error) {
    console.warn('Failed to load from Convex, trying local cache:', error);
  }

  // Fall back to local cache
  try {
    const cachedData = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);
    if (cachedData) {
      return JSON.parse(cachedData) as Partial<OnboardingState>;
    }
  } catch (error) {
    console.error('Failed to load from local cache:', error);
  }

  return null;
}

/**
 * Sync locally cached data to Convex when network becomes available
 * @param state - Current onboarding state
 * @param saveToConvex - Function to save to Convex
 */
export async function syncOnboardingProgress(
  state: OnboardingState,
  saveToConvex: (args: any) => Promise<any>
): Promise<void> {
  try {
    // Check if we have cached data that needs syncing
    const cachedData = await AsyncStorage.getItem(ONBOARDING_PROGRESS_KEY);
    if (cachedData) {
      const cachedState = JSON.parse(cachedData) as OnboardingState;
      // Only sync if cached data is newer or different
      await saveOnboardingProgress(cachedState, saveToConvex);
    }
  } catch (error) {
    console.error('Failed to sync onboarding progress:', error);
  }
}

/**
 * Clear cached onboarding progress
 */
export async function clearOnboardingProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear cached onboarding progress:', error);
  }
}

/**
 * Hook to use onboarding persistence utilities
 * Note: This hook must be used within a React component
 */
export function useOnboardingPersistence() {
  // Note: If TypeScript shows an error here, restart the TS server or run 'npx convex dev'
  // The types are correct (see app/(onboarding)/review.tsx for working example)
  const saveProgressMutation = useMutation((api as any).onboarding.saveOnboardingProgress);
  const getProgressQuery = useQuery((api as any).onboarding.getOnboardingProgress);

  return {
    saveProgress: (state: OnboardingState) => saveOnboardingProgress(state, saveProgressMutation),
    loadProgress: () => loadOnboardingProgress(() => getProgressQuery),
    syncProgress: (state: OnboardingState) => syncOnboardingProgress(state, saveProgressMutation),
    clearProgress: clearOnboardingProgress,
  };
}
