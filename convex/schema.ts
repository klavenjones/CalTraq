import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  }).index('by_userId', ['userId']),

  profiles: defineTable({
    userId: v.string(),
    age: v.number(),
    sex: v.union(v.literal('male'), v.literal('female'), v.literal('other')),
    height: v.number(), // in cm
    weight: v.number(), // in kg
    bodyFatPercentage: v.number(), // 0-100
    activityLevel: v.union(
      v.literal('not_very_active'),
      v.literal('lightly_active'),
      v.literal('active'),
      v.literal('very_active')
    ),
    goal: v.union(v.literal('lose'), v.literal('maintain'), v.literal('gain')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_userId', ['userId']),

  dailyLogs: defineTable({
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD format
    calories: v.optional(v.number()),
    protein: v.optional(v.number()), // in grams
    weight: v.optional(v.number()), // in kg
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_date', ['userId', 'date']),
});
