import { v } from 'convex/values';
import { mutation, query, QueryCtx, MutationCtx } from './_generated/server';

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
  };
}

/**
 * Helper to get the current user's UserAccount
 */
async function getCurrentUserAccount(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    return null;
  }

  const account = await ctx.db
    .query('userAccounts')
    .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', user.clerkUserId))
    .unique();

  return account;
}

/**
 * Save onboarding progress incrementally
 * Called after each screen completion
 */
export const saveOnboardingProgress = mutation({
  args: {
    units: v.union(v.literal('imperial'), v.literal('metric')),
    currentStep: v.number(),
    basicStats: v.optional(
      v.object({
        height: v.number(),
        weight: v.number(),
        gender: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
        age: v.number(),
        bodyFatPercentage: v.optional(v.number()),
      })
    ),
    bodyComposition: v.optional(
      v.object({
        neckCircumference: v.number(),
        waistCircumference: v.number(),
        hipCircumference: v.optional(v.number()),
      })
    ),
    bodyCompositionMethod: v.optional(v.union(v.literal('manual'), v.literal('calculated'))),
    calculatedBodyFatPercentage: v.optional(v.number()),
    calculatedLeanBodyMass: v.optional(v.number()),
    activityLevel: v.optional(
      v.union(
        v.literal('sedentary'),
        v.literal('lightly_active'),
        v.literal('moderately_active'),
        v.literal('very_active'),
        v.literal('extremely_active')
      )
    ),
    goal: v.optional(
      v.object({
        goalPhase: v.union(
          v.literal('slow'),
          v.literal('moderate'),
          v.literal('aggressive'),
          v.literal('maintenance')
        ),
        goalType: v.union(v.literal('weekly_change'), v.literal('target_weight')),
        goalValue: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const account = await getCurrentUserAccount(ctx);
    if (!account) {
      throw new Error('Not authenticated');
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query('onboardingProfiles')
      .withIndex('by_user_account', (q) => q.eq('userAccountId', account._id))
      .unique();

    const now = Date.now();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        units: args.units,
        currentStep: args.currentStep,
        updatedAt: now,
        ...(args.basicStats && {
          height: args.basicStats.height,
          weight: args.basicStats.weight,
          gender: args.basicStats.gender,
          age: args.basicStats.age,
          bodyFatPercentage: args.basicStats.bodyFatPercentage,
        }),
        ...(args.bodyComposition && {
          neckCircumference: args.bodyComposition.neckCircumference,
          waistCircumference: args.bodyComposition.waistCircumference,
          hipCircumference: args.bodyComposition.hipCircumference,
        }),
        ...(args.bodyCompositionMethod && {
          bodyCompositionMethod: args.bodyCompositionMethod,
        }),
        ...(args.calculatedBodyFatPercentage !== undefined && {
          bodyFatPercentage: args.calculatedBodyFatPercentage,
        }),
        ...(args.calculatedLeanBodyMass !== undefined && {
          leanBodyMass: args.calculatedLeanBodyMass,
        }),
        ...(args.activityLevel && {
          activityLevel: args.activityLevel,
        }),
        ...(args.goal && {
          goalPhase: args.goal.goalPhase,
          goalType: args.goal.goalType,
          goalValue: args.goal.goalValue,
        }),
      });

      return existingProfile._id;
    }

    // Create new profile (incomplete)
    const profileId = await ctx.db.insert('onboardingProfiles', {
      userAccountId: account._id,
      units: args.units,
      height: args.basicStats?.height ?? 0,
      weight: args.basicStats?.weight ?? 0,
      gender: args.basicStats?.gender ?? 'other',
      age: args.basicStats?.age ?? 0,
      bodyFatPercentage: args.basicStats?.bodyFatPercentage ?? args.calculatedBodyFatPercentage,
      leanBodyMass: args.calculatedLeanBodyMass,
      bodyCompositionMethod: args.bodyCompositionMethod,
      neckCircumference: args.bodyComposition?.neckCircumference,
      waistCircumference: args.bodyComposition?.waistCircumference,
      hipCircumference: args.bodyComposition?.hipCircumference,
      activityLevel: args.activityLevel ?? 'sedentary',
      goalPhase: args.goal?.goalPhase ?? 'maintenance',
      goalType: args.goal?.goalType ?? 'target_weight',
      goalValue: args.goal?.goalValue ?? 0,
      calculatedCalorieTarget: 0,
      calculatedProteinTarget: 0,
      startDate: now,
      currentStep: args.currentStep,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

/**
 * Get onboarding progress for the current user
 */
export const getOnboardingProgress = query({
  args: {},
  handler: async (ctx) => {
    const account = await getCurrentUserAccount(ctx);
    if (!account) {
      return null;
    }

    const profile = await ctx.db
      .query('onboardingProfiles')
      .withIndex('by_user_account', (q) => q.eq('userAccountId', account._id))
      .unique();

    return profile;
  },
});

/**
 * Complete onboarding and save final profile
 */
export const completeOnboarding = mutation({
  args: {
    units: v.union(v.literal('imperial'), v.literal('metric')),
    basicStats: v.object({
      height: v.number(),
      weight: v.number(),
      gender: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
      age: v.number(),
      bodyFatPercentage: v.optional(v.number()),
    }),
    bodyComposition: v.optional(
      v.object({
        neckCircumference: v.number(),
        waistCircumference: v.number(),
        hipCircumference: v.optional(v.number()),
      })
    ),
    bodyCompositionMethod: v.optional(v.union(v.literal('manual'), v.literal('calculated'))),
    calculatedBodyFatPercentage: v.optional(v.number()),
    calculatedLeanBodyMass: v.number(),
    activityLevel: v.union(
      v.literal('sedentary'),
      v.literal('lightly_active'),
      v.literal('moderately_active'),
      v.literal('very_active'),
      v.literal('extremely_active')
    ),
    goal: v.object({
      goalPhase: v.union(
        v.literal('slow'),
        v.literal('moderate'),
        v.literal('aggressive'),
        v.literal('maintenance')
      ),
      goalType: v.union(v.literal('weekly_change'), v.literal('target_weight')),
      goalValue: v.number(),
    }),
    calculatedCalorieTarget: v.number(),
    calculatedProteinTarget: v.number(),
    expectedTimelineWeeks: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const account = await getCurrentUserAccount(ctx);
    if (!account) {
      throw new Error('Not authenticated');
    }

    const now = Date.now();

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query('onboardingProfiles')
      .withIndex('by_user_account', (q) => q.eq('userAccountId', account._id))
      .unique();

    if (existingProfile) {
      // Update and mark as completed
      await ctx.db.patch(existingProfile._id, {
        units: args.units,
        height: args.basicStats.height,
        weight: args.basicStats.weight,
        gender: args.basicStats.gender,
        age: args.basicStats.age,
        bodyFatPercentage: args.basicStats.bodyFatPercentage ?? args.calculatedBodyFatPercentage,
        leanBodyMass: args.calculatedLeanBodyMass,
        bodyCompositionMethod: args.bodyCompositionMethod,
        neckCircumference: args.bodyComposition?.neckCircumference,
        waistCircumference: args.bodyComposition?.waistCircumference,
        hipCircumference: args.bodyComposition?.hipCircumference,
        activityLevel: args.activityLevel,
        goalPhase: args.goal.goalPhase,
        goalType: args.goal.goalType,
        goalValue: args.goal.goalValue,
        calculatedCalorieTarget: args.calculatedCalorieTarget,
        calculatedProteinTarget: args.calculatedProteinTarget,
        expectedTimelineWeeks: args.expectedTimelineWeeks,
        currentStep: 6,
        completedAt: now,
        updatedAt: now,
      });
    } else {
      // Create new completed profile
      await ctx.db.insert('onboardingProfiles', {
        userAccountId: account._id,
        units: args.units,
        height: args.basicStats.height,
        weight: args.basicStats.weight,
        gender: args.basicStats.gender,
        age: args.basicStats.age,
        bodyFatPercentage: args.basicStats.bodyFatPercentage ?? args.calculatedBodyFatPercentage,
        leanBodyMass: args.calculatedLeanBodyMass,
        bodyCompositionMethod: args.bodyCompositionMethod,
        neckCircumference: args.bodyComposition?.neckCircumference,
        waistCircumference: args.bodyComposition?.waistCircumference,
        hipCircumference: args.bodyComposition?.hipCircumference,
        activityLevel: args.activityLevel,
        goalPhase: args.goal.goalPhase,
        goalType: args.goal.goalType,
        goalValue: args.goal.goalValue,
        calculatedCalorieTarget: args.calculatedCalorieTarget,
        calculatedProteinTarget: args.calculatedProteinTarget,
        expectedTimelineWeeks: args.expectedTimelineWeeks,
        startDate: now,
        currentStep: 6,
        createdAt: now,
        updatedAt: now,
        completedAt: now,
      });
    }

    // Update UserAccount to mark onboarding as completed
    await ctx.db.patch(account._id, {
      onboardingCompleted: true,
    });

    return account._id;
  },
});

/**
 * Check onboarding status for the current user
 */
export const checkOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const account = await getCurrentUserAccount(ctx);
    if (!account) {
      return { completed: false, hasProfile: false };
    }

    const profile = await ctx.db
      .query('onboardingProfiles')
      .withIndex('by_user_account', (q) => q.eq('userAccountId', account._id))
      .unique();

    return {
      completed: account.onboardingCompleted === true,
      hasProfile: profile !== null,
      currentStep: profile?.currentStep,
    };
  },
});

