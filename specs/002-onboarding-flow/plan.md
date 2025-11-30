# Implementation Plan: Caltraq Onboarding Flow

**Branch**: `002-onboarding-flow` | **Date**: 2025-01-27 | **Spec**: `/specs/002-onboarding-flow/spec.md`
**Input**: Feature specification from `/specs/002-onboarding-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a multi-screen onboarding flow that collects user data (units, basic stats, body composition, activity level, goals) to perform Katch–McArdle calculations and generate personalized calorie and protein targets. The flow must support incremental progress saving, backward navigation, unit conversion, and resume capability. All screens will be built as typed functional React Native components using React Native Reusables, with form validation, offline support, and clean modular architecture.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict type checking  
**Primary Dependencies**:

- React Native 0.81.5 with React 19.1.0
- Expo Router ~6.0.10 for navigation
- Convex 1.21.0 for backend data persistence
- Clerk (@clerk/clerk-expo ^2.16.1) for authentication
- React Native Reusables components for UI
- Nativewind ^4.2.1 for styling (Tailwind CSS)
- Zod (to be added) for runtime form validation

**Storage**:

- Convex database for persistent onboarding data and user profiles
- Local state management with React Context/useReducer for form state
- AsyncStorage or Expo SecureStore for offline caching of progress

**Testing**:

- Jest ^29.7.0 with React Native Testing Library ^12.4.3
- Unit tests for validation logic, calculation functions, and form components
- Integration tests for navigation flow and data persistence

**Target Platform**:

- iOS (via Expo)
- Android (via Expo)
- Web (via Expo Web)

**Project Type**: Mobile application (Expo managed workflow)

**Performance Goals**:

- Onboarding flow completion in <5 minutes for 90% of users
- Form validation feedback <100ms
- Smooth 60fps navigation transitions
- Incremental save operations <500ms

**Constraints**:

- Must work offline with local caching and sync when online
- Must preserve data precision during unit conversions
- Must handle network errors gracefully with retry mechanisms
- Must support backward navigation without data loss
- Minimum safe calorie thresholds (1200 calories for adults)

**Scale/Scope**:

- 6-7 onboarding screens (Welcome, Units, Basic Stats, Body Composition Wizard, Activity Level, Goal Setting, Review)
- 1 new Convex table for onboarding profiles
- Extension of existing UserAccount entity
- ~15-20 new React components (screens + form components)
- ~5-7 calculation utility functions (Katch–McArdle, body fat formulas, unit conversions)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle 1 – Typed, Functional, Modular Expo React Native Code

**Compliance Status**: ✅ **COMPLIANT**

- All onboarding screens and form components will be implemented as typed functional components in TypeScript
- Form validation logic will be extracted into reusable utility modules (e.g., `lib/validation/onboarding.ts`)
- Calculation functions (Katch–McArdle, body fat formulas, unit conversions) will be in separate pure function modules (e.g., `lib/calculations/`)
- State management will use React Context + useReducer for form state, keeping components focused on presentation
- File structure: Each screen component in `app/(onboarding)/`, form components in `components/onboarding/`, utilities in `lib/`
- All functions will have explicit TypeScript return types and parameter types
- Naming conventions: `isValid`, `hasError`, `shouldShowWizard`, `calculateBodyFat`, etc.

**Potential Violations**: None identified. All code will follow functional patterns with clear separation of concerns.

### Principle 2 – UI, Styling, and Layout with React Native Reusables

**Compliance Status**: ✅ **COMPLIANT**

- All onboarding screens will use React Native Reusables components (Button, Input, Card, Label, Text)
- Styling via Nativewind utility classes (Tailwind CSS)
- Dark mode support using `useColorScheme` from nativewind
- Safe area handling using `SafeAreaView` or `SafeAreaProvider` wrappers
- All screens will be tested in both light and dark themes
- Accessibility: Proper labels, roles, and contrast ratios for all inputs

**Potential Violations**: None identified. UI will follow existing patterns from auth screens.

### Principle 3 – State Management, Data Fetching, and Performance

**Compliance Status**: ✅ **COMPLIANT**

- Form state managed with React Context + useReducer (OnboardingFormContext) to avoid prop drilling
- Incremental saves to Convex after each screen completion (not on every keystroke)
- Local caching with AsyncStorage/Expo SecureStore for offline support
- Memoization: `useMemo` for calculated values (calorie targets, body fat), `useCallback` for form handlers
- Lazy loading: Onboarding screens can be code-split if bundle size becomes a concern
- Optimistic UI updates for save operations

**Potential Violations**: None identified. State management follows React best practices.

### Principle 4 – Navigation, Workflow, and Platform Coverage

**Compliance Status**: ✅ **COMPLIANT**

- Navigation via Expo Router with clear route structure: `app/(onboarding)/`
- Back navigation support with preserved form state
- Deep linking: Support for direct links to specific onboarding steps (e.g., `/onboarding/activity-level`)
- Platform coverage: Tested on iOS, Android, and Web simulators/emulators
- Navigation guards: Redirect authenticated users who haven't completed onboarding

**Potential Violations**: None identified. Navigation follows Expo Router conventions.

### Principle 5 – Reliability, Testing, Error Handling, Security, and i18n

**Compliance Status**: ✅ **COMPLIANT**

- **Testing**: Unit tests for validation functions, calculation utilities, and form components using Jest + React Native Testing Library
- **Validation**: Runtime validation with Zod schemas for all form inputs (age, weight, height, measurements, etc.)
- **Error Handling**: Clear user-facing error messages, network error retry mechanisms, graceful degradation for offline scenarios
- **Security**: All data transmitted over HTTPS via Convex, sensitive data (body measurements) stored securely
- **i18n**: Text externalized to constants (future i18n support), layouts respect dynamic text sizing

**Potential Violations**: None identified. All critical flows will have test coverage.

### Gate Evaluation

**Status**: ✅ **PASS** - All principles are compliant with no violations. Implementation can proceed.

## Project Structure

### Documentation (this feature)

```text
specs/002-onboarding-flow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── onboarding-openapi.yml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── (onboarding)/              # New onboarding flow screens
│   ├── _layout.tsx           # Onboarding layout with progress indicator
│   ├── welcome.tsx            # Welcome/Get Started screen
│   ├── units.tsx             # Units selection screen
│   ├── basic-stats.tsx       # Basic stats entry screen
│   ├── body-composition.tsx   # Body Composition Wizard screen
│   ├── activity-level.tsx    # Activity level selection screen
│   ├── goal.tsx              # Goal setting screen
│   └── review.tsx            # Review & Confirm screen
├── (auth)/                    # Existing auth screens
└── index.tsx                  # Main app (redirects if onboarding incomplete)

components/
├── onboarding/                # New onboarding-specific components
│   ├── onboarding-form-context.tsx    # Form state context provider
│   ├── units-selection-form.tsx
│   ├── basic-stats-form.tsx
│   ├── body-composition-form.tsx
│   ├── activity-level-form.tsx
│   ├── goal-form.tsx
│   └── review-summary.tsx
└── ui/                        # Existing UI components (reused)

lib/
├── validation/                # New validation utilities
│   ├── onboarding.ts         # Zod schemas for onboarding forms
│   └── constants.ts          # Validation bounds (age, weight, etc.)
├── calculations/              # New calculation utilities
│   ├── katch-mcardle.ts     # BMR/TDEE calculations
│   ├── body-fat.ts          # Body fat percentage calculations
│   └── unit-conversion.ts   # Unit conversion utilities
└── onboarding/               # New onboarding utilities
    ├── state.ts              # Form state types and initial state
    └── persistence.ts        # Save/load onboarding progress

convex/
├── onboarding.ts             # New Convex functions for onboarding
│   # - saveOnboardingProgress
│   # - getOnboardingProgress
│   # - completeOnboarding
│   # - updateOnboardingProfile
└── schema.ts                 # Extended with onboardingProfile table

tests/
├── onboarding/               # New onboarding tests
│   ├── validation.test.ts
│   ├── calculations.test.ts
│   ├── forms.test.tsx
│   └── navigation.test.tsx
└── e2e/
    └── onboarding-flow.test.ts
```

**Structure Decision**: This follows the existing Expo Router structure with feature-based organization. Onboarding screens are grouped in `app/(onboarding)/`, form components are modularized in `components/onboarding/`, and business logic (validation, calculations) is separated into `lib/` modules. This maintains clean separation of concerns and follows the existing codebase patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. All implementation decisions align with the CalTraq Constitution principles.

## Implementation Summary

### Phase 0: Research ✅ Complete

All technical unknowns have been resolved in `research.md`:

- Form validation with Zod
- State management with React Context + useReducer
- Katch–McArdle formula implementation
- U.S. Navy body fat calculation
- Unit conversion with precision preservation
- Offline-first persistence patterns
- Expo Router navigation patterns
- Modular code architecture

### Phase 1: Design & Contracts ✅ Complete

**Data Model** (`data-model.md`):

- Extended `UserAccount` entity with `onboardingCompleted` field (boolean type: `false` if incomplete, `true` if completed; see `data-model.md` for complete definition)
- New `OnboardingProfile` entity with all onboarding data
- Embedded `BodyCompositionData` and `GoalConfiguration`
- Complete validation rules and state transitions

**API Contracts** (`contracts/onboarding-openapi.yml`):

- `saveOnboardingProgress` - Incremental progress saving
- `getOnboardingProgress` - Retrieve saved progress
- `completeOnboarding` - Final confirmation
- `updateOnboardingProfile` - Re-onboarding support
- `checkOnboardingStatus` - Quick status check

**Quickstart Guide** (`quickstart.md`):

- Architecture overview
- Implementation steps
- Key patterns and examples
- Testing checklist
- Common pitfalls

**Agent Context**: Updated with TypeScript 5.9.2 and project type information.

### Next Steps

1. **Phase 2**: Run `/speckit.tasks` to break the plan into implementation tasks
2. **Phase 3**: Begin implementation following the quickstart guide
3. **Testing**: Implement tests as outlined in the quickstart checklist

### Code Quality Standards

This plan emphasizes:

- ✅ **Clean Code**: Modular, single-responsibility components and utilities
- ✅ **Maintainable Code**: Clear separation of concerns, well-documented functions
- ✅ **Modular Code**: Reusable validation, calculations, and form components
- ✅ **Type Safety**: Full TypeScript coverage with Zod runtime validation
- ✅ **Testability**: Pure functions, isolated components, comprehensive test coverage

All implementation will follow the CalTraq Constitution principles and maintain consistency with existing codebase patterns.
