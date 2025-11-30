# Caltraq User Accounts and Authentication – Research

**Feature Branch**: `001-user-auth`  
**Date**: 2025-11-29

This document captures key design decisions and rationale for integrating Clerk authentication
with Convex so that Caltraq user accounts are persisted and can be accessed consistently across
devices.

---

## Decision 1 – Identity and persistence model

**Decision**: Use Clerk as the source of truth for user identity and credentials, and Convex as the
application database for user account records keyed by Clerk user IDs.

**Rationale**:

- Clerk already powers authentication in the Expo app and provides secure handling of passwords and
  SSO (Apple/Google).
- Convex is well-suited to storing application-specific documents tied to a user, such as
  Katch–McArdle configuration, logs, and goals.
- Keying Convex documents by Clerk user ID keeps identity concerns in Clerk while allowing
  application data to evolve independently.

**Alternatives considered**:

- Store all user information solely in Clerk metadata: rejected because it couples app data tightly
  to the auth provider and makes future data modeling for tracking features more difficult.
- Introduce a separate custom backend service in addition to Convex: rejected for v1 due to added
  operational complexity and overlap with Convex capabilities.

---

## Decision 2 – Client authentication flow (Expo + Clerk + Convex)

**Decision**: The Expo client will authenticate users with Clerk, obtain a Clerk-backed session,
and pass the associated user identity to Convex functions that operate on user account records.

**Rationale**:

- Keeps credentials and sensitive auth flows inside Clerk; Convex only sees a trusted user
  identifier and any derived claims needed for authorization.
- Aligns with best practices where the frontend uses the auth provider’s SDK and backend persistence
  treats the auth provider as an identity oracle rather than duplicating authentication logic.

**Alternatives considered**:

- Directly sending raw passwords or secrets from the client to Convex: rejected as unnecessary and
  less secure than relying on Clerk.
- Building a custom token format for Convex instead of Clerk’s session-based model: rejected for
  v1 because it adds complexity without clear benefit.

---

## Decision 3 – Data retention and account lifecycle (auth scope)

**Decision**: For this feature, Caltraq will retain user account records and associated auth-linked
state indefinitely until the user explicitly deletes their account through a future account
management feature.

**Rationale**:

- Users expect their historical settings, logs, and goals to be available when they return, even
  after long breaks.
- The initial auth feature is focused on reliable access rather than full data lifecycle
  management; deletion/export flows can be planned as a dedicated feature.

**Alternatives considered**:

- Time-based automatic deletion for inactive accounts: deferred to a later iteration when real
  usage and retention policies are clearer.
- Immediate hard deletion when a user is deactivated in Clerk: rejected for now because it may
  surprise users and complicate recovery or support.

---

## Decision 4 – Availability, performance, and offline behavior (auth scope)

**Decision**: Treat authentication and account access as an online-first experience; users must be
online to sign in, sign out, or recover access. The system will target sign-in completion in under
3 seconds under normal network conditions.

**Rationale**:

- Auth flows depend on Clerk and Convex, both of which are networked services.
- The success criteria in the spec already set user-facing expectations for responsiveness, which
  are achievable with an online-first architecture.

**Alternatives considered**:

- Implementing full offline login with local credential caching: rejected for v1 due to additional
  security and complexity considerations.
- Building a bespoke local cache of user identity separate from Clerk: rejected because Clerk
  already provides session management.
