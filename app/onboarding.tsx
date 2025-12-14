import { ActivityLevelSelector } from '@/components/activity-level-selector';
import { GoalSelector } from '@/components/goal-selector';
import { UnitSystemSelector } from '@/components/unit-system-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import {
  calculateBmrKatchMcArdle,
  calculateDailyCalorieTarget,
  calculateDailyProteinTargetGrams,
  calculateEstimatedTdee,
  calculateLeanBodyMassKg,
} from '@/lib/calculations';
import type { UnitSystem } from '@/lib/units';
import { inchesToCm, lbsToKg } from '@/lib/units';
import type { ActivityLevel, Goal, Sex } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function OnboardingScreen() {
  const user = useQuery(api.queries.getUser, {});
  const profile = useQuery(api.queries.getProfile, {});
  const createProfile = useMutation(api.mutations.createProfile);
  const setUnitSystem = useMutation(api.mutations.setUnitSystem);

  const unitSystem: UnitSystem = user?.unitSystem ?? 'metric';

  React.useEffect(() => {
    if (profile) {
      router.replace('/(tabs)/dashboard');
    }
  }, [profile]);

  const [step, setStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [age, setAge] = React.useState('');
  const [sex, setSex] = React.useState<Sex>('male');
  const [heightCm, setHeightCm] = React.useState('');
  const [weightKg, setWeightKg] = React.useState('');
  const [bodyFat, setBodyFat] = React.useState('');
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>('lightly_active');
  const [goal, setGoal] = React.useState<Goal>('maintain');

  const parsed = parseAll({ age, heightInput: heightCm, weightInput: weightKg, bodyFat }, unitSystem);
  const metrics =
    parsed.ok
      ? (() => {
          const lbm = calculateLeanBodyMassKg(parsed.values.weightKg, parsed.values.bodyFatPercentage);
          const bmr = calculateBmrKatchMcArdle(lbm);
          const tdee = calculateEstimatedTdee(bmr, activityLevel);
          const calTarget = calculateDailyCalorieTarget(tdee, goal);
          const proteinTarget = calculateDailyProteinTargetGrams(parsed.values.weightKg);
          return {
            lbm,
            bmr,
            tdee,
            calTarget,
            proteinTarget,
          };
        })()
      : null;

  const goNext = () => {
    setError(null);
    const err = validateStep(step, { age, heightInput: heightCm, weightInput: weightKg, bodyFat }, unitSystem);
    if (err) return setError(err);
    setStep((s) => Math.min(2, s + 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const save = async () => {
    setError(null);
    if (!parsed.ok) return setError(parsed.error);
    setIsSubmitting(true);
    try {
      await createProfile({
        age: parsed.values.age,
        sex,
        height: parsed.values.heightCm,
        weight: parsed.values.weightKg,
        bodyFatPercentage: parsed.values.bodyFatPercentage,
        activityLevel,
        goal,
      });
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      setError(e?.message ?? 'Could not save profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <Card className="mx-4">
        <CardHeader className="gap-1">
          <CardTitle className="text-xl">Welcome to CalTraq</CardTitle>
          <Text variant="muted">Step {step + 1} of 3</Text>
          {!!error && <Text className="text-sm text-destructive">{error}</Text>}
        </CardHeader>

        <CardContent className="gap-4">
          {step === 0 ? (
            <>
              <View className="gap-2">
                <Label>Units</Label>
                <UnitSystemSelector
                  value={unitSystem}
                  disabled={user === undefined || !user}
                  onChange={(next) => {
                    setError(null);
                    void setUnitSystem({ unitSystem: next });
                  }}
                />
                <Text variant="muted" className="text-xs">
                  You can change this later in Settings.
                </Text>
              </View>

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
            </>
          ) : null}

          {step === 1 ? (
            <>
              <View className="gap-2">
                <Label>{unitSystem === 'imperial' ? 'Height (in)' : 'Height (cm)'}</Label>
                <Input
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="decimal-pad"
                  placeholder={unitSystem === 'imperial' ? 'e.g. 70' : 'e.g. 178'}
                />
              </View>

              <View className="gap-2">
                <Label>{unitSystem === 'imperial' ? 'Weight (lb)' : 'Weight (kg)'}</Label>
                <Input
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="decimal-pad"
                  placeholder={unitSystem === 'imperial' ? 'e.g. 180' : 'e.g. 82.5'}
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
            </>
          ) : null}

          {step === 2 ? (
            <>
              <View className="gap-2">
                <Label>Activity level</Label>
                <ActivityLevelSelector value={activityLevel} onChange={setActivityLevel} />
              </View>

              <View className="gap-2">
                <Label>Goal</Label>
                <GoalSelector value={goal} onChange={setGoal} />
              </View>

              <View className="gap-2 rounded-xl border border-border bg-card p-4">
                <Text className="font-medium">Your starting targets</Text>
                {metrics ? (
                  <View className="gap-1">
                    <Text variant="muted">Lean body mass: {metrics.lbm.toFixed(1)} kg</Text>
                    <Text variant="muted">BMR (Katch–McArdle): {Math.round(metrics.bmr)} kcal/day</Text>
                    <Text variant="muted">Estimated TDEE: {Math.round(metrics.tdee)} kcal/day</Text>
                    <Text variant="muted">
                      Calorie target: {Math.round(metrics.calTarget)} kcal/day
                    </Text>
                    <Text variant="muted">Protein target: {Math.round(metrics.proteinTarget)} g/day</Text>
                  </View>
                ) : (
                  <Text variant="muted">Fill in the previous steps to see targets.</Text>
                )}
              </View>
            </>
          ) : null}
        </CardContent>

        <CardFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={goBack} disabled={step === 0 || isSubmitting}>
            <Text>Back</Text>
          </Button>

          {step < 2 ? (
            <Button className="flex-1" onPress={goNext} disabled={isSubmitting}>
              <Text>Next</Text>
            </Button>
          ) : (
            <Button className="flex-1" onPress={save} disabled={isSubmitting || !metrics}>
              <Text>{isSubmitting ? 'Saving…' : 'Finish'}</Text>
            </Button>
          )}
        </CardFooter>
      </Card>
    </View>
  );
}

function validateStep(
  step: number,
  values: { age: string; heightInput: string; weightInput: string; bodyFat: string },
  unitSystem: UnitSystem
): string | null {
  if (step === 0) {
    const age = toNumber(values.age);
    if (!age || age < 10 || age > 120) return 'Please enter a valid age.';
    return null;
  }
  if (step === 1) {
    const heightN = toNumber(values.heightInput);
    if (heightN == null || heightN <= 0) return 'Please enter a valid height.';
    const heightCm = unitSystem === 'imperial' ? inchesToCm(heightN) : heightN;
    if (heightCm < 90 || heightCm > 260) return 'Please enter a valid height.';

    const weightN = toNumber(values.weightInput);
    if (weightN == null || weightN <= 0) return 'Please enter a valid weight.';
    const weightKg = unitSystem === 'imperial' ? lbsToKg(weightN) : weightN;
    if (weightKg < 25 || weightKg > 350) return 'Please enter a valid weight.';

    const bf = toNumber(values.bodyFat);
    if (bf == null || bf < 3 || bf > 70) return 'Please enter a valid body fat %.';
    return null;
  }
  return null;
}

function parseAll(values: { age: string; heightInput: string; weightInput: string; bodyFat: string }, unitSystem: UnitSystem):
  | {
      ok: true;
      values: { age: number; heightCm: number; weightKg: number; bodyFatPercentage: number };
    }
  | { ok: false; error: string } {
  const age = toNumber(values.age);
  const heightN = toNumber(values.heightInput);
  const weightN = toNumber(values.weightInput);
  const bodyFatPercentage = toNumber(values.bodyFat);
  if (!age || heightN == null || weightN == null || bodyFatPercentage == null) {
    return { ok: false, error: 'Please complete all fields.' };
  }

  const heightCm = unitSystem === 'imperial' ? inchesToCm(heightN) : heightN;
  const weightKg = unitSystem === 'imperial' ? lbsToKg(weightN) : weightN;
  return { ok: true, values: { age, heightCm, weightKg, bodyFatPercentage } };
}

function toNumber(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  return Number.isFinite(n) ? n : null;
}


