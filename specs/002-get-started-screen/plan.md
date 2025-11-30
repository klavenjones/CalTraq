# Implementation Plan: Get Started Screen

**Branch**: `002-get-started-screen` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-get-started-screen/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a welcome/get-started screen that displays when unauthenticated users open the app. The screen features the app logo, a caption "Log your Calories the Right Way", a "Get Started" button that navigates to sign-up, and an "Already have an account? Sign In" link that navigates to sign-in. The screen must handle authentication state checking with a loading indicator, support dark mode, and be accessible. This is a presentation/navigation layer feature with no data persistence requirements.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with strict mode enabled  
**Primary Dependencies**:

- Expo 54.0.0 (managed workflow)
- React Native 0.81.5
- React 19.1.0
- Expo Router 6.0.10 (file-based routing)
- Clerk (@clerk/clerk-expo 2.16.1) for authentication
- React Native Reusables components (@rn-primitives/\*)
- Nativewind 4.2.1 (Tailwind CSS for React Native)
- Convex 1.21.0 (backend/data layer)

**Storage**: N/A (presentation layer only, no data persistence)  
**Testing**: Jest 29.7.0 with @testing-library/react-native 12.4.3  
**Target Platform**: iOS, Android, Web (Expo managed workflow)  
**Project Type**: Mobile (Expo React Native app)  
**Performance Goals**:

- Screen loads and displays all elements within 1 second on standard mobile devices (SC-003)
- Maintain 60fps during navigation transitions
- Minimal loading indicator display (<500ms typical auth check)

**Constraints**:

- Must work across iOS, Android, and Web platforms
- Must respect safe areas (notches, status bars)
- Must support both light and dark mode themes
- Must meet basic accessibility requirements (screen readers, focus order, contrast)
- Must handle authentication state checking gracefully (loading state)

**Scale/Scope**:

- Single screen component
- Integration with existing auth flow (Clerk + Convex)
- Navigation to existing sign-up and sign-in screens

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle 1 – Typed, Functional, Modular Expo React Native Code

✅ **COMPLIANT**

- Component will be implemented as a functional React component with TypeScript
- Props will be well-typed
- File structure will follow existing patterns (single component file in `app/` directory)
- No duplication expected (reuses existing navigation and UI components)

### Principle 2 – UI, Styling, and Layout with React Native Reusables

✅ **COMPLIANT**

- Will use React Native Reusables Button component for "Get Started" button
- Will use Nativewind/Tailwind for styling (centered layout, spacing, typography)
- Must respect safe areas using SafeAreaProvider (already configured in root layout)
- Must support dark mode using existing color scheme system
- Must meet accessibility requirements (screen reader labels, focus order, contrast)

### Principle 3 – State Management, Data Fetching, and Performance

✅ **COMPLIANT**

- Minimal state needed (only for loading indicator during auth check)
- Will use existing Clerk hooks (`useAuth`, `useConvexAuth`) for authentication state
- No data fetching required (presentation layer only)
- Component should be lightweight and render efficiently

### Principle 4 – Navigation, Workflow, and Platform Coverage

✅ **COMPLIANT**

- Will use Expo Router for navigation (Link/useRouter to navigate to sign-up/sign-in)
- Must integrate with existing auth guards in `_layout.tsx`
- Must work consistently across iOS, Android, and Web
- Navigation flows already exist (sign-up and sign-in screens)

### Principle 5 – Reliability, Testing, Error Handling, Security, and i18n

✅ **COMPLIANT** (Post-Design)

- **Testing**: Automated tests will be added in implementation phase (navigation flows, accessibility, logo error handling)
- **Error Handling**: Logo load failures handled with `onError` callback and placeholder text fallback (research.md section 2)
- **Security**: No sensitive data handling required (presentation layer only)
- **i18n**: Not in scope for this feature (English only)

**Gate Status**: ✅ **PASS** (Pre-Phase 0) → ✅ **PASS** (Post-Phase 1 Design)

## Project Structure

### Documentation (this feature)

```text
specs/002-get-started-screen/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── _layout.tsx           # Root layout with auth guards (existing)
├── index.tsx             # Main authenticated screen (existing)
└── get-started.tsx       # NEW: Get started screen for unauthenticated users

components/
├── ui/                   # React Native Reusables components (existing)
│   ├── button.tsx
│   ├── text.tsx
│   └── ...
└── get-started-screen.tsx  # NEW: Optional component if screen logic is complex

tests/
└── onboarding/
    └── get-started.test.tsx  # NEW: Tests for get started screen
```

**Structure Decision**: Single Expo React Native project structure. The get started screen will be added as a new route in the `app/` directory following Expo Router conventions. The screen will be protected by the existing auth guard system in `_layout.tsx` to show only when `!isAuthenticated`. Component logic can be inline in the screen file or extracted to `components/get-started-screen.tsx` if it becomes complex.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. This feature follows all constitutional principles without requiring exceptions.

---

## Phase 0 & Phase 1 Completion Summary

### Phase 0: Research ✅

**Generated**: `research.md`

Resolved all technical questions:

1. ✅ Expo Router authentication guard integration pattern
2. ✅ Logo loading with error handling approach
3. ✅ Accessibility implementation strategy
4. ✅ Loading state during authentication check
5. ✅ Navigation to sign-up and sign-in screens

All research questions answered with clear decisions, rationale, and implementation notes.

### Phase 1: Design & Contracts ✅

**Generated Artifacts**:

- ✅ `data-model.md` - Confirmed no data entities (presentation layer only)
- ✅ `contracts/README.md` - Confirmed no API contracts needed (client-side only)
- ✅ `quickstart.md` - Complete testing and exercise guide
- ✅ Agent context updated via `update-agent-context.sh`

**Design Decisions**:

- Screen will be added to `app/(auth)/get-started.tsx` (or `app/get-started.tsx` if outside auth group)
- Protected by `Stack.Protected guard={!isAuthenticated}` in `_layout.tsx`
- Uses existing React Native Reusables components (Button, Text)
- Implements logo error handling with placeholder text fallback
- Supports dark mode via Nativewind theme system
- Includes accessibility props for screen readers and keyboard navigation

### Next Steps

Phase 2 (Task Creation) should be executed via `/speckit.tasks` command to break down implementation into actionable tasks.
