# Implementation Tasks: Caltraq Onboarding Flow

**Feature**: Onboarding Flow  
**Branch**: `002-onboarding-flow`  
**Date**: 2025-01-27  
**Status**: Ready for Implementation

This document breaks down the onboarding flow feature into actionable, dependency-ordered implementation tasks. Tasks are organized by phase and user story to enable independent implementation and testing.

## Feature Summary

Implement a multi-screen onboarding flow that collects user data (units, basic stats, body composition, activity level, goals) to perform Katch–McArdle calculations and generate personalized calorie and protein targets. The flow supports incremental progress saving, backward navigation, unit conversion, and resume capability.

**Tech Stack**: TypeScript 5.9.2, React Native 0.81.5, Expo Router ~6.0.10, Convex 1.21.0, Zod (to be added), AsyncStorage (to be added)

## Implementation Strategy

**MVP Scope**: User Story 1 (P1) - Complete onboarding flow to receive personalized targets. This provides the core value proposition and enables users to start using the app.

**Incremental Delivery**:
1. **Phase 1-2**: Setup and foundational infrastructure (required for all stories)
2. **Phase 3**: User Story 1 (P1) - Core onboarding flow
3. **Phase 4**: User Story 2 (P2) - Backward navigation (enhances UX)
4. **Phase 5**: User Story 3 (P3) - Resume capability (improves completion rates)
5. **Final Phase**: Polish, error handling, edge cases

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (User Story 1 - P1) ──┐
    ↓                          │
Phase 4 (User Story 2 - P2) ──┼──→ Final Phase (Polish)
    ↓                          │
Phase 5 (User Story 3 - P3) ──┘
```

**Story Dependencies**:
- User Story 1 (P1) is independent and can be completed first
- User Story 2 (P2) depends on User Story 1 (needs complete flow to navigate backward)
- User Story 3 (P3) depends on User Story 1 (needs complete flow to resume from)
- All stories share foundational infrastructure from Phase 2

## Parallel Execution Opportunities

**Within User Story 1**:
- Validation schemas, calculation utilities, and unit conversion can be developed in parallel
- Form components can be built in parallel after state management is ready
- Convex functions can be implemented in parallel with frontend components

**Within User Story 2**:
- Back navigation logic can be implemented independently for each screen
- Unit conversion on unit change can be developed separately

**Within User Story 3**:
- Persistence layer and resume logic can be developed in parallel with other features

## Phase 1: Setup

**Goal**: Initialize project dependencies and directory structure for onboarding flow.

**Independent Test**: Verify all dependencies are installed and directory structure exists.

### Tasks

- [ ] T001 Install Zod dependency for form validation in package.json
- [ ] T002 Install @react-native-async-storage/async-storage dependency for offline caching in package.json
- [ ] T003 Create onboarding screens directory structure at app/(onboarding)/
- [ ] T004 Create onboarding components directory at components/onboarding/
- [ ] T005 Create validation utilities directory at lib/validation/
- [ ] T006 Create calculation utilities directory at lib/calculations/
- [ ] T007 Create onboarding utilities directory at lib/onboarding/
- [ ] T008 Create onboarding tests directory at tests/onboarding/

## Phase 2: Foundational

**Goal**: Implement core infrastructure required by all user stories (schema, types, validation, calculations, state management).

**Independent Test**: Verify schema extensions compile, validation schemas work, calculation functions produce correct results, and state management initializes properly.

### Tasks

- [ ] T009 Extend UserAccount table in convex/schema.ts with onboardingCompleted field (optional boolean: false if incomplete, true if completed)
- [ ] T010 Add by_onboarding_completed index to userAccounts table in convex/schema.ts
- [ ] T011 Create onboardingProfiles table definition in convex/schema.ts with all required fields per data-model.md (fields: userAccountId, units, height, weight, gender, age, bodyFatPercentage, leanBodyMass, bodyCompositionMethod, neckCircumference, waistCircumference, hipCircumference, activityLevel, goalPhase, goalType, goalValue, calculatedCalorieTarget, calculatedProteinTarget, expectedTimelineWeeks, startDate, currentStep, createdAt, updatedAt, completedAt)
- [ ] T012 Add by_user_account index to onboardingProfiles table in convex/schema.ts
- [ ] T013 Add by_completion_status index to onboardingProfiles table in convex/schema.ts
- [ ] T014 Create onboarding state types in lib/onboarding/state.ts (OnboardingState, OnboardingAction union)
- [ ] T015 Create initial onboarding state constant in lib/onboarding/state.ts
- [ ] T016 Implement onboardingReducer function in lib/onboarding/state.ts with all action handlers
- [ ] T017 Create OnboardingFormContext provider component in lib/onboarding/state.ts
- [ ] T018 Create useOnboardingForm hook in lib/onboarding/state.ts
- [ ] T019 Create validation constants file lib/validation/constants.ts with bounds (age 13-120, weight 20-500kg, height 30-300cm, body fat 0-50%)
- [ ] T020 Create basic stats Zod schema in lib/validation/onboarding.ts (height, weight, gender, age, optional bodyFatPercentage)
- [ ] T021 Create body composition Zod schema in lib/validation/onboarding.ts (neck, waist, optional hip for females)
- [ ] T022 Create activity level Zod schema in lib/validation/onboarding.ts (enum validation)
- [ ] T023 Create goal configuration Zod schema in lib/validation/onboarding.ts (goalPhase, goalType, goalValue)
- [ ] T024 Create unit conversion constants in lib/calculations/unit-conversion.ts (kgToLb, lbToKg, cmToIn, inToCm)
- [ ] T025 Implement convertKgToLb function in lib/calculations/unit-conversion.ts with 1 decimal precision
- [ ] T026 Implement convertLbToKg function in lib/calculations/unit-conversion.ts with precision preservation
- [ ] T027 Implement convertCmToIn function in lib/calculations/unit-conversion.ts with 1 decimal precision
- [ ] T028 Implement convertInToCm function in lib/calculations/unit-conversion.ts with precision preservation
- [ ] T029 Implement convertOnboardingData function in lib/calculations/unit-conversion.ts for unit system changes
- [ ] T030 Implement calculateBMR function in lib/calculations/katch-mcardle.ts (BMR = 370 + 21.6 × LBM in kg)
- [ ] T031 Implement calculateTDEE function in lib/calculations/katch-mcardle.ts (TDEE = BMR × activity multiplier)
- [ ] T032 Create activity multiplier constants in lib/calculations/katch-mcardle.ts (sedentary 1.2, lightly_active 1.375, moderately_active 1.55, very_active 1.725, extremely_active 1.9)
- [ ] T033 Create goal phase adjustment constants in lib/calculations/katch-mcardle.ts (slow 0.9, moderate 0.8, aggressive 0.7, maintenance 1.0)
- [ ] T034 Implement calculateGoalCalories function in lib/calculations/katch-mcardle.ts with goal phase adjustments
- [ ] T035 Implement calculateProteinTarget function in lib/calculations/katch-mcardle.ts (1.6-2.2g/kg based on goal phase)
- [ ] T036 Implement calculateBodyFatMale function in lib/calculations/body-fat.ts using U.S. Navy formula for males
- [ ] T037 Implement calculateBodyFatFemale function in lib/calculations/body-fat.ts using U.S. Navy formula for females
- [ ] T038 Implement calculateBodyFat function in lib/calculations/body-fat.ts with gender-based routing (other uses male formula)
- [ ] T039 Implement calculateLeanBodyMass function in lib/calculations/body-fat.ts (LBM = weight × (1 - bodyFatPercentage / 100))
- [ ] T040 Add body fat percentage clamping to 0-50% range in lib/calculations/body-fat.ts

## Phase 3: User Story 1 - Complete Onboarding Flow (P1)

**Goal**: Implement complete onboarding flow so users can provide all required information and receive personalized calorie and protein targets.

**Independent Test**: A tester can create a new account, complete all onboarding screens (units selection, basic stats, activity level, goal setting, review), and confirm that they receive calculated daily calorie and protein targets that are saved to their profile and accessible in the main app.

### Tasks

- [ ] T041 [US1] Create onboarding layout component with progress indicator in app/(onboarding)/_layout.tsx
- [ ] T042 [US1] Implement progress indicator showing current step and total steps (Step X of 7) in app/(onboarding)/_layout.tsx
- [ ] T043 [US1] Create welcome screen component in app/(onboarding)/welcome.tsx with Get Started button
- [ ] T044 [US1] Integrate existing sign-up flow into welcome screen navigation in app/(onboarding)/welcome.tsx
- [ ] T045 [US1] Create units selection screen in app/(onboarding)/units.tsx
- [ ] T046 [US1] Create units selection form component in components/onboarding/units-selection-form.tsx with Imperial/Metric radio options
- [ ] T047 [US1] Connect units selection form to OnboardingFormContext in components/onboarding/units-selection-form.tsx
- [ ] T048 [US1] Implement navigation from units screen to basic stats screen in app/(onboarding)/units.tsx
- [ ] T049 [US1] Create basic stats screen in app/(onboarding)/basic-stats.tsx
- [ ] T050 [US1] Create basic stats form component in components/onboarding/basic-stats-form.tsx with height, weight, gender, age, optional body fat inputs
- [ ] T051 [US1] Implement unit-aware input display (show Imperial or Metric based on user selection) in components/onboarding/basic-stats-form.tsx
- [ ] T052 [US1] Implement form validation using basic stats Zod schema in components/onboarding/basic-stats-form.tsx
- [ ] T053 [US1] Add Calculate for me button that navigates to body composition wizard in components/onboarding/basic-stats-form.tsx
- [ ] T054 [US1] Connect basic stats form to OnboardingFormContext in components/onboarding/basic-stats-form.tsx
- [ ] T055 [US1] Implement navigation from basic stats to body composition or activity level based on body fat input in app/(onboarding)/basic-stats.tsx
- [ ] T056 [US1] Create body composition wizard screen in app/(onboarding)/body-composition.tsx
- [ ] T057 [US1] Create body composition form component in components/onboarding/body-composition-form.tsx with neck, waist, hip (conditional for females) inputs
- [ ] T058 [US1] Implement unit-aware input display for body measurements in components/onboarding/body-composition-form.tsx
- [ ] T059 [US1] Implement form validation using body composition Zod schema in components/onboarding/body-composition-form.tsx
- [ ] T060 [US1] Implement automatic body fat calculation on form submission in components/onboarding/body-composition-form.tsx using gender-appropriate formula
- [ ] T061 [US1] Implement lean body mass calculation after body fat calculation in components/onboarding/body-composition-form.tsx
- [ ] T062 [US1] Connect body composition form to OnboardingFormContext in components/onboarding/body-composition-form.tsx
- [ ] T063 [US1] Implement navigation from body composition to activity level screen in app/(onboarding)/body-composition.tsx
- [ ] T064 [US1] Create activity level selection screen in app/(onboarding)/activity-level.tsx
- [ ] T065 [US1] Create activity level form component in components/onboarding/activity-level-form.tsx with 5 options (Sedentary, Lightly Active, Moderately Active, Very Active, Extremely Active)
- [ ] T066 [US1] Display activity level descriptions with multiplier information in components/onboarding/activity-level-form.tsx
- [ ] T067 [US1] Connect activity level form to OnboardingFormContext in components/onboarding/activity-level-form.tsx
- [ ] T068 [US1] Implement navigation from activity level to goal screen in app/(onboarding)/activity-level.tsx
- [ ] T069 [US1] Create goal setting screen in app/(onboarding)/goal.tsx
- [ ] T070 [US1] Create goal form component in components/onboarding/goal-form.tsx with goal phase selection (Slow, Moderate, Aggressive, Maintenance)
- [ ] T071 [US1] Implement goal type selection (weekly weight change OR target weight) in components/onboarding/goal-form.tsx
- [ ] T072 [US1] Implement goal value input with unit-aware display in components/onboarding/goal-form.tsx
- [ ] T073 [US1] Implement form validation using goal configuration Zod schema in components/onboarding/goal-form.tsx
- [ ] T074 [US1] Connect goal form to OnboardingFormContext in components/onboarding/goal-form.tsx
- [ ] T075 [US1] Implement navigation from goal to review screen in app/(onboarding)/goal.tsx
- [ ] T076 [US1] Create review and confirm screen in app/(onboarding)/review.tsx
- [ ] T077 [US1] Create review summary component in components/onboarding/review-summary.tsx displaying all entered values
- [ ] T078 [US1] Implement Katch–McArdle calculation chain (BMR → TDEE → Goal Calories) in app/(onboarding)/review.tsx
- [ ] T079 [US1] Implement protein target calculation in app/(onboarding)/review.tsx
- [ ] T079a [US1] Implement expected timeline calculation function in app/(onboarding)/review.tsx using formulas from FR-016 (target_weight and weekly_change goal types with weeklyChangeRate based on goal phase)
- [ ] T080 [US1] Display calculated daily calorie target in components/onboarding/review-summary.tsx
- [ ] T081 [US1] Display calculated protein target in components/onboarding/review-summary.tsx
- [ ] T082 [US1] Display expected timeline to reach goal in components/onboarding/review-summary.tsx
- [ ] T083 [US1] Implement minimum safe calorie threshold check (1200 calories) in app/(onboarding)/review.tsx
- [ ] T084 [US1] Display warning banner when calculated calories are below 1200 in components/onboarding/review-summary.tsx
- [ ] T085 [US1] Implement final confirmation button in app/(onboarding)/review.tsx
- [ ] T086 [US1] Create saveOnboardingProgress Convex mutation in convex/onboarding.ts
- [ ] T087 [US1] Create getOnboardingProgress Convex query in convex/onboarding.ts
- [ ] T088 [US1] Create completeOnboarding Convex mutation in convex/onboarding.ts that saves profile and updates UserAccount.onboardingCompleted
- [ ] T089 [US1] Create checkOnboardingStatus Convex query in convex/onboarding.ts
- [ ] T090 [US1] Implement save progress after each screen completion using saveOnboardingProgress in app/(onboarding)/_layout.tsx
- [ ] T091 [US1] Implement final save on review confirmation using completeOnboarding in app/(onboarding)/review.tsx
- [ ] T092 [US1] Update app/_layout.tsx to check onboarding status and redirect incomplete users to onboarding flow
- [ ] T093 [US1] Implement navigation from review screen to main app after successful completion in app/(onboarding)/review.tsx

## Phase 4: User Story 2 - Backward Navigation (P2)

**Goal**: Enable users to navigate backward through onboarding screens and edit previous inputs without losing progress.

**Independent Test**: A tester can navigate forward through onboarding, use back navigation to return to a previous screen, modify their input, and continue forward again, confirming that their changes are reflected in subsequent screens and final calculations.

### Tasks

- [ ] T094 [US2] Implement back button in onboarding layout that preserves form state in app/(onboarding)/_layout.tsx
- [ ] T095 [US2] Implement device back navigation handler that preserves form state in app/(onboarding)/_layout.tsx
- [ ] T096 [US2] Ensure all form components populate with existing state values from OnboardingFormContext on mount
- [ ] T097 [US2] Implement unit conversion when user changes units mid-flow in components/onboarding/units-selection-form.tsx
- [ ] T098 [US2] Update all measurement displays when units change in components/onboarding/basic-stats-form.tsx
- [ ] T099 [US2] Update all measurement displays when units change in components/onboarding/body-composition-form.tsx
- [ ] T100 [US2] Handle body fat method change (manual to calculated or vice versa) when navigating back in components/onboarding/basic-stats-form.tsx
- [ ] T101 [US2] Recalculate calorie and protein targets when activity level changes on review screen in app/(onboarding)/review.tsx
- [ ] T102 [US2] Recalculate calorie and protein targets when goal changes on review screen in app/(onboarding)/review.tsx
- [ ] T103 [US2] Recalculate calorie and protein targets when basic stats change on review screen in app/(onboarding)/review.tsx

## Phase 5: User Story 3 - Resume Capability (P3)

**Goal**: Enable users to resume onboarding from where they left off if they close the app or navigate away mid-flow.

**Independent Test**: A tester can start onboarding, enter information on several screens, close the app, reopen it, and confirm that they are returned to the onboarding flow with all previously entered values preserved, allowing them to continue from where they left off.

### Tasks

- [ ] T104 [US3] Create persistence utility functions in lib/onboarding/persistence.ts
- [ ] T105 [US3] Implement saveOnboardingProgress function that saves to Convex and caches locally in lib/onboarding/persistence.ts
- [ ] T106 [US3] Implement loadOnboardingProgress function that loads from Convex first, falls back to local cache in lib/onboarding/persistence.ts
- [ ] T107 [US3] Implement syncOnboardingProgress function for background sync of cached data in lib/onboarding/persistence.ts
- [ ] T108 [US3] Integrate AsyncStorage for local caching in lib/onboarding/persistence.ts
- [ ] T109 [US3] Add error handling for offline scenarios in lib/onboarding/persistence.ts
- [ ] T110 [US3] Implement resume logic in app/_layout.tsx that checks for incomplete onboarding and redirects to last step
- [ ] T111 [US3] Load saved progress into OnboardingFormContext on app start in app/(onboarding)/_layout.tsx
- [ ] T112 [US3] Navigate user to last completed step (currentStep) when resuming in app/(onboarding)/_layout.tsx
- [ ] T113 [US3] Implement background sync of locally cached data when network becomes available in lib/onboarding/persistence.ts
- [ ] T114 [US3] Add integration test for cross-device sync scenario: user starts onboarding on Device A, signs in on Device B, verifies progress syncs automatically via Convex real-time synchronization in tests/e2e/onboarding-flow.test.ts

## Final Phase: Polish & Cross-Cutting Concerns

**Goal**: Add error handling, edge case handling, validation improvements, and polish the user experience.

**Independent Test**: Verify error messages are clear, edge cases are handled gracefully, validation works correctly, and the flow is smooth and intuitive.

### Tasks

- [ ] T115 Implement network error handling with retry mechanism for final confirmation in app/(onboarding)/review.tsx
- [ ] T116 Add clear error messages for validation failures in all form components
- [ ] T117 Implement graceful degradation for offline scenarios with user-friendly messages
- [ ] T118 Add loading states for save operations in all screens
- [ ] T119 Implement validation for extreme values (negative weight, age over 150, body fat over 50%) with helpful error messages
- [ ] T120 Add validation for goal value (target weight must differ from current weight) in components/onboarding/goal-form.tsx
- [ ] T121 Implement warning acknowledgment flow for unsafe calorie targets (<1200) in components/onboarding/review-summary.tsx
- [ ] T122 Add accessibility labels and roles to all form inputs
- [ ] T123 Test dark mode support for all onboarding screens
- [ ] T124 Test safe area handling on all devices (iOS notch, Android navigation bar)
- [ ] T125 Add unit tests for all calculation functions in tests/onboarding/calculations.test.ts
- [ ] T126 Add unit tests for all validation schemas in tests/onboarding/validation.test.ts
- [ ] T127 Add component tests for all form components in tests/onboarding/forms.test.tsx
- [ ] T128 Add integration test for complete onboarding flow in tests/e2e/onboarding-flow.test.ts
- [ ] T129 Add integration test for backward navigation in tests/e2e/onboarding-flow.test.ts
- [ ] T130 Add integration test for resume capability in tests/e2e/onboarding-flow.test.ts
- [ ] T131 Verify all screens work correctly on iOS, Android, and Web platforms
- [ ] T132 Add deep linking support for onboarding steps (optional enhancement)

## Task Summary

**Total Tasks**: 133

**Tasks by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 32 tasks
- Phase 3 (User Story 1 - P1): 54 tasks
- Phase 4 (User Story 2 - P2): 10 tasks
- Phase 5 (User Story 3 - P3): 11 tasks
- Final Phase (Polish): 18 tasks

**Tasks by User Story**:
- User Story 1 (P1): 53 tasks
- User Story 2 (P2): 10 tasks
- User Story 3 (P3): 11 tasks

**Parallel Opportunities**:
- Validation schemas, calculations, and unit conversion can be developed in parallel (T019-T040)
- Form components can be built in parallel after state management is ready (T046, T050, T057, T065, T070)
- Convex functions can be implemented in parallel with frontend components (T086-T089)
- Back navigation features can be implemented independently per screen (T094-T103)
- Persistence and resume logic can be developed in parallel (T104-T114)

## Independent Test Criteria

**User Story 1 (P1)**: A tester can create a new account, complete all onboarding screens (units selection, basic stats, activity level, goal setting, review), and confirm that they receive calculated daily calorie and protein targets that are saved to their profile and accessible in the main app.

**User Story 2 (P2)**: A tester can navigate forward through onboarding, use back navigation to return to a previous screen, modify their input, and continue forward again, confirming that their changes are reflected in subsequent screens and final calculations.

**User Story 3 (P3)**: A tester can start onboarding, enter information on several screens, close the app, reopen it, and confirm that they are returned to the onboarding flow with all previously entered values preserved, allowing them to continue from where they left off.

## Suggested MVP Scope

**MVP includes**: Phase 1, Phase 2, and Phase 3 (User Story 1 - P1)

This provides the core value proposition: users can complete onboarding and receive personalized calorie and protein targets. User Stories 2 and 3 can be added incrementally to improve UX and completion rates.

## Next Steps

1. Review this task list for completeness and accuracy
2. Begin implementation with Phase 1 (Setup)
3. Proceed through phases sequentially, completing each phase before moving to the next
4. Test each user story independently before moving to the next
5. Complete final polish phase before feature completion

