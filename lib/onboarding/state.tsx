import * as React from 'react';
import type {
  ActivityLevel,
  BasicStats,
  BodyComposition,
  GoalConfiguration,
} from '../validation/onboarding';

/**
 * Onboarding state structure
 * Tracks all data collected during the onboarding flow
 */
export interface OnboardingState {
  /** Current step index (0-6) */
  currentStep: number;
  /** Unit preference */
  units: 'imperial' | 'metric' | null;
  /** Basic stats (height, weight, gender, age, optional body fat) */
  basicStats: BasicStats | null;
  /** Body composition measurements */
  bodyComposition: BodyComposition | null;
  /** Body composition method */
  bodyCompositionMethod: 'manual' | 'calculated' | null;
  /** Activity level */
  activityLevel: ActivityLevel | null;
  /** Goal configuration */
  goal: GoalConfiguration | null;
  /** Calculated body fat percentage (if calculated) */
  calculatedBodyFatPercentage: number | null;
  /** Calculated lean body mass */
  calculatedLeanBodyMass: number | null;
}

/**
 * Onboarding action types
 */
export type OnboardingAction =
  | { type: 'SET_UNITS'; payload: 'imperial' | 'metric' }
  | { type: 'SET_BASIC_STATS'; payload: BasicStats }
  | { type: 'SET_BODY_COMPOSITION'; payload: BodyComposition }
  | { type: 'SET_BODY_COMPOSITION_METHOD'; payload: 'manual' | 'calculated' }
  | { type: 'SET_CALCULATED_BODY_FAT'; payload: number }
  | { type: 'SET_CALCULATED_LEAN_BODY_MASS'; payload: number }
  | { type: 'SET_ACTIVITY_LEVEL'; payload: ActivityLevel }
  | { type: 'SET_GOAL'; payload: GoalConfiguration }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_STATE'; payload: Partial<OnboardingState> };

/**
 * Initial onboarding state
 */
export const initialOnboardingState: OnboardingState = {
  currentStep: 0,
  units: null,
  basicStats: null,
  bodyComposition: null,
  bodyCompositionMethod: null,
  activityLevel: null,
  goal: null,
  calculatedBodyFatPercentage: null,
  calculatedLeanBodyMass: null,
};

/**
 * Onboarding reducer function
 * Handles all state updates for the onboarding flow
 */
export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState {
  switch (action.type) {
    case 'SET_UNITS':
      return { ...state, units: action.payload };

    case 'SET_BASIC_STATS':
      return { ...state, basicStats: action.payload };

    case 'SET_BODY_COMPOSITION':
      return { ...state, bodyComposition: action.payload };

    case 'SET_BODY_COMPOSITION_METHOD':
      return { ...state, bodyCompositionMethod: action.payload };

    case 'SET_CALCULATED_BODY_FAT':
      return { ...state, calculatedBodyFatPercentage: action.payload };

    case 'SET_CALCULATED_LEAN_BODY_MASS':
      return { ...state, calculatedLeanBodyMass: action.payload };

    case 'SET_ACTIVITY_LEVEL':
      return { ...state, activityLevel: action.payload };

    case 'SET_GOAL':
      return { ...state, goal: action.payload };

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };

    case 'RESET_STATE':
      return initialOnboardingState;

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

/**
 * Onboarding form context type
 */
interface OnboardingFormContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
}

/**
 * Onboarding form context
 */
export const OnboardingFormContext = React.createContext<OnboardingFormContextType | null>(
  null
);

/**
 * Onboarding form context provider component
 */
export function OnboardingFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(onboardingReducer, initialOnboardingState);

  const value = React.useMemo(() => ({ state, dispatch }), [state]);

  return (
    <OnboardingFormContext.Provider value={value}>{children}</OnboardingFormContext.Provider>
  );
}

/**
 * Hook to access onboarding form context
 * @throws Error if used outside OnboardingFormProvider
 */
export function useOnboardingForm() {
  const context = React.useContext(OnboardingFormContext);
  if (!context) {
    throw new Error('useOnboardingForm must be used within OnboardingFormProvider');
  }
  return context;
}

