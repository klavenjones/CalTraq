# Quickstart: Caltraq Onboarding Flow

**Feature**: Onboarding Flow  
**Date**: 2025-01-27  
**Status**: Implementation Guide

This guide provides a quick overview of the onboarding flow implementation for developers.

## Overview

The onboarding flow collects user data across 6-7 screens to calculate personalized calorie and protein targets using the Katch–McArdle formula. The flow supports incremental progress saving, backward navigation, unit conversion, and resume capability.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  app/(onboarding)/*.tsx - Screen components             │
│  components/onboarding/*.tsx - Form components          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              State Management                            │
│  lib/onboarding/state.ts - Context + useReducer       │
│  lib/onboarding/persistence.ts - Save/load logic        │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Business Logic                             │
│  lib/validation/onboarding.ts - Zod schemas           │
│  lib/calculations/*.ts - BMR, TDEE, body fat, etc.    │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Data Persistence                           │
│  convex/onboarding.ts - Convex mutations/queries       │
│  AsyncStorage - Local caching for offline support       │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Onboarding Screens

Located in `app/(onboarding)/`:

- **welcome.tsx**: Welcome/Get Started screen with account creation/login
- **units.tsx**: Unit system selection (Imperial/Metric)
- **basic-stats.tsx**: Height, weight, gender, age, optional body fat
- **body-composition.tsx**: Body Composition Wizard (neck, waist, hip measurements)
- **activity-level.tsx**: Activity level selection
- **goal.tsx**: Goal phase and target setting
- **review.tsx**: Review & Confirm screen with calculated targets

### 2. Form State Management

**OnboardingFormContext** (`lib/onboarding/state.ts`):
- Provides form state via React Context
- Uses `useReducer` for predictable state updates
- Supports backward navigation with preserved state
- Handles unit conversion when user changes units mid-flow

**Usage**:
```typescript
const { state, dispatch } = useOnboardingForm();
dispatch({ type: 'SET_BASIC_STATS', payload: stats });
```

### 3. Validation

**Zod Schemas** (`lib/validation/onboarding.ts`):
- Type-safe validation for all form inputs
- Generates TypeScript types automatically
- Clear error messages for users

**Example**:
```typescript
const basicStatsSchema = z.object({
  height: z.number().positive().min(30).max(300),
  weight: z.number().positive().min(20).max(500),
  age: z.number().int().min(13).max(120),
  gender: z.enum(['male', 'female', 'other']),
});
```

### 4. Calculations

**Pure Functions** (`lib/calculations/`):
- `katch-mcardle.ts`: BMR, TDEE, goal-adjusted calories
- `body-fat.ts`: U.S. Navy body fat calculation
- `unit-conversion.ts`: Metric ↔ Imperial conversions

**Example**:
```typescript
const bmr = calculateBMR(leanBodyMassKg);
const tdee = calculateTDEE(bmr, activityMultiplier);
const calories = calculateGoalCalories(tdee, goalPhase);
```

### 5. Data Persistence

**Convex Functions** (`convex/onboarding.ts`):
- `saveOnboardingProgress`: Incremental save after each screen
- `getOnboardingProgress`: Retrieve saved progress
- `completeOnboarding`: Final save on Review confirmation
- `checkOnboardingStatus`: Quick status check for routing

**Local Caching** (`lib/onboarding/persistence.ts`):
- AsyncStorage for offline support
- Automatic sync when online
- Resume from last step on app restart

## Implementation Steps

### Step 1: Set Up Dependencies

```bash
# Add Zod for validation
yarn add zod

# Add AsyncStorage for local caching
yarn add @react-native-async-storage/async-storage
```

### Step 2: Extend Convex Schema

Update `convex/schema.ts`:
- Add `onboardingProfiles` table
- Add `onboardingCompleted` field to `userAccounts` table
- Add indexes for efficient queries

### Step 3: Create Convex Functions

Create `convex/onboarding.ts` with:
- `saveOnboardingProgress` mutation
- `getOnboardingProgress` query
- `completeOnboarding` mutation
- `checkOnboardingStatus` query

### Step 4: Implement Validation Schemas

Create `lib/validation/onboarding.ts` with Zod schemas for:
- Basic stats
- Body composition measurements
- Activity level
- Goal configuration

### Step 5: Implement Calculation Utilities

Create calculation modules:
- `lib/calculations/katch-mcardle.ts`
- `lib/calculations/body-fat.ts`
- `lib/calculations/unit-conversion.ts`

### Step 6: Create Form State Management

Create `lib/onboarding/state.ts`:
- Define `OnboardingState` type
- Define `OnboardingAction` union type
- Implement `onboardingReducer`
- Create `OnboardingFormContext` and provider

### Step 7: Create Persistence Layer

Create `lib/onboarding/persistence.ts`:
- `saveOnboardingProgress`: Save to Convex + cache locally
- `loadOnboardingProgress`: Load from Convex or cache
- `syncOnboardingProgress`: Background sync for offline data

### Step 8: Build Screen Components

Create screens in `app/(onboarding)/`:
1. Start with `units.tsx` (simplest)
2. Build `basic-stats.tsx` with form validation
3. Build `body-composition.tsx` with calculation logic
4. Build `activity-level.tsx` and `goal.tsx`
5. Build `review.tsx` with final calculations
6. Build `welcome.tsx` with routing logic

### Step 9: Create Form Components

Create reusable form components in `components/onboarding/`:
- `units-selection-form.tsx`
- `basic-stats-form.tsx`
- `body-composition-form.tsx`
- `activity-level-form.tsx`
- `goal-form.tsx`
- `review-summary.tsx`

### Step 10: Add Navigation Logic

Update `app/_layout.tsx`:
- Add onboarding route guard
- Redirect incomplete users to onboarding
- Handle deep linking to onboarding steps

### Step 11: Add Tests

Create tests in `tests/onboarding/`:
- Unit tests for calculations
- Unit tests for validation
- Component tests for forms
- Integration tests for navigation

## Key Patterns

### Form State Pattern

```typescript
// In form component
const { state, dispatch } = useOnboardingForm();

const handleSubmit = async (data: BasicStats) => {
  // Validate
  const validated = basicStatsSchema.parse(data);
  
  // Update state
  dispatch({ type: 'SET_BASIC_STATS', payload: validated });
  
  // Save progress
  await saveOnboardingProgress(state, userId);
  
  // Navigate next
  router.push('/(onboarding)/body-composition');
};
```

### Calculation Pattern

```typescript
// Calculate on Review screen
const calculateTargets = () => {
  if (!state.basicStats || !state.activityLevel || !state.goal) {
    return null;
  }
  
  const leanBodyMass = state.leanBodyMass || calculateLeanBodyMass(
    state.basicStats.weight,
    state.bodyFatPercentage || 0
  );
  
  const bmr = calculateBMR(leanBodyMass);
  const tdee = calculateTDEE(bmr, ACTIVITY_MULTIPLIERS[state.activityLevel]);
  const calories = calculateGoalCalories(tdee, state.goal.goalPhase);
  const protein = calculateProteinTarget(state.basicStats.weight, state.goal.goalPhase);
  
  return { calories, protein };
};
```

### Unit Conversion Pattern

```typescript
// Display value based on user's unit preference
const displayHeight = (cm: number, units: 'imperial' | 'metric') => {
  if (units === 'imperial') {
    return convertCmToIn(cm);
  }
  return cm;
};

// Store always in metric
const handleHeightChange = (value: number, units: 'imperial' | 'metric') => {
  const heightCm = units === 'imperial' 
    ? convertInToCm(value)
    : value;
  
  dispatch({ type: 'SET_HEIGHT', payload: heightCm });
};
```

## Testing Checklist

- [ ] Unit tests for all calculation functions
- [ ] Unit tests for validation schemas
- [ ] Component tests for each form
- [ ] Integration test for complete flow
- [ ] Test backward navigation preserves state
- [ ] Test unit conversion accuracy
- [ ] Test offline save/load functionality
- [ ] Test resume from incomplete state
- [ ] Test error handling for network failures
- [ ] Test validation error messages

## Common Pitfalls

1. **Precision Loss**: Always store in metric, convert only for display
2. **State Loss**: Save progress after each screen, not just on completion
3. **Validation Timing**: Validate on submit, not on every keystroke
4. **Offline Support**: Always cache locally even if Convex save fails
5. **Unit Conversion**: Convert existing values when user changes units mid-flow

## Next Steps

1. Review the [data model](./data-model.md) for entity definitions
2. Review the [API contracts](./contracts/onboarding-openapi.yml) for Convex function specs
3. Review the [research](./research.md) for technical decisions
4. Start implementation with Step 1 (dependencies) above

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Convex Docs](https://docs.convex.dev/)
- [Zod Docs](https://zod.dev/)
- [React Native Reusables](https://www.react-native-reusables.dev/)

