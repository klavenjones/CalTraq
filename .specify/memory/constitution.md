<!--
Sync Impact Report
- Version change: 0.0.0 (template) → 1.0.0
- Modified principles: Replaced generic library/CLI/testing placeholders with CalTraq Expo React Native TypeScript rules
- Added sections: Concrete Expo/Clerk/React Native Reusables stack constraints; explicit development workflow and governance rules
- Removed sections: Template-only comments and placeholder tokens
- Templates requiring updates: 
  - .specify/templates/plan-template.md – ✅ aligned (uses generic “Constitution Check” that now refers to this constitution)
  - .specify/templates/spec-template.md – ✅ no constitution-specific coupling
  - .specify/templates/tasks-template.md – ✅ no constitution-specific coupling
- Follow-up TODOs: None (all placeholder fields in this constitution are concretely defined)
-->

# CalTraq Constitution

## Core Principles

### Principle 1 – Typed, Functional, Modular Expo React Native Code

CalTraq code MUST be written in TypeScript using functional React components and modular,
reusable helpers. Files MUST have a clear single responsibility, avoid duplication, and
prefer composable utilities over deeply nested components.

- Code MUST use TypeScript with strict type checking enabled for the project.
- Components and utilities MUST be implemented as functions (no classes) and expose
  well-typed props and return values.
- Naming MUST be descriptive and state intent, using auxiliary verbs where relevant
  (for example, `isLoading`, `hasError`, `shouldRenderAvatar`).
- File structure MUST be organized and predictable: exported component first, then
  subcomponents, helpers, static content, and shared types.
- Code MUST favor clear iteration and small, focused functions over copy‑pasted logic.
- Formatting MUST be enforced by Prettier (or equivalent project formatter) and follow
  a consistent linting configuration.

**Rationale**: Strong typing, functional patterns, and clear structure reduce runtime
errors, make refactors safer, and keep the Expo React Native codebase maintainable as
CalTraq grows.

### Principle 2 – UI, Styling, and Layout with React Native Reusables

CalTraq UI MUST primarily use the React Native Reusables component library, with Expo
core components used only when no suitable reusable component exists. Styling MUST use
Tailwind CSS via Nativewind, support dark mode, and respect safe areas on all devices.

- Screens and shared UI MUST default to React Native Reusables components for buttons,
  inputs, layout primitives, and feedback elements.
- Tailwind utility classes via Nativewind MUST be the primary styling mechanism; custom
  styles SHOULD be encapsulated and minimal.
- Layouts MUST respect safe areas using `SafeAreaProvider` at the root and safe area
  wrappers for screen content; hard‑coded status bar or notch offsets are forbidden.
- Dark mode support MUST be implemented using the current color scheme (for example,
  Expo `useColorScheme`) and tested in both light and dark themes.
- Components MUST meet accessibility expectations by using appropriate accessibility
  props and roles, and text MUST be legible with sufficient contrast.

**Rationale**: A consistent UI stack with safe area handling and dark mode reduces
visual bugs, accelerates development, and keeps CalTraq visually aligned across iOS,
Android, and Web.

### Principle 3 – State Management, Data Fetching, and Performance

CalTraq MUST minimize unnecessary component state and effects, preferring structured
state management and efficient data fetching to keep the app responsive.

- Global or shared state MUST be managed with React Context and `useReducer` where
  appropriate, rather than scattering `useState` across the tree.
- Data fetching and caching SHOULD use libraries such as React Query when network
  complexity warrants it, to avoid duplicated requests and ad‑hoc caching.
- Hooks MUST be pure and side‑effect boundaries must be clear; avoid expensive work
  inside render paths.
- Components that are re‑rendered frequently MUST use `React.memo`, `useMemo`, and
  `useCallback` where it measurably reduces rendering cost and avoids regressions.
- Images MUST be optimized (for example, WebP where supported) and loaded efficiently,
  using lazy loading where appropriate.
- Non‑critical screens or flows SHOULD be lazily loaded using React’s lazy/Suspense or
  Expo Router features to keep startup time low.

**Rationale**: Explicit state and performance discipline keeps CalTraq fast, reduces
UI jank, and helps meet mobile performance expectations on a wide range of devices.

### Principle 4 – Navigation, Workflow, and Platform Coverage

CalTraq navigation MUST be implemented with Expo Router and React Navigation best
practices, support deep linking where needed, and work consistently across iOS,
Android, and Web.

- Routes MUST be defined using Expo Router conventions, with clear folder and file
  structures and predictable URL/route mapping.
- Navigation flows MUST be tested for back behavior, authentication guards, and edge
  cases (for example, deep links to protected screens).
- When deep linking or universal links are required, configuration MUST be explicit and
  verified on all target platforms.
- The project MUST rely on Expo’s managed workflow for build, updates, and runtime
  configuration where practical.
- New features MUST be validated on both iOS and Android simulators/emulators (and Web
  where supported) before being considered complete.

**Rationale**: Correct navigation and consistent platform behavior are central to user
trust; Expo Router and React Navigation provide mature patterns that CalTraq MUST
respect.

### Principle 5 – Reliability, Testing, Error Handling, Security, and i18n

CalTraq MUST treat testing, error handling, security, and internationalization as
first‑class concerns, not optional polish.

- Critical user flows (authentication, password reset, primary tracking flows) MUST
  have automated tests using Jest and React Native Testing Library; end‑to‑end or
  integration coverage SHOULD be added with Detox for high‑risk flows.
- Input validation MUST use robust runtime validation (for example, Zod) for complex
  payloads or form inputs.
- Errors MUST be handled with early returns and clear branches; avoid deeply nested
  conditionals and unhandled promise rejections.
- Production errors MUST be logged and monitored via Sentry or an equivalent error
  reporting tool; Expo‑compatible error reporting SHOULD be wired into releases.
- Sensitive data (for example, tokens, secrets) MUST be stored using secure storage
  mechanisms such as `react-native-encrypted-storage` or Expo‑recommended secure
  alternatives.
- All HTTP traffic MUST use HTTPS and authenticated APIs MUST enforce correct auth
  flows (for example, via Clerk).
- Internationalization and localization MUST use an appropriate library (for example,
  Expo Localization) when multi‑language support is in scope; text and layouts MUST
  respect dynamic text sizing and, where required, right‑to‑left (RTL) layouts.

**Rationale**: Systematic testing, error handling, security, and i18n are necessary to
ship CalTraq safely to real users and to avoid regressions during iteration.

## Expo React Native Stack Constraints & Standards

This section defines non‑negotiable technology and configuration constraints for
CalTraq.

- The app MUST be built with Expo (managed workflow) and React Native, using Expo
  Router for navigation.
- Authentication MUST be implemented with Clerk, configured via environment variables
  stored in `.env.local` and referenced using Expo’s public config keys.
- UI MUST be powered primarily by React Native Reusables; Tailwind/Nativewind MUST be
  the main styling approach.
- New features MUST consider Mobile Web Vitals: load time, jank, and responsiveness, and
  avoid regressions in these metrics where they are measured.
- Environment and build configuration MUST use Expo’s configuration mechanisms
  (`app.json`/`app.config`) and `expo-constants` for runtime configuration where
  appropriate.
- Device permissions MUST be requested via Expo permissions APIs with clear user
  rationale and minimal scope.
- Over‑the‑air updates SHOULD be handled with `expo-updates` when the deployment
  strategy includes OTA delivery.

Documentation for stack‑level behavior and expectations MUST reference official Expo,
React Native, Clerk, Nativewind, and React Native Reusables documentation where
relevant.

## Development Workflow, Review Process, and Quality Gates

This section describes how the constitution is applied during day‑to‑day development.

- Every feature plan and specification MUST include a “Constitution Check” section that
  explicitly calls out:
  - TypeScript/architecture implications (Principle 1),
  - UI/safe area/dark mode implications (Principle 2),
  - State/performance implications (Principle 3),
  - Navigation/platform coverage (Principle 4),
  - Testing, error handling, security, and i18n scope (Principle 5).
- Before implementation begins, the feature plan MUST be reviewed to ensure no known
  violations of this constitution are being introduced without explicit justification.
- Pull requests MUST:
  - Link to the corresponding spec/plan where applicable.
  - Declare any intentional constitution deviations, with rationale and follow‑up
    tasks.
  - Include tests or explicit justification when tests are deferred.
- Reviewers MUST block changes that materially violate this constitution unless a
  time‑boxed exception is documented with a clear owner and due date.
- Quickstart and README documentation SHOULD be updated when changes affect the
  onboarding or primary user flows.

Quality gates SHOULD be automated where feasible (for example, linting, type‑checking,
tests, and simple static checks for common pitfalls), but human review remains
responsible for architecture, UX, and security decisions.

## Governance

The CalTraq Constitution defines binding engineering practices for this repository and
supersedes ad‑hoc style guides or historical patterns that conflict with it.

### Amendment Procedure

- Amendments MUST be proposed via pull request that:
  - Clearly describes the motivation and nature of the change.
  - Identifies which principles or sections are affected.
  - Proposes a new semantic version for the constitution.
- At least one designated maintainer MUST approve any amendments that change
  principles, constraints, or governance rules.
- When an amendment is merged, the `Version`, `Ratified`, and `Last Amended` fields in
  this document MUST be updated as described in the Versioning Policy.

### Versioning Policy

CalTraq’s constitution uses semantic versioning (`MAJOR.MINOR.PATCH`):

- **MAJOR**: Backward‑incompatible changes to principles or governance, such as
  removing a principle, reversing a rule, or allowing previously forbidden patterns.
- **MINOR**: Adding a new principle or section, or materially expanding guidance in a
  way that tightens standards without contradicting prior versions.
- **PATCH**: Clarifications, examples, typo fixes, and non‑semantic rewording that do
  not change obligations.

The version bump level MUST be justified in the amendment pull request description.

### Compliance and Review

- All plans, specs, and task lists generated for CalTraq MUST treat this constitution
  as the source of truth for engineering constraints and quality expectations.
- Code reviews MUST consider constitution compliance alongside correctness and
  usability.
- If a feature cannot reasonably comply with a specific rule (for example, due to
  platform limitations), the exception MUST be documented in the relevant spec/plan
  with clear scope and duration.
- Periodic reviews (for example, quarterly) SHOULD evaluate whether the constitution
  still reflects real project needs and whether new patterns (libraries, tooling,
  workflows) should be adopted or codified.

**Version**: 1.0.0 | **Ratified**: 2025-11-29 | **Last Amended**: 2025-11-29

