# Data Model: Get Started Screen

**Feature Branch**: `002-get-started-screen`  
**Date**: 2025-01-27

## Overview

This feature is a presentation and navigation layer component with **no data persistence requirements**. The get started screen does not create, read, update, or delete any data entities. It serves purely as a UI entry point that routes users to authentication flows.

## Entities

**None**. This feature does not involve any data entities or persistence.

## Navigation State

The screen relies on authentication state from Clerk (via `useAuth()` and `useConvexAuth()` hooks) to determine visibility, but does not store or manage any application data.

## Related Entities (Referenced, Not Modified)

- **UserAccount** (from `001-user-auth`): The screen checks authentication status to determine if a user account exists, but does not interact with UserAccount data directly.

