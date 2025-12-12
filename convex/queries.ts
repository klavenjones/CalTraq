import { v } from 'convex/values';
import { query } from './_generated/server';
import { requireUserId } from './utils';

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .unique();
  },
});

export const getTodayLog = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query('dailyLogs')
      .withIndex('by_userId_and_date', (q) => q.eq('userId', userId).eq('date', date))
      .unique();
  },
});

export const getDailyLogs = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { startDate, endDate }) => {
    const userId = await requireUserId(ctx);

    const logs = await ctx.db
      .query('dailyLogs')
      .withIndex('by_userId_and_date', (q) =>
        q.eq('userId', userId).gte('date', startDate).lte('date', endDate)
      )
      .collect();

    // Normalize order for charting
    logs.sort((a, b) => a.date.localeCompare(b.date));
    return logs;
  },
});

export const getTrends = query({
  args: { endDate: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { endDate, days }) => {
    const windowDays = Math.max(1, Math.min(365, days ?? 30));
    const startDate = addDaysYyyyMmDd(endDate, -(windowDays - 1));

    const userId = await requireUserId(ctx);
    const logs = await ctx.db
      .query('dailyLogs')
      .withIndex('by_userId_and_date', (q) =>
        q.eq('userId', userId).gte('date', startDate).lte('date', endDate)
      )
      .collect();

    logs.sort((a, b) => a.date.localeCompare(b.date));
    return { startDate, endDate, days: windowDays, logs };
  },
});

function addDaysYyyyMmDd(date: string, deltaDays: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return date;
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}
