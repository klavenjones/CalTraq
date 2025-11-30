import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { convertKgToLb } from '@/lib/calculations/unit-conversion';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { goalConfigurationSchema, type GoalConfiguration } from '@/lib/validation/onboarding';
import * as React from 'react';
import { View } from 'react-native';

interface GoalFormProps {
  onSubmit?: (data: GoalConfiguration) => void;
}

const GOAL_PHASES = [
  { value: 'slow' as const, label: 'Slow', description: '0.25 kg/week (~0.5 lbs/week)' },
  { value: 'moderate' as const, label: 'Moderate', description: '0.5 kg/week (~1 lb/week)' },
  { value: 'aggressive' as const, label: 'Aggressive', description: '0.75 kg/week (~1.5 lbs/week)' },
  { value: 'maintenance' as const, label: 'Maintenance', description: 'Maintain current weight' },
];

/**
 * Goal form component
 * Collects goal phase, type, and value
 */
export function GoalForm({ onSubmit }: GoalFormProps) {
  const { state, dispatch } = useOnboardingForm();
  const [goalPhase, setGoalPhase] = React.useState<'slow' | 'moderate' | 'aggressive' | 'maintenance' | ''>('');
  const [goalType, setGoalType] = React.useState<'weekly_change' | 'target_weight' | ''>('');
  const [goalValue, setGoalValue] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isImperial = state.units === 'imperial';

  // Load existing goal data
  React.useEffect(() => {
    if (state.goal) {
      setGoalPhase(state.goal.goalPhase);
      setGoalType(state.goal.goalType);
      if (state.goal.goalType === 'target_weight') {
        const displayWeight = isImperial
          ? convertKgToLb(state.goal.goalValue).toString()
          : state.goal.goalValue.toString();
        setGoalValue(displayWeight);
      } else {
        setGoalValue(state.goal.goalValue.toString());
      }
    }
  }, [state.goal, isImperial]);

  function handleSubmit() {
    if (!goalPhase || !goalType || !goalValue) {
      setErrors({ general: 'Please fill in all fields' });
      return;
    }

    const numValue = parseFloat(goalValue);
    if (isNaN(numValue) || numValue <= 0) {
      setErrors({ general: 'Please enter a valid positive number' });
      return;
    }

    // Convert to metric for storage
    const metricValue =
      goalType === 'target_weight' && isImperial ? numValue / 2.20462 : numValue;

    // Validate target weight differs from current weight
    if (goalType === 'target_weight' && state.basicStats) {
      const currentWeight = state.basicStats.weight;
      if (Math.abs(metricValue - currentWeight) < 0.1) {
        setErrors({
          general: 'Target weight must be different from your current weight',
        });
        return;
      }
    }

    const formData: GoalConfiguration = {
      goalPhase: goalPhase as 'slow' | 'moderate' | 'aggressive' | 'maintenance',
      goalType: goalType as 'weekly_change' | 'target_weight',
      goalValue: metricValue,
    };

    try {
      goalConfigurationSchema.parse(formData);
      setErrors({});
      dispatch({ type: 'SET_GOAL', payload: formData });
      onSubmit?.(formData);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  }

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Your Goal</CardTitle>
          <CardDescription>What are you trying to achieve?</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-1.5">
            <Label>Goal Phase</Label>
            <View className="gap-2">
              {GOAL_PHASES.map((phase) => (
                <Button
                  key={phase.value}
                  variant={goalPhase === phase.value ? 'default' : 'outline'}
                  className="w-full items-start"
                  onPress={() => setGoalPhase(phase.value)}>
                  <View className="flex-1">
                    <Text className="font-medium">{phase.label}</Text>
                    <Text className="text-xs opacity-80">{phase.description}</Text>
                  </View>
                </Button>
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Label>Goal Type</Label>
            <View className="flex-row gap-2">
              <Button
                variant={goalType === 'weekly_change' ? 'default' : 'outline'}
                className="flex-1"
                onPress={() => setGoalType('weekly_change')}>
                <Text>Weekly Change</Text>
              </Button>
              <Button
                variant={goalType === 'target_weight' ? 'default' : 'outline'}
                className="flex-1"
                onPress={() => setGoalType('target_weight')}>
                <Text>Target Weight</Text>
              </Button>
            </View>
          </View>

          {goalType && (
            <View className="gap-1.5">
              <Label htmlFor="goalValue">
                {goalType === 'target_weight'
                  ? `Target Weight (${isImperial ? 'lbs' : 'kg'})`
                  : 'Weekly Change (kg/week)'}
              </Label>
              <Input
                id="goalValue"
                placeholder={goalType === 'target_weight' ? (isImperial ? '150' : '68') : '0.5'}
                keyboardType="numeric"
                value={goalValue}
                onChangeText={setGoalValue}
              />
            </View>
          )}

          {errors.general && (
            <Text className="text-sm font-medium text-destructive">{errors.general}</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );
}

