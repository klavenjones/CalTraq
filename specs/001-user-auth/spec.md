# Feature Specification: Caltraq User Accounts and Authentication

**Feature Branch**: `001-user-auth`  
**Created**: 2025-11-29  
**Status**: Draft  
**Input**: User description: "I am creating an app called Caltraq is a modern calorie-tracking and progress-monitoring app built on proven metabolic science. Using the Katch–McArdle formula and lean body mass calculations, Caltraq gives users accurate daily calorie and protein targets, not generic estimates. Users log their daily intake and weight, and Caltraq automatically analyzes trends, calculates real-world TDEE, and shows whether they’re on track toward their goals. The first feature I want to plan for is User accounts and Authentication which will allow Let users create accounts so their Katch–McArdle settings, logs, and goals persist across devices."

## Clarifications

### Session 2025-11-29

- Q: Which authentication methods are in scope for the first release? → A: Email/password plus Apple/Google sign-in

## Constitution Check

This feature has been designed to comply with the Caltraq Constitution:

- **Principle 1 – Typed, Functional, Modular Expo React Native Code**: All authentication screens and helpers will be implemented as typed functional components and utilities in TypeScript, with clear separation of concerns and no classes.
- **Principle 2 – UI, Styling, and Layout with React Native Reusables**: Sign-in, sign-up, password recovery, and account-related UI will use React Native Reusables components styled via Nativewind, supporting dark mode and respecting safe areas.
- **Principle 3 – State Management, Data Fetching, and Performance**: Authentication state will be centralized via Clerk and shared helpers; Convex calls will be structured to avoid unnecessary re-renders or duplicate network requests.
- **Principle 4 – Navigation, Workflow, and Platform Coverage**: Auth routes will be implemented with Expo Router, with guarded access to protected screens and consistent behavior across iOS, Android, and Web.
- **Principle 5 – Reliability, Testing, Error Handling, Security, and i18n**: Critical auth flows (sign-up, sign-in, password reset, SSO) will have automated tests; errors will be handled with clear user-facing messages; communication with Clerk and Convex will occur over HTTPS, and sensitive data will be stored using secure mechanisms.

No intentional constitution violations are planned for this feature. Any deviation MUST be documented in the implementation plan and pull requests.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and access a Caltraq account (Priority: P1)

A new user wants to create a Caltraq account so their metabolic settings, intake logs, and goals
are saved and can be accessed on any device.

**Why this priority**: Without accounts, Caltraq cannot persist settings or logs across sessions
and devices, which makes the rest of the app’s value (accurate tracking and progress monitoring)
impossible to deliver.

**Independent Test**: A tester can create a new account, sign out, sign in again on a different
device or browser, and see that their profile information and tracking data are still present
and associated with the same account.

**Acceptance Scenarios**:

1. **Given** a new visitor without an account, **When** they provide required account details and
   confirm any required terms, **Then** a new Caltraq account is created and the user is signed in.
2. **Given** a signed-up user on one device, **When** they sign in on a second device with the
   same credentials, **Then** they gain access to the same account and see the same settings,
   logs, and goals.
3. **Given** a user who has completed account creation, **When** they close and reopen the app,
   **Then** they can access their account again without re-creating it.
4. **Given** a user who begins account creation but closes the app or navigates away before completion, **When** they later return to the sign-up flow with the same identifier, **Then** the system either resumes the flow safely or starts a clean sign-up without creating duplicate or broken account records.
5. **Given** a previously abandoned sign-up attempt, **When** the system cleans up related temporary records, **Then** no orphaned `UserAccount` or `RecoveryRequest` documents remain that could confuse future sign-ups.

---

### User Story 2 - Secure login and logout (Priority: P2)

A returning user wants to sign in securely to Caltraq and sign out when finished so that their
data is protected on shared or personal devices.

**Why this priority**: Reliable sign-in and sign-out are required to protect users’ health and
body composition data and to ensure that only the right person can access or change their
settings.

**Independent Test**: A tester can sign in with valid credentials, attempt to sign in with
invalid credentials, and sign out, confirming that access is granted or denied appropriately and
that the app behaves correctly when the session ends.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they provide valid credentials on the sign-in screen,
   **Then** they are granted access to their Caltraq account and can navigate to their tracking
   features.
2. **Given** a registered user, **When** they provide invalid credentials (such as a wrong
   password), **Then** access is denied and they see a clear, non-technical message explaining
   that the details are incorrect without revealing which field is wrong.
3. **Given** a signed-in user on a shared device, **When** they choose to sign out, **Then** they
   are logged out, and subsequent attempts to access account-only pages require signing in again.

---

### User Story 3 - Password and access recovery (Priority: P3)

A user who has forgotten their password wants to regain access to their Caltraq account without
losing their historical settings, logs, or goals.

**Why this priority**: Without a recovery path, users who lose access would have to start over
with a new account or abandon Caltraq, which harms retention and trust.

**Independent Test**: A tester can initiate an account recovery flow from the sign-in experience,
follow the steps to prove ownership, set a new password or regain access, and confirm that all
previous data remains intact.

**Acceptance Scenarios**:

1. **Given** a user on the sign-in screen, **When** they indicate they have forgotten their
   password and provide the required identifier (such as an email address), **Then** they receive
   clear instructions to regain access via a secure recovery flow.
2. **Given** a user who completes the recovery flow and sets a new password, **When** they sign
   in with the updated credentials, **Then** they regain full access to their existing Caltraq
   account with all prior settings, logs, and goals intact.
3. **Given** a user who enters an identifier that is not associated with any Caltraq account during the recovery flow, **When** they submit the recovery request, **Then** the system responds with a neutral message (for example, “If an account exists for this email, we’ve sent instructions”) and does not indicate whether the identifier is registered.

---

### Edge Cases

- What happens when a user attempts to create an account with an identifier (such as email) that
  is already associated with an existing Caltraq account? **→ Addressed by FR-002 and related
  sign-up validation tests.**
- How does the system handle repeated failed sign-in attempts (for example, multiple wrong
  passwords in a row) without locking out legitimate users permanently? **→ Addressed by FR-008,
  lockout UX in User Story 2, and T020/T039/T040 tests.**
- What happens when a user tries to access account-only screens without being signed in (for
  example, deep link or bookmarked URL)? **→ Addressed by FR-010 and route guards in User Story 2.**
- How does the system behave if a user begins account creation but abandons the process before
  completion? **→ Addressed by FR-011 and abandoned sign-up tasks/tests (T031–T033).**
- What happens when a user attempts to use the recovery flow with an identifier that is not
  associated with any Caltraq account? **→ Addressed by FR-012 and neutral recovery messaging
  tasks/tests (T034–T035).**

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST allow new users to create a Caltraq account by providing required
  personal details (for example, name and unique identifier such as an email address) and
  setting secure sign-in credentials (email/password).
- **FR-002**: The system MUST validate that the chosen account identifier is unique and provide a
  clear, non-technical message when an existing account uses the same identifier.
- **FR-003**: Users MUST be able to sign in to their existing Caltraq account using their chosen
  credentials and gain access to account-only features, using either email/password or supported
  third-party sign-in options (Apple and Google).
- **FR-004**: The system MUST maintain a persistent association between each account and that
  user’s Katch–McArdle configuration, historical logs, and goals so that these data are available
  after signing out, closing the app, or switching devices (**data persistence guarantee**).
- **FR-005**: Users MUST be able to explicitly sign out of their account, and after sign-out,
  account-only pages MUST no longer be accessible without signing in again.
- **FR-006**: The system MUST provide a guided account recovery flow for users who cannot remember
  their credentials, enabling them to regain access without creating a duplicate account.
- **FR-007**: The system MUST present user-friendly error messages for invalid sign-in attempts
  and other authentication failures without exposing sensitive technical details.
- **FR-008**: The system MUST prevent automated guessing of credentials by limiting the impact of
  repeated failed sign-in attempts while still allowing legitimate users to recover access.
- **FR-009**: The system MUST ensure that a single user can access the same Caltraq account from
  multiple devices, with consistent access to their saved data (**cross-device consistency on top
  of FR-004’s persistence**).
- **FR-010**: The system MUST only grant access to account-only features when the user has an
  active, valid authenticated session (**access control and session gating, independent of how
  data is persisted or shared across devices**).
- **FR-011**: The system MUST handle partially completed account creation attempts so that abandoned sign-up flows do not result in orphaned or inconsistent account records, and users can safely restart the process.
- **FR-012**: When a user initiates account recovery with an identifier that does not match any existing Caltraq account, the system MUST respond with a clear, non-technical message that does not reveal whether an account exists for that identifier.

### Key Entities _(include if feature involves data)_

- **User Account**: Represents an individual Caltraq user who can sign in and access
  account-only features. Includes attributes such as unique identifier (for example, email),
  authentication credentials, creation date, and account status.
- **Authentication Session**: Represents a period during which a user is signed in and allowed to
  access account-only features. Includes attributes such as the associated user account, start
  time, expiration time, and device or client information.
- **Recovery Request**: Represents an initiated attempt to regain access to a user account.
  Includes attributes such as the identifier used to start recovery, creation time, status, and
  expiration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 90% of new users who start the account creation process are able to
  complete it and sign in successfully on their first attempt.
- **SC-002**: At least 95% of sign-in attempts with correct credentials complete in under
  3 seconds under normal operating conditions on typical consumer mobile networks (for example,
  4G/Wi‑Fi) using current supported devices.
- **SC-003**: At least 90% of users who request account recovery and follow the provided steps
  regain access to their existing account without contacting support.
- **SC-004**: After launch of this feature, fewer than 2% of active users report losing access to
  their historical settings, logs, or goals due to account or authentication issues.
