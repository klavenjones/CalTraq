# Implementation Plan: Caltraq User Accounts and Authentication

**Branch**: `001-user-auth` | **Date**: 2025-11-29 | **Spec**: `specs/001-user-auth/spec.md`
**Input**: Feature specification from `specs/001-user-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Caltraq user accounts and authentication so that each user can securely create an
account, sign in (including via Apple/Google), recover access, and see consistent metabolic
settings, logs, and goals across devices. This plan integrates the existing Clerk-based
authentication in the Expo app with Convex as the persistent application database for user
account records linked to future tracking features.

## Technical Context

**Language/Version**: TypeScript, Expo React Native (current stable SDK)  
**Primary Dependencies**: Expo, React Native, Expo Router, Clerk (authentication), Convex (backend data persistence), React Native Reusables, Nativewind  
**Storage**: Convex database for user accounts and auth-linked app data keyed by Clerk user IDs  
**Testing**: Jest and React Native Testing Library for unit and integration tests; Detox for high-risk end-to-end authentication flows  
**Target Platform**: iOS, Android, and Web via Expo managed workflow  
**Project Type**: Mobile app (single Expo project, Expo Router-based navigation)  
**Performance Goals**: Authentication flows respond in under 3 seconds under normal operating conditions and do not introduce noticeable UI jank during navigation or loading  
**Constraints**: Online-first experience; offline login is not supported in v1; security and privacy for health-related data are prioritized  
**Scale/Scope**: Designed for at least tens of thousands of user accounts with moderate concurrent usage typical of consumer mobile apps

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Based on the Caltraq Constitution:

- **Principle 1 – Typed, Functional, Modular Expo React Native Code**: All authentication screens
  and helpers will be implemented as typed functional components and utilities in TypeScript with
  clear file structure and no classes.
- **Principle 2 – UI, Styling, and Layout with React Native Reusables**: Sign-in, sign-up,
  password recovery, and account-related UI will use React Native Reusables components styled via
  Nativewind, respecting safe areas and dark mode.
- **Principle 3 – State Management, Data Fetching, and Performance**: Authentication state will be
  centralized (for example, in a context hooked into Clerk) and Convex calls will be batched and
  memoized where appropriate to avoid unnecessary re-renders or network traffic.
- **Principle 4 – Navigation, Workflow, and Platform Coverage**: Auth routes will be implemented
  with Expo Router, including guarded access to protected screens and consistent behavior across
  iOS, Android, and Web.
- **Principle 5 – Reliability, Testing, Error Handling, Security, and i18n**: Critical auth flows
  (sign-up, sign-in, password reset, SSO) will have automated tests; secrets and tokens will use
  secure storage; all communication with Clerk and Convex will occur over HTTPS; error messages
  will be user-friendly.

No intentional constitution violations are planned for this feature. Any future deviation MUST be
explicitly documented and justified in this plan and corresponding pull requests.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

app/
├── \_layout.tsx # Root layout and providers (including Clerk context)
├── +html.tsx # Expo Router HTML document for web
├── +not-found.tsx # Not-found route
├── index.tsx # Main app entry screen (gated by auth state)
└── (auth)/ # Authentication routes
├── sign-in.tsx
├── forgot-password.tsx
├── reset-password.tsx
└── sign-up/
├── \_layout.tsx
├── index.tsx
└── verify-email.tsx

components/
├── sign-in-form.tsx
├── sign-up-form.tsx
├── forgot-password-form.tsx
├── reset-password-form.tsx
├── verify-email-form.tsx
├── social-connections.tsx
├── user-menu.tsx
└── ui/ # React Native Reusables-based primitives
├── button.tsx
├── input.tsx
├── card.tsx
├── text.tsx
└── ...

lib/
├── clerk/
│ └── auth.ts # Clerk helpers for current user/session
├── convex/
│ └── auth.ts # Convex helpers for auth-related operations
└── theme.ts # Theming helpers (Nativewind, color schemes)

convex/
└── schema.ts # Convex schema including UserAccount and RecoveryRequest

tests/
├── auth/
│ ├── sign-up.test.tsx
│ ├── sign-in.test.tsx
│ └── recovery.test.tsx
└── e2e/
└── auth-flows.test.ts # End-to-end auth flows (sign-up, sign-in, recovery)**Structure Decision**:

- **Primary app**: Expo Router single project under `app/`
- **Auth UI**: `app/(auth)/` + `components/*-form.tsx`
- **Backend integration**: `convex/` + `lib/clerk/`, `lib/convex/`
- **Tests**: `tests/auth/` (unit/integration) and `tests/e2e/` (end-to-end)

## Complexity Tracking

No additional architectural complexity beyond the standard Expo + Clerk + Convex stack is planned for this feature, and no constitution violations are expected. If a future iteration requires an exception, it will be documented here with justification.
