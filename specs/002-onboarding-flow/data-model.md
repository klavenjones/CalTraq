# Data Model: Caltraq Onboarding Flow

**Feature**: Onboarding Flow  
**Date**: 2025-01-27  
**Status**: Complete

This document defines the data entities, relationships, validation rules, and state transitions for the onboarding flow feature.

## Entities

### 1. UserAccount (Extended)

**Description**: Existing user account entity extended with onboarding completion tracking.

**Fields**:
- `clerkUserId` (string, required): External unique identifier from Clerk
- `email` (string, required): Primary email address
- `createdAt` (number, required): Timestamp when account was created
- `status` (enum, required): Account status (`pending`, `active`, `suspended`, `deleted`)
- `lastSignInAt` (number, optional): Timestamp of most recent sign-in
- `onboardingCompleted` (number, optional): **NEW** - Timestamp when onboarding was completed (null if not completed)
- `onboardingCompletedAt` (number, optional): **NEW** - Alias for onboardingCompleted (for clarity)

**Indexes**:
- `by_clerk_user_id`: Index on `clerkUserId`
- `by_email`: Index on `email`
- `by_status`: Index on `status`
- `by_onboarding_completed`: **NEW** - Index on `onboardingCompleted` (for querying incomplete users)

**Validation Rules**:
- `onboardingCompleted` must be a valid timestamp (number > 0) or null
- If `onboardingCompleted` is set, `status` must be `active`
- `onboardingCompleted` cannot be in the future

**State Transitions**:
- `onboardingCompleted: null` → `onboardingCompleted: timestamp` (when user completes onboarding)
- Can be reset to `null` if user chooses to re-onboard (via Settings)

### 2. OnboardingProfile

**Description**: Stores all onboarding data collected during the flow, linked to a UserAccount.

**Fields**:
- `_id` (Id<"onboardingProfiles">, auto-generated): Unique identifier
- `userAccountId` (Id<"userAccounts">, required): Reference to UserAccount
- `units` (enum, required): Unit preference (`imperial` | `metric`)
- `height` (number, required): Height in centimeters (stored in metric, converted for display)
- `weight` (number, required): Weight in kilograms (stored in metric, converted for display)
- `gender` (enum, required): Gender (`male` | `female` | `other`)
- `age` (number, required): Age in years
- `bodyFatPercentage` (number, optional): Body fat percentage (0-50)
- `leanBodyMass` (number, optional): Lean body mass in kilograms (calculated)
- `bodyCompositionMethod` (enum, optional): How body fat was obtained (`manual` | `calculated` | null)
- `neckCircumference` (number, optional): Neck circumference in centimeters
- `waistCircumference` (number, optional): Waist circumference in centimeters
- `hipCircumference` (number, optional): Hip circumference in centimeters (for females)
- `activityLevel` (enum, required): Activity level (`sedentary` | `lightly_active` | `moderately_active` | `very_active` | `extremely_active`)
- `goalPhase` (enum, required): Goal phase (`slow` | `moderate` | `aggressive` | `maintenance`)
- `goalType` (enum, required): Goal type (`weekly_change` | `target_weight`)
- `goalValue` (number, required): Goal value (weekly change in kg/week, or target weight in kg)
- `calculatedCalorieTarget` (number, required): Calculated daily calorie target
- `calculatedProteinTarget` (number, required): Calculated daily protein target in grams
- `expectedTimelineWeeks` (number, optional): Expected weeks to reach goal
- `startDate` (number, required): Timestamp when plan starts
- `currentStep` (number, optional): Last completed step index (0-6) for resume capability
- `createdAt` (number, required): Timestamp when profile was first created
- `updatedAt` (number, required): Timestamp of most recent update
- `completedAt` (number, optional): Timestamp when onboarding was completed

**Indexes**:
- `by_user_account`: Index on `userAccountId` (for quick lookup)
- `by_completion_status`: Index on `completedAt` (for querying incomplete profiles)

**Validation Rules**:
- `height` must be between 30-300 cm (1-10 feet)
- `weight` must be between 20-500 kg (44-1100 lbs)
- `age` must be between 13-120 years
- `bodyFatPercentage` must be between 0-50 if provided
- `leanBodyMass` must be positive and less than `weight` if provided
- `neckCircumference` must be positive if provided
- `waistCircumference` must be positive and greater than `neckCircumference` if provided
- `hipCircumference` must be positive if `gender` is `female` and body composition method is `calculated`
- `activityLevel` must be one of the defined enum values
- `goalPhase` must be one of the defined enum values
- `goalValue` must be positive
- `calculatedCalorieTarget` must be between 1200-5000 calories (with warnings for extremes)
- `calculatedProteinTarget` must be between 20-500 grams
- `currentStep` must be between 0-6 if provided
- `startDate` cannot be in the past (minimum: current timestamp)

**State Transitions**:
- **Created**: Profile created when user starts onboarding (step 0)
- **In Progress**: `currentStep` increments as user progresses (steps 1-5)
- **Completed**: `completedAt` set when user confirms on Review screen (step 6)
- **Updated**: Profile can be updated if user re-onboards via Settings

**Relationships**:
- One-to-one with `UserAccount` (one profile per user)
- Profile can exist in incomplete state (for resume capability)

### 3. BodyCompositionData (Embedded in OnboardingProfile)

**Description**: Body measurements used to calculate body fat percentage. Stored as part of OnboardingProfile rather than separate entity.

**Fields** (embedded in OnboardingProfile):
- `neckCircumference` (number, optional): Neck circumference in cm
- `waistCircumference` (number, optional): Waist circumference in cm
- `hipCircumference` (number, optional): Hip circumference in cm (females only)
- `calculatedBodyFatPercentage` (number, optional): Calculated body fat percentage
- `calculatedLeanBodyMass` (number, optional): Calculated lean body mass in kg

**Validation Rules**:
- All measurements must be positive
- `waistCircumference` > `neckCircumference` (logical constraint)
- If `gender` is `female` and method is `calculated`, `hipCircumference` is required
- Calculated values must be within physiologically reasonable ranges

### 4. GoalConfiguration (Embedded in OnboardingProfile)

**Description**: User's goal phase and target settings. Stored as part of OnboardingProfile.

**Fields** (embedded in OnboardingProfile):
- `goalPhase` (enum): `slow`, `moderate`, `aggressive`, `maintenance`
- `goalType` (enum): `weekly_change` or `target_weight`
- `goalValue` (number): Weekly change in kg/week OR target weight in kg
- `calculatedCalorieTarget` (number): Final calculated daily calories
- `calculatedProteinTarget` (number): Final calculated daily protein in grams
- `expectedTimelineWeeks` (number, optional): Calculated weeks to reach goal
- `startDate` (number): When the plan becomes active

**Calculation Logic**:
- BMR = 370 + (21.6 × LBM in kg)
- TDEE = BMR × Activity Multiplier
- Goal Calories = TDEE × Goal Phase Adjustment
- Protein Target = Weight (kg) × Protein Multiplier (1.6-2.2g/kg based on goal phase)

**Activity Multipliers**:
- `sedentary`: 1.2
- `lightly_active`: 1.375
- `moderately_active`: 1.55
- `very_active`: 1.725
- `extremely_active`: 1.9

**Goal Phase Adjustments**:
- `slow`: -10% (multiply by 0.9)
- `moderate`: -20% (multiply by 0.8)
- `aggressive`: -30% (multiply by 0.7)
- `maintenance`: 0% (multiply by 1.0)

## Data Flow

### Onboarding Flow States

1. **Not Started**: No OnboardingProfile exists, `UserAccount.onboardingCompleted` is null
2. **In Progress**: OnboardingProfile exists with `completedAt` null, `currentStep` indicates progress
3. **Completed**: OnboardingProfile exists with `completedAt` set, `UserAccount.onboardingCompleted` set
4. **Re-onboarding**: UserAccount.onboardingCompleted reset to null, new OnboardingProfile created or existing updated

### Data Persistence Strategy

1. **Incremental Saves**: After each screen completion, save progress to Convex
2. **Local Caching**: Cache progress in AsyncStorage for offline support
3. **Final Save**: On Review screen confirmation, mark profile as completed
4. **Resume**: On app start, check for incomplete profile and resume from `currentStep`

## Schema Extensions

### Convex Schema Updates

```typescript
// Add to convex/schema.ts

onboardingProfiles: defineTable({
  userAccountId: v.id('userAccounts'),
  units: v.union(v.literal('imperial'), v.literal('metric')),
  height: v.number(), // stored in cm
  weight: v.number(), // stored in kg
  gender: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
  age: v.number(),
  bodyFatPercentage: v.optional(v.number()),
  leanBodyMass: v.optional(v.number()),
  bodyCompositionMethod: v.optional(v.union(v.literal('manual'), v.literal('calculated'))),
  neckCircumference: v.optional(v.number()),
  waistCircumference: v.optional(v.number()),
  hipCircumference: v.optional(v.number()),
  activityLevel: v.union(
    v.literal('sedentary'),
    v.literal('lightly_active'),
    v.literal('moderately_active'),
    v.literal('very_active'),
    v.literal('extremely_active')
  ),
  goalPhase: v.union(
    v.literal('slow'),
    v.literal('moderate'),
    v.literal('aggressive'),
    v.literal('maintenance')
  ),
  goalType: v.union(v.literal('weekly_change'), v.literal('target_weight')),
  goalValue: v.number(),
  calculatedCalorieTarget: v.number(),
  calculatedProteinTarget: v.number(),
  expectedTimelineWeeks: v.optional(v.number()),
  startDate: v.number(),
  currentStep: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index('by_user_account', ['userAccountId'])
  .index('by_completion_status', ['completedAt']),
```

### UserAccount Schema Extension

```typescript
// Update userAccounts table in convex/schema.ts
userAccounts: defineTable({
  // ... existing fields
  onboardingCompleted: v.optional(v.number()), // timestamp or null
})
  // ... existing indexes
  .index('by_onboarding_completed', ['onboardingCompleted']),
```

## Data Migration

**Existing Users**: Users who signed up before onboarding flow will have:
- `UserAccount.onboardingCompleted = null`
- No `OnboardingProfile` record
- Will be prompted to complete onboarding on first app launch after feature release

**Migration Strategy**: No data migration required. New fields are optional and will be populated as users complete onboarding.

## Validation Summary

### Required Fields by Step

1. **Units Selection**: `units`
2. **Basic Stats**: `height`, `weight`, `gender`, `age`
3. **Body Composition**: Either `bodyFatPercentage` OR (`neckCircumference`, `waistCircumference`, `hipCircumference` if female)
4. **Activity Level**: `activityLevel`
5. **Goal**: `goalPhase`, `goalType`, `goalValue`
6. **Review**: All fields validated, calculations confirmed

### Cross-Field Validation

- If `bodyCompositionMethod = 'calculated'` and `gender = 'female'`, then `hipCircumference` is required
- `leanBodyMass` must be less than `weight`
- `calculatedCalorieTarget` must respect minimum safe threshold (1200 calories)
- `goalValue` for `target_weight` must be different from current `weight`

