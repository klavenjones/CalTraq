# Tasks: Get Started Screen

**Input**: Design documents from `/specs/002-get-started-screen/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are included as they are mentioned in the constitution check and quickstart.md as requirements for this feature.

**Organization**: Tasks are organized by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile app**: `app/` for screens, `components/` for reusable components, `tests/` for tests
- All paths are relative to repository root: `/Users/klavenjones/Documents/CalTraq`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project setup and dependencies

- [ ] T001 Verify environment variables are configured in `.env.local` (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, EXPO_PUBLIC_CONVEX_URL)
- [ ] T002 [P] Verify dependencies are installed (run `yarn install` if needed)
- [ ] T003 [P] Verify Expo and Convex dev servers can start successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before the user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Add get-started route to auth guard in `app/_layout.tsx` (inside `Stack.Protected guard={!isAuthenticated}` block)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - First-time user discovers the app (Priority: P1) 🎯 MVP

**Goal**: A new user opens the CalTraq app for the first time and sees an inviting welcome screen that introduces the app's purpose and provides a clear path to get started.

**Independent Test**: A tester can open the app while not authenticated, see the get started screen with all required elements (logo, caption, button, sign-in link), interact with the "Get Started" button to navigate to account creation, and use the "Already have an account?" link to navigate to sign-in. The screen can be fully tested independently and delivers immediate value by providing clear navigation paths.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Create test file `tests/onboarding/get-started.test.tsx` with test structure
- [ ] T006 [P] [US1] Add test for screen rendering with all elements (logo, caption, button, link) in `tests/onboarding/get-started.test.tsx`
- [ ] T007 [P] [US1] Add test for loading state during auth check in `tests/onboarding/get-started.test.tsx`
- [ ] T008 [P] [US1] Add test for navigation to sign-up screen in `tests/onboarding/get-started.test.tsx`
- [ ] T009 [P] [US1] Add test for navigation to sign-in screen in `tests/onboarding/get-started.test.tsx`
- [ ] T010 [P] [US1] Add test for logo error handling (placeholder text) in `tests/onboarding/get-started.test.tsx`
- [ ] T011 [P] [US1] Add test for accessibility (screen reader labels, focus order) in `tests/onboarding/get-started.test.tsx`
- [ ] T012 [P] [US1] Add test for authenticated user redirect (get-started screen not shown when user is authenticated) in `tests/onboarding/get-started.test.tsx` (covers FR-007, FR-010)

### Implementation for User Story 1

- [ ] T013 [US1] Create get-started screen component in `app/(auth)/get-started.tsx` with basic structure
- [ ] T014 [US1] Add authentication state checking with loading indicator in `app/(auth)/get-started.tsx` (use `useAuth()` from Clerk)
- [ ] T015 [US1] Implement logo display with error handling and placeholder fallback in `app/(auth)/get-started.tsx`
- [ ] T016 [US1] Add caption text "Log your Calories the Right Way" in `app/(auth)/get-started.tsx`
- [ ] T017 [US1] Implement "Get Started" button with navigation to sign-up screen in `app/(auth)/get-started.tsx` (use `useRouter()` from Expo Router)
- [ ] T018 [US1] Implement "Already have an account? Sign In" text with clickable "Sign In" link in `app/(auth)/get-started.tsx` (use `Link` component from Expo Router)
- [ ] T019 [US1] Add vertically centered layout styling using Nativewind in `app/(auth)/get-started.tsx` (logo at top, caption below, button below caption, link below button, all centered horizontally)
- [ ] T020 [US1] Add dark mode support using `useColorScheme()` and theme-aware colors in `app/(auth)/get-started.tsx`
- [ ] T021 [US1] Add accessibility props (accessibilityLabel, accessibilityRole) to button and link in `app/(auth)/get-started.tsx`
- [ ] T022 [US1] Add safe area handling to ensure content respects device notches/status bars in `app/(auth)/get-started.tsx`
- [ ] T023 [US1] Add navigation debouncing/guard to prevent duplicate navigation states on rapid button taps in `app/(auth)/get-started.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across the feature

- [ ] T023 [P] Run all tests and ensure they pass in `tests/onboarding/get-started.test.tsx`
- [ ] T024 [P] Verify screen loads within 1 second on standard mobile devices (performance validation)
- [ ] T025 [P] Test on iOS simulator and verify layout and functionality
- [ ] T026 [P] Test on Android emulator and verify layout and functionality
- [ ] T027 [P] Test on Web platform and verify layout and functionality
- [ ] T028 [P] Verify dark mode works correctly on all platforms
- [ ] T029 [P] Test accessibility with screen reader (VoiceOver/TalkBack) on physical devices
- [ ] T030 [P] Verify authenticated users are redirected away from get-started screen (auth guard validation)
- [ ] T031 [P] Validate responsive design across different screen sizes and orientations (phone, tablet, portrait, landscape) - ensures no text truncation or overlapping elements per SC-005 and edge case spec.md:L38
- [ ] T032 [P] Run quickstart.md validation steps and document any issues
- [ ] T033 Code cleanup and ensure TypeScript strict mode compliance
- [ ] T034 Verify all functional requirements (FR-001 through FR-013) are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user story
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (T004 must complete before T013)
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within User Story 1

- Tests (T005-T012) MUST be written and FAIL before implementation
- Screen component structure (T013) before feature implementation
- Auth state checking (T014) before UI elements
- Logo implementation (T015) before other UI elements
- UI elements (T016-T018) can be implemented in parallel after T013-T015
- Styling and accessibility (T019-T022) after core UI elements
- Navigation guard (T023) after navigation implementation

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 3 Tests**: All test tasks (T005-T012) can run in parallel (all in same file but different test cases)
- **Phase 3 Implementation**: 
  - T016, T017, T018 can be implemented in parallel (different UI elements)
  - T019, T020, T021, T022 can be implemented in parallel (different styling/accessibility concerns)
- **Phase 4**: All polish tasks (T023-T033) can run in parallel (different validation concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
# All test tasks T005-T012 can be written in parallel within the same test file

# Launch UI element implementation in parallel:
Task: "Add caption text in app/(auth)/get-started.tsx" (T016)
Task: "Implement Get Started button in app/(auth)/get-started.tsx" (T017)
Task: "Implement Sign In link in app/(auth)/get-started.tsx" (T018)

# Launch styling/accessibility in parallel:
Task: "Add vertically centered layout styling in app/(auth)/get-started.tsx" (T019)
Task: "Add dark mode support in app/(auth)/get-started.tsx" (T020)
Task: "Add accessibility props in app/(auth)/get-started.tsx" (T021)
Task: "Add safe area handling in app/(auth)/get-started.tsx" (T022)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T005-T023)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md
5. Complete Phase 4: Polish (T024-T034)
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Each checkpoint allows validation before proceeding

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: Write tests (T005-T012)
   - Developer B: Implement screen structure and auth checking (T013-T015)
3. After tests and structure:
   - Developer A: Implement UI elements (T016-T018)
   - Developer B: Implement styling and accessibility (T019-T022)
4. Final: Navigation guard and polish together

---

## Notes

- [P] tasks = different concerns, can be worked on simultaneously
- [US1] label maps task to User Story 1 for traceability
- User Story 1 should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at checkpoint to validate story independently
- All file paths are relative to repository root
- Follow existing codebase patterns from `app/index.tsx` and `app/_layout.tsx`
- Use React Native Reusables components (Button, Text) as per constitution
- Use Nativewind for styling as per constitution
- Ensure TypeScript strict mode compliance

---

## Task Summary

- **Total Tasks**: 34
- **Setup Tasks**: 3 (T001-T003)
- **Foundational Tasks**: 1 (T004)
- **User Story 1 Tasks**: 19 (T005-T023)
  - Test Tasks: 8 (T005-T012)
  - Implementation Tasks: 11 (T013-T023)
- **Polish Tasks**: 11 (T024-T034)

**Suggested MVP Scope**: Phases 1-3 (User Story 1 only) = 23 tasks

**Parallel Opportunities Identified**:
- Phase 1: 2 parallel tasks
- Phase 3 Tests: 8 parallel test cases (includes authenticated user redirect test)
- Phase 3 Implementation: 3 parallel UI tasks, 4 parallel styling tasks
- Phase 4: 11 parallel validation tasks (includes responsive design validation)

**Independent Test Criteria for User Story 1**: A tester can open the app while not authenticated, see the get started screen with all required elements (logo, caption, button, sign-in link), interact with the "Get Started" button to navigate to account creation, and use the "Already have an account?" link to navigate to sign-in. The screen can be fully tested independently and delivers immediate value by providing clear navigation paths.

