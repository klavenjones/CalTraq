import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { convertCmToIn, convertKgToLb } from '@/lib/calculations/unit-conversion';
import { VALIDATION_BOUNDS } from '@/lib/validation/constants';
import { View } from 'react-native';

interface ReviewSummaryProps {
  units: 'imperial' | 'metric';
  basicStats: {
    height: number;
    weight: number;
    gender: string;
    age: number;
    bodyFatPercentage?: number;
  };
  activityLevel: string;
  goal: {
    goalPhase: string;
    goalType: string;
    goalValue: number;
  };
  calculatedCalorieTarget: number;
  calculatedProteinTarget: number;
  expectedTimelineWeeks?: number;
  isUnsafeCalories: boolean;
}

/**
 * Review summary component
 * Displays all entered values and calculated targets
 */
export function ReviewSummary({
  units,
  basicStats,
  activityLevel,
  goal,
  calculatedCalorieTarget,
  calculatedProteinTarget,
  expectedTimelineWeeks,
  isUnsafeCalories,
}: ReviewSummaryProps) {
  const isImperial = units === 'imperial';
  const displayHeight = isImperial ? convertCmToIn(basicStats.height) : basicStats.height;
  const displayWeight = isImperial ? convertKgToLb(basicStats.weight) : basicStats.weight;

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Review Your Information</CardTitle>
          <CardDescription>Please review your details before confirming</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-2">
            <Text className="font-semibold">Basic Information</Text>
            <Text>
              Height: {displayHeight.toFixed(1)} {isImperial ? 'inches' : 'cm'}
            </Text>
            <Text>
              Weight: {displayWeight.toFixed(1)} {isImperial ? 'lbs' : 'kg'}
            </Text>
            <Text>Gender: {basicStats.gender}</Text>
            <Text>Age: {basicStats.age} years</Text>
            {basicStats.bodyFatPercentage && (
              <Text>Body Fat: {basicStats.bodyFatPercentage.toFixed(1)}%</Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="font-semibold">Activity Level</Text>
            <Text className="capitalize">{activityLevel.replace('_', ' ')}</Text>
          </View>

          <View className="gap-2">
            <Text className="font-semibold">Goal</Text>
            <Text className="capitalize">{goal.goalPhase}</Text>
            <Text className="capitalize">{goal.goalType.replace('_', ' ')}</Text>
          </View>

          <View className="gap-2">
            <Text className="font-semibold">Your Targets</Text>
            <Text className="text-lg font-bold">
              Daily Calories: {Math.round(calculatedCalorieTarget)}
            </Text>
            <Text className="text-lg font-bold">
              Daily Protein: {Math.round(calculatedProteinTarget)}g
            </Text>
            {expectedTimelineWeeks && (
              <Text>Expected Timeline: {expectedTimelineWeeks} weeks</Text>
            )}
          </View>

          {isUnsafeCalories && (
            <View className="rounded-md bg-destructive/10 p-3">
              <Text className="text-sm font-semibold text-destructive">⚠️ Safety Warning</Text>
              <Text className="mt-1 text-sm text-destructive">
                Your calculated calorie target ({Math.round(calculatedCalorieTarget)}) is below the
                minimum safe threshold ({VALIDATION_BOUNDS.MIN_SAFE_CALORIES} calories).
              </Text>
              <Text className="mt-2 text-xs text-destructive/80">
                We strongly recommend consulting with a healthcare professional before proceeding
                with this plan. Very low calorie diets can be harmful to your health.
              </Text>
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
}

