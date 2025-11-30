# Research: Caltraq Onboarding Flow

**Feature**: Onboarding Flow  
**Date**: 2025-01-27  
**Status**: Complete

This document consolidates research findings for technical decisions required to implement the onboarding flow feature.

## 1. Form Validation with Zod

**Decision**: Use Zod for runtime form validation in React Native forms.

**Rationale**:

- Zod provides type-safe schema validation that integrates well with TypeScript
- Can generate TypeScript types from schemas using `z.infer<>`
- Clear, composable validation rules with helpful error messages
- Lightweight and performant for mobile applications
- Aligns with Constitution Principle 5 (robust runtime validation)

**Implementation Pattern**:

```typescript
import { z } from 'zod';

export const basicStatsSchema = z.object({
  height: z.number().positive().min(30).max(300), // cm
  weight: z.number().positive().min(20).max(500), // kg
  age: z.number().int().min(13).max(120),
  gender: z.enum(['male', 'female', 'other']),
  bodyFatPercentage: z.number().min(0).max(50).optional(),
});

export type BasicStats = z.infer<typeof basicStatsSchema>;
```

**Alternatives Considered**:

- Yup: Similar to Zod but less TypeScript-friendly
- Manual validation: Too error-prone and harder to maintain
- React Hook Form with Zod: Could be added later if form complexity increases

**References**:

- Zod documentation: https://zod.dev/
- React Native form validation patterns

## 2. Form State Management with React Context + useReducer

**Decision**: Use React Context with useReducer for managing multi-step onboarding form state.

**Rationale**:

- Avoids prop drilling across 6-7 screens
- Centralized state management makes it easier to persist and restore progress
- useReducer provides predictable state updates for complex form logic
- Supports backward navigation with preserved state
- Aligns with Constitution Principle 3 (structured state management)

**Implementation Pattern**:

```typescript
type OnboardingState = {
  currentStep: number;
  units: 'imperial' | 'metric';
  basicStats: BasicStats | null;
  bodyComposition: BodyComposition | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
};

type OnboardingAction =
  | { type: 'SET_UNITS'; payload: 'imperial' | 'metric' }
  | { type: 'SET_BASIC_STATS'; payload: BasicStats }
  | { type: 'GO_TO_STEP'; payload: number };
// ... other actions

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  // Reducer logic
}
```

**Alternatives Considered**:

- useState in each component: Would require prop drilling and lose state on navigation
- Redux: Overkill for a single flow, adds unnecessary complexity
- Zustand: Could work but Context + useReducer is more aligned with existing patterns

**References**:

- React Context API: https://react.dev/reference/react/useContext
- useReducer patterns: https://react.dev/reference/react/useReducer

## 3. Katch–McArdle Formula Implementation

**Decision**: Implement Katch–McArdle BMR calculation with TDEE multipliers and goal phase adjustments.

**Rationale**:

- Katch–McArdle is more accurate than Harris–Benedict for users with known body fat percentage
- Formula: BMR = 370 + (21.6 × LBM in kg)
- TDEE = BMR × Activity Multiplier
- Goal adjustments: Slow (-10%), Moderate (-20%), Aggressive (-30%), Maintenance (0%)

**Implementation Details**:

```typescript
// BMR calculation (requires lean body mass in kg)
function calculateBMR(leanBodyMassKg: number): number {
  return 370 + 21.6 * leanBodyMassKg;
}

// TDEE calculation
function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

// Goal-adjusted calories
function calculateGoalCalories(tdee: number, goalPhase: GoalPhase): number {
  const adjustments = {
    slow: 0.9, // -10%
    moderate: 0.8, // -20%
    aggressive: 0.7, // -30%
    maintenance: 1.0, // 0%
  };
  return Math.round(tdee * adjustments[goalPhase]);
}

// Protein target: 1.6-2.2g per kg body weight (or 0.8-1.0g per lb)
function calculateProteinTarget(weightKg: number, goalPhase: GoalPhase): number {
  const proteinPerKg = goalPhase === 'aggressive' ? 2.2 : 1.8;
  return Math.round(weightKg * proteinPerKg);
}
```

**Safety Constraints**:

- Minimum safe calories: 1200 for adults (warn if below)
- Maximum reasonable calories: 5000 (warn if above)
- Protein range: 0.8-2.2g per kg body weight

**References**:

- Katch–McArdle equation: https://en.wikipedia.org/wiki/Basal_metabolic_rate
- TDEE multipliers: Standard activity level classifications
- Protein recommendations: International Society of Sports Nutrition guidelines

## 4. Body Fat Percentage Calculation (U.S. Navy Method)

**Decision**: Use U.S. Navy body fat calculation formulas for male and female users.

**Rationale**:

- U.S. Navy method is well-validated and commonly used
- Requires only neck, waist, and (for females) hip measurements
- Provides reasonable accuracy for most users
- Formulas are publicly available and well-documented

**Implementation Details**:

```typescript
// Male formula (all measurements in cm)
function calculateBodyFatMale(neckCm: number, waistCm: number, heightCm: number): number {
  const bodyFat =
    495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  return Math.max(0, Math.min(50, bodyFat)); // Clamp to reasonable range
}

// Female formula (all measurements in cm)
function calculateBodyFatFemale(
  neckCm: number,
  waistCm: number,
  hipCm: number,
  heightCm: number
): number {
  const bodyFat =
    495 /
      (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) -
    450;
  return Math.max(0, Math.min(50, bodyFat)); // Clamp to reasonable range
}

// Lean body mass calculation
function calculateLeanBodyMass(weightKg: number, bodyFatPercentage: number): number {
  return weightKg * (1 - bodyFatPercentage / 100);
}
```

**Validation**:

- Body fat percentage must be between 0-50% (physiologically reasonable)
- Measurements must be positive and within reasonable bounds
- Waist > neck (logical constraint)

**References**:

- U.S. Navy body fat calculator: https://www.calculator.net/body-fat-calculator.html
- Body composition research papers

## 5. Unit Conversion with Precision Preservation

**Decision**: Store all values in metric (SI units) internally, convert for display only.

**Rationale**:

- Avoids precision loss from multiple conversions
- Simplifies calculations (all formulas use metric)
- Single source of truth for data storage
- Conversion only happens at UI layer

**Implementation Pattern**:

```typescript
// Conversion constants
const CONVERSIONS = {
  kgToLb: 2.20462,
  lbToKg: 0.453592,
  cmToIn: 0.393701,
  inToCm: 2.54,
} as const;

// Conversion functions (round to 1 decimal for display)
function convertKgToLb(kg: number): number {
  return Math.round(kg * CONVERSIONS.kgToLb * 10) / 10;
}

function convertLbToKg(lb: number): number {
  return Math.round(lb * CONVERSIONS.lbToKg * 10) / 10;
}

function convertCmToIn(cm: number): number {
  return Math.round(cm * CONVERSIONS.cmToIn * 10) / 10;
}

function convertInToCm(inches: number): number {
  return Math.round(inches * CONVERSIONS.inToCm * 10) / 10;
}

// When user changes units mid-flow, convert existing values
function convertOnboardingData(
  data: OnboardingState,
  newUnits: 'imperial' | 'metric'
): OnboardingState {
  if (data.units === newUnits) return data;

  // Convert all measurements to new unit system
  // Store always in metric internally
}
```

**Precision Handling**:

- Store in metric with full precision (floats)
- Display conversions rounded to 1 decimal place for readability
- When converting back, use stored metric value (not displayed converted value)

**References**:

- Unit conversion standards: NIST guidelines
- Precision best practices for health data

## 6. Offline-First Data Persistence with Convex

**Decision**: Implement incremental saves to Convex with local caching using AsyncStorage for offline support.

**Rationale**:

- Convex provides real-time sync and automatic conflict resolution
- AsyncStorage provides local persistence for offline scenarios
- Incremental saves reduce data loss risk
- Local cache allows resume even if network is temporarily unavailable

**Implementation Pattern**:

```typescript
// Save progress after each screen
async function saveOnboardingProgress(state: OnboardingState, userId: string): Promise<void> {
  try {
    // Save to Convex (primary)
    await convex.mutation(api.onboarding.saveProgress, {
      userId,
      progress: state,
    });

    // Also cache locally for offline support
    await AsyncStorage.setItem(`onboarding_${userId}`, JSON.stringify(state));
  } catch (error) {
    // If Convex fails, still save locally
    await AsyncStorage.setItem(
      `onboarding_${userId}`,
      JSON.stringify({ ...state, _needsSync: true })
    );
    throw error;
  }
}

// Load progress on app start
async function loadOnboardingProgress(userId: string): Promise<OnboardingState | null> {
  // Try Convex first
  try {
    const progress = await convex.query(api.onboarding.getProgress, { userId });
    if (progress) return progress;
  } catch (error) {
    // Fall back to local cache
  }

  // Fall back to local cache
  const cached = await AsyncStorage.getItem(`onboarding_${userId}`);
  if (cached) {
    const state = JSON.parse(cached);
    // If marked as needing sync, attempt to sync in background
    if (state._needsSync) {
      syncOnboardingProgress(state, userId).catch(console.error);
    }
    return state;
  }

  return null;
}
```

**Sync Strategy**:

- Save to Convex immediately when online
- Cache locally as backup
- On app start, prefer Convex but fall back to cache
- Background sync for cached data marked as `_needsSync`

**References**:

- Convex documentation: https://docs.convex.dev/
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- Offline-first patterns for React Native

## 7. Expo Router Navigation Patterns for Multi-Step Flows

**Decision**: Use Expo Router file-based routing with programmatic navigation and route parameters for onboarding flow.

**Rationale**:

- Expo Router provides type-safe navigation with file-based routing
- Supports deep linking to specific steps
- Back navigation handled automatically by React Navigation
- Can use route params to pass minimal state (prefer Context for full state)

**Implementation Pattern**:

```typescript
// Route structure
app / onboarding / _layout.tsx; // Progress indicator, back button handling
welcome.tsx;
units.tsx;
basic - stats.tsx;
body - composition.tsx;
activity - level.tsx;
goal.tsx;
review.tsx;

// Navigation helper
function useOnboardingNavigation() {
  const router = useRouter();
  const steps = [
    'welcome',
    'units',
    'basic-stats',
    'body-composition',
    'activity-level',
    'goal',
    'review',
  ];

  const goToStep = (stepIndex: number) => {
    router.push(`/(onboarding)/${steps[stepIndex]}`);
  };

  const goNext = () => {
    const current = steps.findIndex((s) => router.pathname.includes(s));
    if (current < steps.length - 1) {
      goToStep(current + 1);
    }
  };

  const goBack = () => {
    router.back();
  };

  return { goToStep, goNext, goBack };
}
```

**Deep Linking Support**:

- Support URLs like `/onboarding/activity-level` for direct navigation
- Validate user has completed prerequisite steps
- Redirect to appropriate step if prerequisites not met

**References**:

- Expo Router documentation: https://docs.expo.dev/router/introduction/
- React Navigation: https://reactnavigation.org/

## 8. Modular Code Architecture Patterns

**Decision**: Organize code into clear layers: screens, components, utilities, and business logic.

**Rationale**:

- Aligns with Constitution Principle 1 (modular, maintainable code)
- Clear separation of concerns: UI, validation, calculations, persistence
- Easy to test each layer independently
- Reusable utilities can be shared across features

**Architecture Layers**:

1. **Screens** (`app/(onboarding)/`): Route handlers, minimal logic, compose components
2. **Components** (`components/onboarding/`): Reusable form components, presentation logic
3. **Validation** (`lib/validation/`): Zod schemas, validation utilities
4. **Calculations** (`lib/calculations/`): Pure functions for BMR, TDEE, body fat, conversions
5. **State Management** (`lib/onboarding/state.ts`): Context, reducer, types
6. **Persistence** (`lib/onboarding/persistence.ts`): Save/load logic, sync utilities
7. **Convex Functions** (`convex/onboarding.ts`): Backend mutations and queries

**Testing Strategy**:

- Unit tests for pure functions (calculations, validation)
- Component tests for form components
- Integration tests for navigation flow
- E2E tests for complete onboarding flow

**References**:

- Clean Architecture principles
- React Native best practices
- Modular design patterns

## Summary

All technical decisions have been researched and documented. The implementation will use:

- **Zod** for form validation
- **React Context + useReducer** for state management
- **Katch–McArdle formula** for metabolic calculations
- **U.S. Navy method** for body fat calculations
- **Metric-first storage** with display conversions
- **Convex + AsyncStorage** for offline-first persistence
- **Expo Router** for navigation
- **Modular architecture** with clear separation of concerns

All decisions align with the CalTraq Constitution and emphasize clean, maintainable, and modular code standards.
