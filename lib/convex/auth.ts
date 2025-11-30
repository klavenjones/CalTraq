/**
 * Convex authentication helpers for Caltraq
 *
 * This module provides helper functions for auth-related Convex operations,
 * including UserAccount creation, retrieval, and session tracking.
 *
 * Environment Variables Required:
 * - EXPO_PUBLIC_CONVEX_URL: The Convex deployment URL
 *
 * Note: This file will be expanded with actual Convex hooks once the
 * Convex client is configured and _generated types are available.
 */

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

/**
 * Type for UserAccount status
 */
export type UserAccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';

/**
 * Type for RecoveryRequest status
 */
export type RecoveryRequestStatus = 'pending' | 'completed' | 'failed' | 'expired';

/**
 * Hook to get or create a UserAccount for the current authenticated user
 */
export function useUserAccount() {
  return useQuery(api.users.getCurrentUserAccount);
}

/**
 * Hook to create or update a UserAccount after successful sign-up/sign-in
 */
export function useUpsertUserAccount() {
  return useMutation(api.users.upsertUserAccount);
}

/**
 * Hook to record a successful sign-in
 */
export function useRecordSignIn() {
  return useMutation(api.users.recordSignIn);
}

/**
 * Hook to record a recovery request attempt
 */
export function useRecordRecoveryRequest() {
  return useMutation(api.users.recordRecoveryRequest);
}

/**
 * Hook to resolve a recovery request
 */
export function useResolveRecoveryRequest() {
  return useMutation(api.users.resolveRecoveryRequest);
}
