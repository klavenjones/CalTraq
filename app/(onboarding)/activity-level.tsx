import { ActivityLevelForm } from '@/components/onboarding/activity-level-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { RelativePathString, router } from 'expo-router';
import { View } from 'react-native';

/**
 * Activity level screen
 * Allows users to select their activity level
 */
export default function ActivityLevelScreen() {
  const { state, dispatch } = useOnboardingForm();

  function handleContinue() {
    if (!state.activityLevel) return;
    dispatch({ type: 'GO_TO_STEP', payload: 4 });
    router.push('/(onboarding)/goal' as RelativePathString);
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1">
        <ActivityLevelForm />
      </View>
      <View className="mt-6">
        <Button className="w-full" onPress={handleContinue} disabled={!state.activityLevel}>
          <Text>Continue</Text>
        </Button>
      </View>
    </View>
  );
}
