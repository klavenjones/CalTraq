import { GoalForm } from '@/components/onboarding/goal-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { RelativePathString, router } from 'expo-router';
import { View } from 'react-native';

/**
 * Goal setting screen
 * Collects user's goal configuration
 */
export default function GoalScreen() {
  const { state, dispatch } = useOnboardingForm();

  function handleContinue() {
    if (!state.goal) return;
    dispatch({ type: 'GO_TO_STEP', payload: 5 });
    router.push('/(onboarding)/review' as RelativePathString);
  }
  console.log(state.goal, 'state.goal');
  return (
    <View className="flex-1 p-6">
      <View className="flex-1">
        <GoalForm />
      </View>
      <View className="mt-6">
        <Button
          className="w-full"
          onPress={handleContinue}
          disabled={state.goal === null || state.goal === undefined}>
          <Text>Continue</Text>
        </Button>
      </View>
    </View>
  );
}
