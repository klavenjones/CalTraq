import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Convex schema for Caltraq user accounts and authentication
 *
 * Entities:
 * - UserAccount: Represents an individual Caltraq user linked to a Clerk identity
 * - RecoveryRequest: Tracks account recovery attempts for analytics and abuse detection
 */
export default defineSchema({
  /**
   * UserAccount - Represents an individual Caltraq user who can sign in
   * and access account-only features. Keyed by Clerk user ID.
   */
  userAccounts: defineTable({
    /** External unique identifier from Clerk */
    clerkUserId: v.string(),
    /** Primary email address associated with the account */
    email: v.string(),
    /** Timestamp when the UserAccount record was first created */
    createdAt: v.number(),
    /** High-level account status */
    status: v.union(
      v.literal('pending'),
      v.literal('active'),
      v.literal('suspended'),
      v.literal('deleted')
    ),
    /** Timestamp of the most recent successful sign-in */
    lastSignInAt: v.optional(v.number()),
  })
    .index('by_clerk_user_id', ['clerkUserId'])
    .index('by_email', ['email'])
    .index('by_status', ['status']),

  /**
   * RecoveryRequest - Tracks initiated attempts to regain access to a user account
   * for analytics and abuse detection.
   */
  recoveryRequests: defineTable({
    /** Reference to the associated UserAccount, if known */
    userAccountId: v.optional(v.id('userAccounts')),
    /** The identifier supplied to initiate recovery (e.g., email) */
    identifierUsed: v.string(),
    /** Timestamp when the recovery request was initiated */
    createdAt: v.number(),
    /** Timestamp when the recovery process completed successfully */
    resolvedAt: v.optional(v.number()),
    /** Current status of the recovery request */
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('expired')
    ),
  })
    .index('by_identifier', ['identifierUsed'])
    .index('by_status', ['status'])
    .index('by_user_account', ['userAccountId']),
});

