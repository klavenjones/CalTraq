import { CaloriesChart } from '@/components/calories-chart';
import { ProteinChart } from '@/components/protein-chart';
import { WeightChart } from '@/components/weight-chart';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import {
  calculateBmrKatchMcArdle,
  calculateDailyCalorieTarget,
  calculateDailyProteinTargetGrams,
  calculateEstimatedTdee,
  calculateLeanBodyMassKg,
} from '@/lib/calculations';
import { todayYyyyMmDd } from '@/lib/date';
import { useQuery } from 'convex/react';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function HistoryScreen() {
  const today = todayYyyyMmDd();
  const profile = useQuery(api.queries.getProfile, {});
  const trends = useQuery(api.queries.getTrends, { endDate: today, days: 30 });

  const targets =
    profile
      ? (() => {
          const lbm = calculateLeanBodyMassKg(profile.weight, profile.bodyFatPercentage);
          const bmr = calculateBmrKatchMcArdle(lbm);
          const tdee = calculateEstimatedTdee(bmr, profile.activityLevel);
          return {
            calorieTarget: calculateDailyCalorieTarget(tdee, profile.goal),
            proteinTarget: calculateDailyProteinTargetGrams(profile.weight),
          };
        })()
      : null;

  const logs = (trends?.logs ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 py-6">
      <View className="px-4">
        <Text variant="h3" className="text-left">
          History
        </Text>
        <Text variant="muted">Last 30 days</Text>
      </View>

      <View className="px-4">
        <WeightChart logs={trends?.logs ?? []} />
      </View>

      <View className="px-4">
        <CaloriesChart logs={trends?.logs ?? []} targetCalories={targets?.calorieTarget} />
      </View>

      <View className="px-4">
        <ProteinChart logs={trends?.logs ?? []} targetProtein={targets?.proteinTarget} />
      </View>

      <View className="px-4 gap-3">
        <Text className="text-sm font-medium">Recent logs</Text>
        {logs.length === 0 ? (
          <Text variant="muted">No logs yet.</Text>
        ) : (
          logs.slice(0, 14).map((l) => (
            <View
              key={l._id}
              className="gap-1 rounded-xl border border-border bg-card p-4">
              <View className="flex-row justify-between">
                <Text className="font-medium">{l.date}</Text>
                <Text variant="muted">
                  {typeof l.weight === 'number' ? `${l.weight.toFixed(1)} kg` : ''}
                </Text>
              </View>
              <Text variant="muted">
                {typeof l.calories === 'number' ? `${Math.round(l.calories)} kcal` : '—'} •{' '}
                {typeof l.protein === 'number' ? `${Math.round(l.protein)} g protein` : '—'}
              </Text>
              {l.notes ? <Text className="text-sm">{l.notes}</Text> : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}


