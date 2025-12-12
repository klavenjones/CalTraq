import { ActivityLevelSelector } from '@/components/activity-level-selector';
import { GoalSelector } from '@/components/goal-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import type { ActivityLevel, Goal, Sex } from '@/lib/types';
import * as React from 'react';
import { View } from 'react-native';

export type ProfileFormValues = {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  bodyFatPercentage: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export function ProfileForm({
  title = 'Your profile',
  submitLabel,
  initialValues,
  onSubmit,
  isSubmitting,
}: {
  title?: string;
  submitLabel: string;
  initialValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}) {
  const [age, setAge] = React.useState(String(initialValues?.age ?? ''));
  const [heightCm, setHeightCm] = React.useState(String(initialValues?.heightCm ?? ''));
  const [weightKg, setWeightKg] = React.useState(String(initialValues?.weightKg ?? ''));
  const [bodyFat, setBodyFat] = React.useState(String(initialValues?.bodyFatPercentage ?? ''));
  const [sex, setSex] = React.useState<Sex>(initialValues?.sex ?? 'male');
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>(
    initialValues?.activityLevel ?? 'lightly_active'
  );
  const [goal, setGoal] = React.useState<Goal>(initialValues?.goal ?? 'maintain');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const parsed = parseValues({ age, heightCm, weightKg, bodyFat });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    await onSubmit({
      age: parsed.values.age,
      sex,
      heightCm: parsed.values.heightCm,
      weightKg: parsed.values.weightKg,
      bodyFatPercentage: parsed.values.bodyFatPercentage,
      activityLevel,
      goal,
    });
  };

  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {!!error && <Text className="text-sm text-destructive">{error}</Text>}
      </CardHeader>
      <CardContent className="gap-4">
        <View className="gap-2">
          <Label>Age</Label>
          <Input value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="e.g. 28" />
        </View>

        <View className="gap-2">
          <Label>Sex</Label>
          <View className="flex-row gap-2">
            {(['male', 'female', 'other'] as const).map((s) => {
              const selected = s === sex;
              return (
                <Button
                  key={s}
                  variant={selected ? 'default' : 'outline'}
                  className="flex-1"
                  onPress={() => setSex(s)}
                  disabled={isSubmitting}>
                  <Text>{s[0].toUpperCase() + s.slice(1)}</Text>
                </Button>
              );
            })}
          </View>
        </View>

        <View className="gap-2">
          <Label>Height (cm)</Label>
          <Input
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="decimal-pad"
            placeholder="e.g. 178"
          />
        </View>

        <View className="gap-2">
          <Label>Weight (kg)</Label>
          <Input
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            placeholder="e.g. 82.5"
          />
        </View>

        <View className="gap-2">
          <Label>Body fat %</Label>
          <Input
            value={bodyFat}
            onChangeText={setBodyFat}
            keyboardType="decimal-pad"
            placeholder="e.g. 18"
          />
        </View>

        <View className="gap-2">
          <Label>Activity level</Label>
          <ActivityLevelSelector value={activityLevel} onChange={setActivityLevel} />
        </View>

        <View className="gap-2">
          <Label>Goal</Label>
          <GoalSelector value={goal} onChange={setGoal} />
        </View>
      </CardContent>
      <CardFooter>
        <Button onPress={handleSubmit} disabled={isSubmitting} className="w-full">
          <Text>{submitLabel}</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

function parseValues(values: {
  age: string;
  heightCm: string;
  weightKg: string;
  bodyFat: string;
}):
  | { ok: true; values: { age: number; heightCm: number; weightKg: number; bodyFatPercentage: number } }
  | { ok: false; error: string } {
  const age = toNumber(values.age);
  if (!age || age < 10 || age > 120) return { ok: false, error: 'Please enter a valid age.' };

  const heightCm = toNumber(values.heightCm);
  if (!heightCm || heightCm < 90 || heightCm > 260) return { ok: false, error: 'Please enter a valid height.' };

  const weightKg = toNumber(values.weightKg);
  if (!weightKg || weightKg < 25 || weightKg > 350) return { ok: false, error: 'Please enter a valid weight.' };

  const bodyFatPercentage = toNumber(values.bodyFat);
  if (bodyFatPercentage == null || bodyFatPercentage < 3 || bodyFatPercentage > 70) {
    return { ok: false, error: 'Please enter a valid body fat %.' };
  }

  return { ok: true, values: { age, heightCm, weightKg, bodyFatPercentage } };
}

function toNumber(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  return Number.isFinite(n) ? n : null;
}


