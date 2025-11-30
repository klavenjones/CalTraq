import { ReviewSummary } from '@/components/onboarding/review-summary';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  calculateBMR,
  calculateGoalCalories,
  calculateProteinTarget,
  calculateTDEE,
} from '@/lib/calculations/katch-mcardle';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { VALIDATION_BOUNDS } from '@/lib/validation/constants';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../../convex/_generated/api';

/**
 * Calculate expected timeline in weeks
 */
function calculateExpectedTimeline(
  goalType: 'weekly_change' | 'target_weight',
  goalValue: number,
  goalPhase: 'slow' | 'moderate' | 'aggressive' | 'maintenance',
  currentWeight: number
): number | undefined {
  if (goalPhase === 'maintenance') {
    return undefined;
  }

  const weeklyChangeRate = {
    slow: 0.25,
    moderate: 0.5,
    aggressive: 0.75,
    maintenance: 0,
  };

  if (goalType === 'target_weight') {
    const weightDiff = Math.abs(currentWeight - goalValue);
    return Math.ceil(weightDiff / weeklyChangeRate[goalPhase]);
  } else {
    // For weekly_change, estimate based on reasonable weight loss
    const estimatedWeeks = Math.ceil(Math.abs(goalValue) / weeklyChangeRate[goalPhase]);
    return estimatedWeeks;
  }
}

/**
 * Review and confirm screen
 * Displays all entered information and calculated targets
 * Allows user to confirm and complete onboarding
 */
export default function ReviewScreen() {
  const { state, dispatch } = useOnboardingForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completeOnboarding = useMutation((api as any).onboarding.completeOnboarding);
  const [calculatedCalories, setCalculatedCalories] = React.useState<number | null>(null);
  const [calculatedProtein, setCalculatedProtein] = React.useState<number | null>(null);
  const [expectedTimeline, setExpectedTimeline] = React.useState<number | undefined>(undefined);
  const [isUnsafeCalories, setIsUnsafeCalories] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Perform calculations when component mounts or data changes
  // Recalculates automatically when basic stats, activity level, goal, or lean body mass changes
  React.useEffect(() => {
    if (
      !state.basicStats ||
      !state.activityLevel ||
      !state.goal ||
      state.calculatedLeanBodyMass === null
    ) {
      return;
    }

    // Calculate BMR
    const bmr = calculateBMR(state.calculatedLeanBodyMass);

    // Calculate TDEE
    const tdee = calculateTDEE(bmr, state.activityLevel);

    // Calculate goal calories
    const goalCalories = calculateGoalCalories(tdee, state.goal.goalPhase);

    // Calculate protein target
    const proteinTarget = calculateProteinTarget(state.basicStats.weight, state.goal.goalPhase);

    // Check for unsafe calories
    const unsafe = goalCalories < VALIDATION_BOUNDS.MIN_SAFE_CALORIES;

    // Calculate expected timeline
    const timeline = calculateExpectedTimeline(
      state.goal.goalType,
      state.goal.goalValue,
      state.goal.goalPhase,
      state.basicStats.weight
    );

    setCalculatedCalories(goalCalories);
    setCalculatedProtein(proteinTarget);
    setExpectedTimeline(timeline);
    setIsUnsafeCalories(unsafe);
  }, [
    state.basicStats,
    state.basicStats?.height,
    state.basicStats?.weight,
    state.basicStats?.age,
    state.activityLevel,
    state.goal,
    state.goal?.goalPhase,
    state.goal?.goalType,
    state.goal?.goalValue,
    state.calculatedLeanBodyMass,
  ]);

  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const MAX_RETRIES = 3;

  async function handleConfirm() {
    if (!calculatedCalories || !calculatedProtein || !state.basicStats || !state.goal || !state.activityLevel) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        await completeOnboarding({
          units: state.units || 'metric',
          basicStats: state.basicStats,
          bodyComposition: state.bodyComposition || undefined,
          bodyCompositionMethod: state.bodyCompositionMethod || undefined,
          calculatedBodyFatPercentage: state.calculatedBodyFatPercentage || undefined,
          calculatedLeanBodyMass: state.calculatedLeanBodyMass || 0,
          activityLevel: state.activityLevel,
          goal: state.goal,
          calculatedCalorieTarget: calculatedCalories,
          calculatedProteinTarget: calculatedProtein,
          expectedTimelineWeeks: expectedTimeline,
        });

        dispatch({ type: 'GO_TO_STEP', payload: 6 });
        router.replace('/');
        return; // Success, exit retry loop
      } catch (error) {
        attempts++;
        setRetryCount(attempts);
        
        if (attempts >= MAX_RETRIES) {
          setError(
            'Failed to save your profile. Please check your internet connection and try again.'
          );
          setIsSubmitting(false);
          return;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  if (
    !state.basicStats ||
    !state.activityLevel ||
    !state.goal ||
    calculatedCalories === null ||
    calculatedProtein === null
  ) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text>Loading calculations...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1">
        <ReviewSummary
          units={state.units || 'metric'}
          basicStats={state.basicStats}
          activityLevel={state.activityLevel}
          goal={state.goal}
          calculatedCalorieTarget={calculatedCalories}
          calculatedProteinTarget={calculatedProtein}
          expectedTimelineWeeks={expectedTimeline}
          isUnsafeCalories={isUnsafeCalories}
        />
      </View>
      <View className="gap-4 mt-6">
        {error && (
          <View className="p-3 rounded-md bg-destructive/10">
            <Text className="text-sm font-medium text-destructive">{error}</Text>
            {retryCount > 0 && (
              <Text className="mt-1 text-xs text-destructive/80">
                Retry attempt {retryCount} of {MAX_RETRIES}
              </Text>
            )}
          </View>
        )}
        <Button className="w-full" onPress={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text>Confirm and Complete</Text>
          )}
        </Button>
      </View>
    </View>
  );
}

