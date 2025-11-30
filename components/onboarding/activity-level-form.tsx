import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ACTIVITY_MULTIPLIERS } from '@/lib/calculations/katch-mcardle';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { type ActivityLevel } from '@/lib/validation/onboarding';
import * as React from 'react';
import { View } from 'react-native';

interface ActivityLevelFormProps {
  onSubmit?: (level: ActivityLevel) => void;
}

const ACTIVITY_LEVELS: Array<{
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}> = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise',
    multiplier: ACTIVITY_MULTIPLIERS.sedentary,
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: ACTIVITY_MULTIPLIERS.lightly_active,
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: ACTIVITY_MULTIPLIERS.moderately_active,
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    multiplier: ACTIVITY_MULTIPLIERS.very_active,
  },
  {
    value: 'extremely_active',
    label: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    multiplier: ACTIVITY_MULTIPLIERS.extremely_active,
  },
];

/**
 * Activity level form component
 * Allows users to select their activity level
 */
export function ActivityLevelForm({ onSubmit }: ActivityLevelFormProps) {
  const { state, dispatch } = useOnboardingForm();

  function handleSelect(level: ActivityLevel) {
    dispatch({ type: 'SET_ACTIVITY_LEVEL', payload: level });
    onSubmit?.(level);
  }

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Activity Level</CardTitle>
          <CardDescription>How active are you on a typical week?</CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          {ACTIVITY_LEVELS.map((activity) => (
            <Button
              key={activity.value}
              variant={state.activityLevel === activity.value ? 'default' : 'outline'}
              className="w-full items-start"
              onPress={() => handleSelect(activity.value)}>
              <View className="flex-1">
                <Text className="font-medium">{activity.label}</Text>
                <Text className="text-xs opacity-80">{activity.description}</Text>
                <Text className="text-xs opacity-60">Multiplier: {activity.multiplier}x</Text>
              </View>
            </Button>
          ))}
        </CardContent>
      </Card>
    </View>
  );
}

