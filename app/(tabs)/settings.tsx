import { ProfileForm } from '@/components/profile-form';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import {
  calculateBmrKatchMcArdle,
  calculateDailyCalorieTarget,
  calculateDailyProteinTargetGrams,
  calculateEstimatedTdee,
  calculateLeanBodyMassKg,
} from '@/lib/calculations';
import { useMutation, useQuery } from 'convex/react';
import { Link } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SettingsScreen() {
  const profile = useQuery(api.queries.getProfile, {});
  const updateProfile = useMutation(api.mutations.updateProfile);
  const [saving, setSaving] = React.useState(false);

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
        <Text variant="h3">No profile yet</Text>
        <Text variant="muted" className="text-center">
          Create your profile to unlock CalTraq calculations.
        </Text>
        <Link href="/onboarding" asChild>
          <View>
            <Text className="text-primary">Go to onboarding</Text>
          </View>
        </Link>
      </View>
    );
  }

  const lbm = calculateLeanBodyMassKg(profile.weight, profile.bodyFatPercentage);
  const bmr = calculateBmrKatchMcArdle(lbm);
  const tdee = calculateEstimatedTdee(bmr, profile.activityLevel);
  const calorieTarget = calculateDailyCalorieTarget(tdee, profile.goal);
  const proteinTarget = calculateDailyProteinTargetGrams(profile.weight);

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 py-6">
      <View className="px-4">
        <Text variant="h3" className="text-left">
          Settings
        </Text>
        <Text variant="muted">Update profile + targets</Text>
      </View>

      <ProfileForm
        title="Profile"
        submitLabel={saving ? 'Saving…' : 'Save changes'}
        isSubmitting={saving}
        initialValues={{
          age: profile.age,
          sex: profile.sex,
          heightCm: profile.height,
          weightKg: profile.weight,
          bodyFatPercentage: profile.bodyFatPercentage,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
        }}
        onSubmit={async (values) => {
          setSaving(true);
          try {
            await updateProfile({
              age: values.age,
              sex: values.sex,
              height: values.heightCm,
              weight: values.weightKg,
              bodyFatPercentage: values.bodyFatPercentage,
              activityLevel: values.activityLevel,
              goal: values.goal,
            });
          } finally {
            setSaving(false);
          }
        }}
      />

      <View className="mx-4 gap-2 rounded-xl border border-border bg-card p-4">
        <Text className="font-medium">Current targets</Text>
        <Text variant="muted">Lean body mass: {lbm.toFixed(1)} kg</Text>
        <Text variant="muted">BMR: {Math.round(bmr)} kcal/day</Text>
        <Text variant="muted">Estimated TDEE: {Math.round(tdee)} kcal/day</Text>
        <Text variant="muted">Calories: {Math.round(calorieTarget)} kcal/day</Text>
        <Text variant="muted">Protein: {Math.round(proteinTarget)} g/day</Text>
      </View>
    </ScrollView>
  );
}


