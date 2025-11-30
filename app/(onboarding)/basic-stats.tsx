import { BasicStatsForm } from '@/components/onboarding/basic-stats-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { RelativePathString, router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

/**
 * Basic stats screen
 * Collects user's basic physical information
 */
export default function BasicStatsScreen() {
  const { state, dispatch } = useOnboardingForm();
  const [canSubmit, setCanSubmit] = React.useState(false);

  function handleFormSubmit() {
    setCanSubmit(true);
    dispatch({ type: 'GO_TO_STEP', payload: 2 });
    // Navigate based on whether body fat was provided
    if (state.basicStats?.bodyFatPercentage !== undefined) {
      router.push('/(onboarding)/activity-level' as RelativePathString);
    } else {
      router.push('/(onboarding)/body-composition' as RelativePathString);
    }
  }

  function handleContinue() {
    // Trigger form submission
    handleFormSubmit();
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1">
        <BasicStatsForm onSubmit={handleFormSubmit} />
      </View>
      <View className="mt-6">
        <Button className="w-full" onPress={handleContinue}>
          <Text>Continue</Text>
        </Button>
      </View>
    </View>
  );
}
