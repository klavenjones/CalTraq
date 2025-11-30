import { v } from 'convex/values';
import { mutation, query, QueryCtx, MutationCtx } from './_generated/server';

/**
 * Convex auth functions for Caltraq user account and session tracking
 *
 * These functions integrate with Clerk authentication to manage
 * UserAccount records in the Convex database.
 */

/**
 * Helper to get the current user's identity from Clerk
 */
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return {
    clerkUserId: identity.subject,
    email: identity.email ?? null,
    name: identity.name ?? null,
  };
}

/**
 * Get the current user's UserAccount record
 * Returns null if no user is signed in or no account exists
 */
export const getCurrentUserAccount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const account = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', user.clerkUserId))
      .unique();

    return account;
  },
});

/**
 * Get a UserAccount by Clerk user ID
 */
export const getUserAccountByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', clerkUserId))
      .unique();
  },
});

/**
 * Create or update a UserAccount for the authenticated user
 * Called after successful Clerk sign-up or sign-in
 */
export const upsertUserAccount = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if account already exists
    const existingAccount = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', user.clerkUserId))
      .unique();

    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        email,
        lastSignInAt: Date.now(),
        // Ensure account is active if it was pending
        status: existingAccount.status === 'pending' ? 'active' : existingAccount.status,
      });
      return existingAccount._id;
    }

    // Create new account
    const accountId = await ctx.db.insert('userAccounts', {
      clerkUserId: user.clerkUserId,
      email,
      createdAt: Date.now(),
      status: 'active',
      lastSignInAt: Date.now(),
    });

    return accountId;
  },
});

/**
 * Record a successful sign-in for the authenticated user
 * Updates lastSignInAt timestamp
 */
export const recordSignIn = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const account = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', user.clerkUserId))
      .unique();

    if (!account) {
      // Account doesn't exist yet - this is normal during first sign-in
      // The account will be created by upsertUserAccount
      return null;
    }

    await ctx.db.patch(account._id, {
      lastSignInAt: Date.now(),
    });

    return account._id;
  },
});

/**
 * Record a recovery request attempt
 * Used for analytics and abuse detection
 */
export const recordRecoveryRequest = mutation({
  args: {
    identifierUsed: v.string(),
  },
  handler: async (ctx, { identifierUsed }) => {
    // Look up if there's an existing account for this identifier
    // Note: We don't reveal whether the account exists in the response
    const existingAccount = await ctx.db
      .query('userAccounts')
      .withIndex('by_email', (q) => q.eq('email', identifierUsed))
      .unique();

    const requestId = await ctx.db.insert('recoveryRequests', {
      userAccountId: existingAccount?._id,
      identifierUsed,
      createdAt: Date.now(),
      status: 'pending',
    });

    return requestId;
  },
});

/**
 * Resolve a recovery request
 * Called when recovery completes (success or failure)
 */
export const resolveRecoveryRequest = mutation({
  args: {
    requestId: v.id('recoveryRequests'),
    status: v.union(
      v.literal('completed'),
      v.literal('failed'),
      v.literal('expired')
    ),
  },
  handler: async (ctx, { requestId, status }) => {
    await ctx.db.patch(requestId, {
      status,
      resolvedAt: Date.now(),
    });
  },
});

/**
 * Create a UserAccount with pending status during sign-up flow
 * Called before email verification is complete
 */
export const createPendingUserAccount = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkUserId, email }) => {
    // Check if account already exists
    const existingAccount = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', clerkUserId))
      .unique();

    if (existingAccount) {
      // Return existing account ID (idempotent)
      return existingAccount._id;
    }

    // Create new pending account
    const accountId = await ctx.db.insert('userAccounts', {
      clerkUserId,
      email,
      createdAt: Date.now(),
      status: 'pending',
    });

    return accountId;
  },
});

/**
 * Activate a pending UserAccount after email verification
 */
export const activateUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error('Not authenticated');
    }

    const account = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', user.clerkUserId))
      .unique();

    if (!account) {
      throw new Error('User account not found');
    }

    if (account.status === 'pending') {
      await ctx.db.patch(account._id, {
        status: 'active',
        lastSignInAt: Date.now(),
      });
    }

    return account._id;
  },
});

/**
 * Clean up orphaned pending accounts
 * Called to handle abandoned sign-up flows
 */
export const cleanupAbandonedAccount = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const account = await ctx.db
      .query('userAccounts')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', clerkUserId))
      .unique();

    if (account && account.status === 'pending') {
      // Delete pending account that was abandoned
      await ctx.db.delete(account._id);
      return true;
    }

    return false;
  },
});

