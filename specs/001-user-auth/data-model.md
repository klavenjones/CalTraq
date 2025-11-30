# Caltraq User Accounts and Authentication – Data Model

**Feature Branch**: `001-user-auth`  
**Date**: 2025-11-29

This data model covers entities required for Caltraq user accounts and authentication, focusing on
how Clerk identities map to Convex-stored application data.

---

## Entity: UserAccount

Represents an individual Caltraq user who can sign in and access account-only features. Stored as a
document in Convex and keyed by Clerk user ID.

### Fields

- **id**: Internal unique identifier for the UserAccount record (Convex document ID).
- **clerkUserId**: External unique identifier from Clerk; used to join identity to application
  data.
- **email**: Primary email address associated with the account, as provided via Clerk.
- **createdAt**: Timestamp when the UserAccount record was first created.
- **status**: High-level account status (for example, `active`, `suspended`, `deleted`).
- **lastSignInAt**: Timestamp of the most recent successful sign-in.

### Relationships

- One **UserAccount** is associated with exactly one Clerk user.
- Future entities such as metabolic settings, logs, and goals will reference **UserAccount** via
  `userAccountId` or `clerkUserId`.

### State Transitions

- `pending` → `active` when account creation is completed successfully.
- `active` → `suspended` when access is temporarily restricted.
- `active` or `suspended` → `deleted` when the user or system permanently removes access.

---

## Entity: AuthenticationSession

Represents a period during which a user is signed in and allowed to access account-only features.
Primarily managed by Clerk, but key metadata may be mirrored or referenced in Convex for auditing
and analytics.

### Fields

- **id**: Unique session identifier (may incorporate Clerk session ID).
- **userAccountId**: Reference to the associated **UserAccount**.
- **createdAt**: Timestamp when the session started.
- **expiresAt**: Timestamp when the session is scheduled to expire.
- **lastActivityAt**: Timestamp of the last observed authenticated activity.
- **clientInfo**: High-level information about the client (for example, platform or device type).

### Relationships

- Each **AuthenticationSession** belongs to exactly one **UserAccount**.
- A **UserAccount** may have multiple concurrent **AuthenticationSession** records (for example,
  multiple devices).

### State Transitions

- `active` → `expired` when the session reaches `expiresAt` without renewal.
- `active` → `revoked` when the user signs out or the system forcibly terminates the session.

---

## Entity: RecoveryRequest

Represents an initiated attempt to regain access to a user account. The underlying verification
mechanism is handled by Clerk, but Caltraq may track the existence and status of recovery attempts
for analytics or abuse detection.

### Fields

- **id**: Unique identifier for the recovery request record.
- **userAccountId**: Reference to the associated \*\*UserAccount`, if known.
- **identifierUsed**: The identifier supplied to initiate recovery (for example, email address).
- **createdAt**: Timestamp when the recovery request was initiated.
- **resolvedAt**: Timestamp when the recovery process completed successfully.
- **status**: Current status (for example, `pending`, `completed`, `failed`, `expired`).

### Relationships

- A **RecoveryRequest** is associated with at most one **UserAccount**; some requests may refer to
  identifiers that do not map to any existing account.

### State Transitions

- `pending` → `completed` when the user successfully regains access.
- `pending` → `failed` when verification fails.
- `pending` → `expired` when the recovery window elapses without completion.
