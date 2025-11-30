# API Contracts: Get Started Screen

**Feature Branch**: `002-get-started-screen`  
**Date**: 2025-01-27

## Overview

This feature does not require any API contracts as it is a presentation and navigation layer component with no backend interactions. All functionality is handled client-side through:

- Expo Router for navigation
- Clerk authentication hooks for auth state checking
- React Native components for UI rendering

## Navigation Routes

The feature uses the following Expo Router routes (no API endpoints):

- **Get Started Screen**: `/(auth)/get-started` (to be implemented)
- **Sign Up Screen**: `/(auth)/sign-up` (existing)
- **Sign In Screen**: `/(auth)/sign-in` (existing)

## Authentication State

The screen consumes authentication state from Clerk via hooks (no API calls):

- `useAuth()` from `@clerk/clerk-expo` - provides `isLoaded` and `isSignedIn`
- `useConvexAuth()` from `convex/react` - provides `isAuthenticated`

No API contracts are required for this feature.

