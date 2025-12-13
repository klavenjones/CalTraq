import { FoodLogForm } from '@/components/food-log-form';
import { NoteInput } from '@/components/note-input';
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
import { useMutation, useQuery } from 'convex/react';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function LogFoodScreen() {
  const today = todayYyyyMmDd();
  const profile = useQuery(api.queries.getProfile, {});
  const todayLog = useQuery(api.queries.getTodayLog, { date: today });
  const logFood = useMutation(api.mutations.logFood);
  const logNote = useMutation(api.mutations.logNote);

  const [savingFood, setSavingFood] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);

  const targets =
    profile
      ? (() => {
          const lbm = calculateLeanBodyMassKg(profile.weight, profile.bodyFatPercentage);
          const bmr = calculateBmrKatchMcArdle(lbm);
          const tdee = calculateEstimatedTdee(bmr, profile.activityLevel);
          const calorieTarget = calculateDailyCalorieTarget(tdee, profile.goal);
          const proteinTarget = calculateDailyProteinTargetGrams(profile.weight);
          return { calorieTarget, proteinTarget };
        })()
      : null;

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 py-6">
      <View className="px-4">
        <Text variant="h3" className="text-left">
          Log food
        </Text>
        <Text variant="muted">{today}</Text>
      </View>

      <FoodLogForm
        initialCalories={todayLog?.calories}
        initialProtein={todayLog?.protein}
        calorieTarget={targets?.calorieTarget}
        proteinTarget={targets?.proteinTarget}
        isSubmitting={savingFood}
        onSubmit={async ({ calories, protein }) => {
          setSavingFood(true);
          try {
            await logFood({ date: today, calories, protein });
          } finally {
            setSavingFood(false);
          }
        }}
      />

      <NoteInput
        initialNotes={todayLog?.notes ?? ''}
        isSubmitting={savingNote}
        onSubmit={async (notes) => {
          setSavingNote(true);
          try {
            await logNote({ date: today, notes });
          } finally {
            setSavingNote(false);
          }
        }}
      />
    </ScrollView>
  );
}


