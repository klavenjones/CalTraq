/**
 * Clerk authentication helpers for Caltraq
 *
 * This module provides helper functions for working with Clerk authentication
 * in the Expo app, including current user/session handling.
 *
 * Environment Variables Required:
 * - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Clerk publishable key for client-side auth
 *
 * Usage:
 * - Import and use these helpers in components that need auth state
 * - The Clerk session is managed by ClerkProvider in _layout.tsx
 *
 * Security Notes:
 * - Never log sensitive data (passwords, tokens, session IDs)
 * - Error messages should be neutral and not reveal system internals
 * - Telemetry should not include PII
 */

import { useAuth, useUser } from '@clerk/clerk-expo';
import * as React from 'react';

/**
 * Get the current authenticated user's Clerk ID
 * Returns null if no user is signed in
 */
export function useClerkUserId(): string | null {
  const { userId } = useAuth();
  return userId;
}

/**
 * Get the current authenticated user's primary email
 * Returns null if no user is signed in or email is unavailable
 */
export function useClerkUserEmail(): string | null {
  const { user } = useUser();
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

/**
 * Check if the current user is fully authenticated
 * (signed in with a valid session)
 */
export function useIsAuthenticated(): boolean {
  const { isSignedIn, isLoaded } = useAuth();
  return isLoaded && isSignedIn === true;
}

/**
 * Check if authentication state is still loading
 */
export function useIsAuthLoading(): boolean {
  const { isLoaded } = useAuth();
  return !isLoaded;
}

/**
 * Get current user information suitable for creating/updating UserAccount
 */
export function useCurrentUserInfo(): {
  clerkUserId: string | null;
  email: string | null;
  fullName: string | null;
} {
  const { userId } = useAuth();
  const { user } = useUser();

  return {
    clerkUserId: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    fullName: user?.fullName ?? null,
  };
}

/**
 * Telemetry types for auth events (without PII)
 */
export type AuthEventType = 
  | 'sign_in_start'
  | 'sign_in_success'
  | 'sign_in_failure'
  | 'sign_up_start'
  | 'sign_up_success'
  | 'sign_up_failure'
  | 'sign_out'
  | 'recovery_start'
  | 'recovery_success'
  | 'recovery_failure';

export interface AuthTelemetryEvent {
  event: AuthEventType;
  timestamp: number;
  duration?: number; // milliseconds
  platform: 'ios' | 'android' | 'web' | 'unknown';
  success: boolean;
}

/**
 * Log an auth telemetry event
 * Note: This is a lightweight implementation. In production, you might
 * want to send these to an analytics service.
 *
 * Security: Does NOT log any PII (no emails, passwords, or user IDs)
 */
export function logAuthTelemetry(event: AuthTelemetryEvent): void {
  if (__DEV__) {
    // Only log in development - use actual telemetry service in production
    console.log('[Auth Telemetry]', {
      event: event.event,
      duration: event.duration ? `${event.duration}ms` : undefined,
      success: event.success,
    });
  }
}

/**
 * Hook to track auth flow duration for telemetry (SC-002)
 * Returns a function to call when the flow completes
 */
export function useAuthFlowTiming(): {
  startTiming: () => void;
  endTiming: (event: AuthEventType, success: boolean) => number;
} {
  const startTimeRef = React.useRef<number | null>(null);

  const startTiming = React.useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTiming = React.useCallback((event: AuthEventType, success: boolean): number => {
    const duration = startTimeRef.current
      ? Date.now() - startTimeRef.current
      : 0;

    // Determine platform (simplified - would need actual platform detection)
    const platform = typeof window !== 'undefined' && 'navigator' in window
      ? 'web'
      : 'unknown';

    logAuthTelemetry({
      event,
      timestamp: Date.now(),
      duration,
      platform: platform as AuthTelemetryEvent['platform'],
      success,
    });

    startTimeRef.current = null;
    return duration;
  }, []);

  return { startTiming, endTiming };
}

/**
 * Sanitize error messages to avoid leaking sensitive information
 * Use this before displaying or logging errors
 */
export function sanitizeAuthError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  // List of patterns to sanitize
  const sensitivePatterns = [
    // Remove specific email addresses
    /[\w.-]+@[\w.-]+\.\w+/gi,
    // Remove session/token IDs
    /session_[\w]+/gi,
    /sess_[\w]+/gi,
    /tok_[\w]+/gi,
    // Remove user IDs
    /user_[\w]+/gi,
    // Remove any UUIDs
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

