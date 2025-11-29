# Tasks: Caltraq User Accounts and Authentication

**Input**: Design documents from `/specs/001-user-auth/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`

**Tests**: Critical authentication flows (sign-up, sign-in, password recovery, SSO) MUST have automated tests as per the Caltraq Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for Clerk + Convex integration.

- [ ] T001 Update Convex dependencies and scripts in `package.json`
- [ ] T002 Initialize Convex project configuration in `convex/` directory
- [ ] T003 [P] Verify and document Clerk environment variables usage in `app/_layout.tsx`
- [ ] T004 [P] Scaffold auth helper modules in `lib/clerk/auth.ts` and `lib/convex/auth.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Create Convex schema for `UserAccount` and `RecoveryRequest` entities in `convex/schema.ts`
- [ ] T006 Implement Convex auth functions for user account and session tracking in `convex/auth.ts`
- [ ] T007 [P] Implement Clerk helper functions for current user/session handling in `lib/clerk/auth.ts`
- [ ] T008 [P] Implement Convex client helpers for auth-related operations in `lib/convex/auth.ts`

**Checkpoint**: Foundation ready – Clerk and Convex are wired together; user accounts can be created and read in Convex by Clerk user ID.

---

## Phase 3: User Story 1 – Create and access a Caltraq account (Priority: P1) 🎯 MVP

**Goal**: A new user can create a Caltraq account so their metabolic settings, intake logs, and goals are saved and can be accessed on any device.

**Independent Test**: A tester can create a new account, sign out, sign in again on a different device or browser, and see that their profile information and tracking data are still present and associated with the same account.

### Tests for User Story 1 ⚠️

- [ ] T009 [P] [US1] Add tests for account creation and persistence in `tests/auth/sign-up.test.tsx`
- [ ] T010 [P] [US1] Add cross-device account access test in `tests/e2e/auth-flows.test.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Wire sign-up form to Clerk sign-up and Convex `UserAccount` creation in `components/sign-up-form.tsx`
- [ ] T012 [US1] Ensure `UserAccount` documents are created/updated after successful sign-up in `convex/auth.ts`
- [ ] T013 [US1] Load `UserAccount` on app start for signed-in users in `app/_layout.tsx`
- [ ] T014 [US1] Gate downstream Katch–McArdle flows on presence of a `UserAccount` in `app/index.tsx`

**Checkpoint**: At this point, a user can create an account and see the same account recognized across devices.

---

## Phase 4: User Story 2 – Secure login and logout (Priority: P2)

**Goal**: A returning user can sign in securely (email/password or Apple/Google) and sign out when finished so that their data is protected.

**Independent Test**: A tester can sign in with valid credentials, attempt to sign in with invalid credentials, and sign out, confirming that access is granted or denied appropriately and that protected screens are only accessible when signed in.

### Tests for User Story 2 ⚠️

- [ ] T015 [P] [US2] Add tests for email/password and Apple/Google sign-in flows in `tests/auth/sign-in.test.tsx`
- [ ] T016 [P] [US2] Add integration test for login/logout and protected routes in `tests/e2e/auth-flows.test.ts`

### Implementation for User Story 2

- [ ] T017 [US2] Implement sign-in logic and user-friendly error handling in `components/sign-in-form.tsx`
- [ ] T018 [US2] Add route guards for protected screens based on Clerk session in `app/_layout.tsx`
- [ ] T019 [US2] Implement logout handler clearing auth and account state in `components/user-menu.tsx`
- [ ] T020 [US2] Implement basic lockout UX for repeated failed sign-in attempts in `components/sign-in-form.tsx`

**Checkpoint**: At this point, sign-in and sign-out are secure and protected routes cannot be accessed without an active session.

---

## Phase 5: User Story 3 – Password and access recovery (Priority: P3)

**Goal**: A user who has forgotten their password can regain access to their Caltraq account without losing historical settings, logs, or goals.

**Independent Test**: A tester can initiate recovery from the sign-in experience, complete the steps, and confirm they regain access to the same account data.

### Tests for User Story 3 ⚠️

- [ ] T021 [P] [US3] Add tests for password recovery flows in `tests/auth/recovery.test.tsx`
- [ ] T022 [P] [US3] Add integration test for recovery and re-login in `tests/e2e/auth-flows.test.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Implement “forgot password” entry point and validation in `components/sign-in-form.tsx`
- [ ] T024 [US3] Implement reset-password screen behavior and navigation in `app/(auth)/reset-password.tsx`
- [ ] T025 [US3] Optionally persist recovery attempts as `RecoveryRequest` records in `convex/auth.ts`

**Checkpoint**: All user stories should now be independently functional, and users can recover access to existing accounts.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T026 [P] Update auth quickstart documentation with Clerk + Convex notes in `specs/001-user-auth/quickstart.md`
- [ ] T027 [P] Add a brief auth + persistence overview and links to quickstart in `README.md`
- [ ] T028 [P] Tighten auth-related logging and error messages to avoid leaking sensitive data in `lib/clerk/auth.ts`
- [ ] T029 Run the full auth test suite and fix any failing tests in `tests/`
- [ ] T030 Final code cleanup and refactor for auth modules in `app/(auth)/`, `components/`, `lib/clerk/`, and `lib/convex/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel (if staffed).
  - Or sequentially in priority order (P1 → P2 → P3).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) – No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) – May integrate with US1 but should be independently testable.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) – May integrate with US1/US2 but should be independently testable.

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation.
- Shared entities and helpers (Convex schema, auth helpers) come from Phases 1–2.
- Core implementation for the story should be completed before integration with later stories.
- Each story should be independently testable against the acceptance criteria in `spec.md`.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel (within Phase 2).
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows).
- All tests for a user story marked [P] can run in parallel.
- Different user stories can be worked on in parallel by different team members.

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "T009 [P] [US1] Add tests for account creation and persistence in tests/auth/sign-up.test.tsx"
Task: "T010 [P] [US1] Add cross-device account access test in tests/e2e/auth-flows.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL – blocks all stories).
3. Complete Phase 3: User Story 1 (account creation + persistence).
4. **STOP and VALIDATE**: Test User Story 1 independently (including cross-device behavior).
5. Deploy/demo if ready.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP).
3. Add User Story 2 → Test independently → Deploy/Demo.
4. Add User Story 3 → Test independently → Deploy/Demo.
5. Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Once Foundational is done:
   - Developer A: User Story 1 (account creation and persistence).
   - Developer B: User Story 2 (secure login/logout).
   - Developer C: User Story 3 (recovery).
3. Stories complete and integrate independently, then Polish phase finishes cross-cutting work.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story should be independently completable and testable.
- Verify tests fail before implementing.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence.


