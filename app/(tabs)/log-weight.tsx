import { WeightLogForm } from '@/components/weight-log-form';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import { todayYyyyMmDd } from '@/lib/date';
import { useMutation, useQuery } from 'convex/react';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function LogWeightScreen() {
  const today = todayYyyyMmDd();
  const todayLog = useQuery(api.queries.getTodayLog, { date: today });
  const logWeight = useMutation(api.mutations.logWeight);
  const trends = useQuery(api.queries.getTrends, { endDate: today, days: 30 });

  const [saving, setSaving] = React.useState(false);

  const recentWeights = (trends?.logs ?? [])
    .filter((l) => typeof l.weight === 'number')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7) as Array<{ date: string; weight: number }>;

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 py-6">
      <View className="px-4">
        <Text variant="h3" className="text-left">
          Log weight
        </Text>
        <Text variant="muted">{today}</Text>
      </View>

      <WeightLogForm
        initialWeightKg={todayLog?.weight}
        isSubmitting={saving}
        onSubmit={async ({ weightKg }) => {
          setSaving(true);
          try {
            await logWeight({ date: today, weight: weightKg });
          } finally {
            setSaving(false);
          }
        }}
      />

      <View className="mx-4 gap-2 rounded-xl border border-border bg-card p-4">
        <Text className="font-medium">Recent weigh-ins</Text>
        {recentWeights.length === 0 ? (
          <Text variant="muted">No weigh-ins yet.</Text>
        ) : (
          recentWeights.map((w) => (
            <View key={w.date} className="flex-row justify-between">
              <Text variant="muted">{w.date}</Text>
              <Text>{w.weight.toFixed(1)} kg</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}


