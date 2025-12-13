import { DashboardCard } from '@/components/dashboard-card';
import { OnTrackIndicator, type OnTrackStatus } from '@/components/on-track-indicator';
import { ProgressIndicator } from '@/components/progress-indicator';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import {
  calculateBmrKatchMcArdle,
  calculateDailyCalorieTarget,
  calculateDailyProteinTargetGrams,
  calculateEstimatedTdee,
  calculateLeanBodyMassKg,
  estimateRealWorldTdeeKcal,
} from '@/lib/calculations';
import { todayYyyyMmDd } from '@/lib/date';
import { useQuery } from 'convex/react';
import { Link } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function DashboardScreen() {
  const profile = useQuery(api.queries.getProfile, {});
  const today = todayYyyyMmDd();
  const todayLog = useQuery(api.queries.getTodayLog, { date: today });

  const trends14 = useQuery(api.queries.getTrends, { endDate: today, days: 14 });

  if (profile === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Loading…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text variant="h3">Set up your profile</Text>
        <Text variant="muted" className="text-center">
          We need a few details to calculate your targets.
        </Text>
        <Link href="/onboarding" asChild>
          <Button>
            <Text>Start onboarding</Text>
          </Button>
        </Link>
      </View>
    );
  }

  const lbm = calculateLeanBodyMassKg(profile.weight, profile.bodyFatPercentage);
  const bmr = calculateBmrKatchMcArdle(lbm);
  const estimatedTdee = calculateEstimatedTdee(bmr, profile.activityLevel);
  const calorieTarget = calculateDailyCalorieTarget(estimatedTdee, profile.goal);
  const proteinTarget = calculateDailyProteinTargetGrams(profile.weight);

  const caloriesToday = todayLog?.calories ?? 0;
  const proteinToday = todayLog?.protein ?? 0;

  const realWorldTdee =
    trends14?.logs && trends14.logs.length > 0
      ? estimateRealWorldTdeeKcal(trends14.logs)
      : undefined;

  const { status, detail } = computeOnTrack({
    goal: profile.goal,
    targetCalories: calorieTarget,
    logs: trends14?.logs ?? [],
  });

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 py-6">
      <View className="px-4">
        <Text variant="h3" className="text-left">
          Today
        </Text>
        <Text variant="muted">{today}</Text>
      </View>

      <DashboardCard
        title="Progress"
        subtitle="Track calories and protein against your targets">
        <ProgressIndicator label="Calories" current={caloriesToday} target={calorieTarget} />
        <ProgressIndicator label="Protein" current={proteinToday} target={proteinTarget} unit="g" />
        <OnTrackIndicator status={status} detail={detail} />
        <View className="flex-row gap-2 pt-1">
          <Link href="/(tabs)/log-food" asChild>
            <Button className="flex-1">
              <Text>Log food</Text>
            </Button>
          </Link>
          <Link href="/(tabs)/log-weight" asChild>
            <Button variant="outline" className="flex-1">
              <Text>Log weight</Text>
            </Button>
          </Link>
        </View>
      </DashboardCard>

      <DashboardCard
        title="Metabolism"
        value={`${Math.round(calorieTarget)} kcal`}
        subtitle={`${profile.goal.toUpperCase()} target`}>
        <View className="gap-1">
          <Text variant="muted">Lean body mass: {lbm.toFixed(1)} kg</Text>
          <Text variant="muted">BMR (Katch–McArdle): {Math.round(bmr)} kcal/day</Text>
          <Text variant="muted">Estimated TDEE: {Math.round(estimatedTdee)} kcal/day</Text>
          <Text variant="muted">
            Real-world TDEE:{' '}
            {realWorldTdee ? `${Math.round(realWorldTdee)} kcal/day` : 'Not enough data yet'}
          </Text>
        </View>
      </DashboardCard>
    </ScrollView>
  );
}

function computeOnTrack(args: {
  goal: 'lose' | 'maintain' | 'gain';
  targetCalories: number;
  logs: Array<{ date: string; calories?: number; weight?: number }>;
}): { status: OnTrackStatus; detail: string } {
  const logs = args.logs.sort((a, b) => a.date.localeCompare(b.date));
  const calorieDays = logs.filter((l) => typeof l.calories === 'number') as Array<
    (typeof logs)[number] & { calories: number }
  >;
  const weightDays = logs.filter((l) => typeof l.weight === 'number') as Array<
    (typeof logs)[number] & { weight: number }
  >;

  if (calorieDays.length < 5 || weightDays.length < 2) {
    return { status: 'unknown', detail: 'Log at least a week of calories + a few weigh-ins.' };
  }

  const avgCalories = calorieDays.reduce((s, l) => s + l.calories, 0) / calorieDays.length;
  const calDelta = avgCalories - args.targetCalories;
  const caloriesOk = Math.abs(calDelta) <= 200;

  const startW = weightDays[0].weight;
  const endW = weightDays[weightDays.length - 1].weight;
  const weightDelta = endW - startW;

  let weightOk = false;
  if (args.goal === 'lose') weightOk = weightDelta < -0.1;
  if (args.goal === 'gain') weightOk = weightDelta > 0.1;
  if (args.goal === 'maintain') weightOk = Math.abs(weightDelta) <= 0.2;

  if (caloriesOk && weightOk) {
    return {
      status: 'on_track',
      detail: `Avg intake ~${Math.round(avgCalories)} kcal; weight change ${weightDelta.toFixed(1)} kg.`,
    };
  }

  if (Math.abs(calDelta) <= 350 || weightOk) {
    return {
      status: 'close',
      detail: `Avg intake ~${Math.round(avgCalories)} kcal; weight change ${weightDelta.toFixed(1)} kg.`,
    };
  }

  return {
    status: 'off_track',
    detail: `Avg intake ~${Math.round(avgCalories)} kcal; weight change ${weightDelta.toFixed(1)} kg.`,
  };
}


