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
    /** Boolean flag indicating whether onboarding has been completed (false if incomplete, true if completed) */
    onboardingCompleted: v.optional(v.boolean()),
  })
    .index('by_clerk_user_id', ['clerkUserId'])
    .index('by_email', ['email'])
    .index('by_status', ['status'])
    .index('by_onboarding_completed', ['onboardingCompleted']),

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

  /**
   * OnboardingProfile - Stores all onboarding data collected during the flow
   */
  onboardingProfiles: defineTable({
    /** Reference to UserAccount */
    userAccountId: v.id('userAccounts'),
    /** Unit preference */
    units: v.union(v.literal('imperial'), v.literal('metric')),
    /** Height in centimeters (stored in metric, converted for display) */
    height: v.number(),
    /** Weight in kilograms (stored in metric, converted for display) */
    weight: v.number(),
    /** Gender */
    gender: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
    /** Age in years */
    age: v.number(),
    /** Body fat percentage (0-50) */
    bodyFatPercentage: v.optional(v.number()),
    /** Lean body mass in kilograms (calculated) */
    leanBodyMass: v.optional(v.number()),
    /** How body fat was obtained */
    bodyCompositionMethod: v.optional(v.union(v.literal('manual'), v.literal('calculated'))),
    /** Neck circumference in centimeters */
    neckCircumference: v.optional(v.number()),
    /** Waist circumference in centimeters */
    waistCircumference: v.optional(v.number()),
    /** Hip circumference in centimeters (for females) */
    hipCircumference: v.optional(v.number()),
    /** Activity level */
    activityLevel: v.union(
      v.literal('sedentary'),
      v.literal('lightly_active'),
      v.literal('moderately_active'),
      v.literal('very_active'),
      v.literal('extremely_active')
    ),
    /** Goal phase */
    goalPhase: v.union(
      v.literal('slow'),
      v.literal('moderate'),
      v.literal('aggressive'),
      v.literal('maintenance')
    ),
    /** Goal type */
    goalType: v.union(v.literal('weekly_change'), v.literal('target_weight')),
    /** Goal value (weekly change in kg/week, or target weight in kg) */
    goalValue: v.number(),
    /** Calculated daily calorie target */
    calculatedCalorieTarget: v.number(),
    /** Calculated daily protein target in grams */
    calculatedProteinTarget: v.number(),
    /** Expected weeks to reach goal */
    expectedTimelineWeeks: v.optional(v.number()),
    /** Timestamp when plan starts */
    startDate: v.number(),
    /** Last completed step index (0-6) for resume capability */
    currentStep: v.optional(v.number()),
    /** Timestamp when profile was first created */
    createdAt: v.number(),
    /** Timestamp of most recent update */
    updatedAt: v.number(),
    /** Timestamp when onboarding was completed */
    completedAt: v.optional(v.number()),
  })
    .index('by_user_account', ['userAccountId'])
    .index('by_completion_status', ['completedAt']),
});

