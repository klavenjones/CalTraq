import { v } from 'convex/values';
import { mutation } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { requireUserId } from './utils';

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const userId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();

    const email =
      (identity.email as string | undefined) ??
      (identity.emailAddress as string | undefined) ??
      (identity.tokenIdentifier as string | undefined);

    const name =
      (identity.name as string | undefined) ??
      (identity.givenName && identity.familyName
        ? `${identity.givenName} ${identity.familyName}`
        : undefined) ??
      (identity.nickname as string | undefined);

    const pictureUrl =
      (identity.pictureUrl as string | undefined) ??
      (identity.picture as string | undefined) ??
      (identity.imageUrl as string | undefined);

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: email ?? existing.email,
        name: name ?? existing.name,
        pictureUrl: pictureUrl ?? existing.pictureUrl,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('users', {
      userId,
      email,
      name,
      pictureUrl,
      unitSystem: 'metric',
      createdAt: now,
      lastSeenAt: now,
    });
  },
});

export const setUnitSystem = mutation({
  args: { unitSystem: v.union(v.literal('metric'), v.literal('imperial')) },
  handler: async (ctx, { unitSystem }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const userId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();

    const email =
      (identity.email as string | undefined) ??
      (identity.emailAddress as string | undefined) ??
      (identity.tokenIdentifier as string | undefined);

    const name =
      (identity.name as string | undefined) ??
      (identity.givenName && identity.familyName
        ? `${identity.givenName} ${identity.familyName}`
        : undefined) ??
      (identity.nickname as string | undefined);

    const pictureUrl =
      (identity.pictureUrl as string | undefined) ??
      (identity.picture as string | undefined) ??
      (identity.imageUrl as string | undefined);

    if (existing) {
      await ctx.db.patch(existing._id, {
        unitSystem,
        email: email ?? existing.email,
        name: name ?? existing.name,
        pictureUrl: pictureUrl ?? existing.pictureUrl,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('users', {
      userId,
      email,
      name,
      pictureUrl,
      unitSystem,
      createdAt: now,
      lastSeenAt: now,
    });
  },
});

export const createProfile = mutation({
  args: {
    age: v.number(),
    sex: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
    height: v.number(), // cm
    weight: v.number(), // kg
    bodyFatPercentage: v.number(), // 0-100
    activityLevel: v.union(
      v.literal('not_very_active'),
      v.literal('lightly_active'),
      v.literal('active'),
      v.literal('very_active')
    ),
    goal: v.union(v.literal('lose'), v.literal('maintain'), v.literal('gain')),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert('profiles', {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    age: v.optional(v.number()),
    sex: v.optional(v.union(v.literal('male'), v.literal('female'), v.literal('other'))),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    bodyFatPercentage: v.optional(v.number()),
    activityLevel: v.optional(
      v.union(
        v.literal('not_very_active'),
        v.literal('lightly_active'),
        v.literal('active'),
        v.literal('very_active')
      )
    ),
    goal: v.optional(v.union(v.literal('lose'), v.literal('maintain'), v.literal('gain'))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();
    if (!existing) throw new Error('Profile not found');

    const patch: Record<string, unknown> = { updatedAt: now };
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(existing._id, patch);
    return existing._id;
  },
});

export const logFood = mutation({
  args: { date: v.string(), calories: v.number(), protein: v.number() },
  handler: async (ctx, { date, calories, protein }) => {
    const userId = await requireUserId(ctx);
    return await upsertDailyLog(ctx, userId, date, { calories, protein });
  },
});

export const logWeight = mutation({
  args: { date: v.string(), weight: v.number() },
  handler: async (ctx, { date, weight }) => {
    const userId = await requireUserId(ctx);
    return await upsertDailyLog(ctx, userId, date, { weight });
  },
});

export const logNote = mutation({
  args: { date: v.string(), notes: v.string() },
  handler: async (ctx, { date, notes }) => {
    const userId = await requireUserId(ctx);
    return await upsertDailyLog(ctx, userId, date, { notes });
  },
});

async function upsertDailyLog(
  ctx: MutationCtx,
  userId: string,
  date: string,
  patch: { calories?: number; protein?: number; weight?: number; notes?: string }
) {
  const now = Date.now();
  const existing = await ctx.db
    .query('dailyLogs')
    .withIndex('by_userId_and_date', (q) => q.eq('userId', userId).eq('date', date))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return existing._id;
  }

  return await ctx.db.insert('dailyLogs', {
    userId,
    date,
    ...patch,
    createdAt: now,
  });
}
