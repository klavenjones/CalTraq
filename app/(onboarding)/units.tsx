import { UnitsSelectionForm } from '@/components/onboarding/units-selection-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { RelativePathString, router } from 'expo-router';
import { View } from 'react-native';

/**
 * Units selection screen
 * First step in onboarding after welcome
 */
export default function UnitsScreen() {
  const { state, dispatch } = useOnboardingForm();

  function handleContinue() {
    if (!state.units) {
      return; // Units must be selected
    }
    dispatch({ type: 'GO_TO_STEP', payload: 1 });
    router.push('/(onboarding)/basic-stats' as RelativePathString);
  }

  return (
    <View className="flex-1 p-6">
      <View className="flex-1">
        <UnitsSelectionForm />
      </View>
      <View className="mt-6">
        <Button className="w-full" onPress={handleContinue} disabled={!state.units}>
          <Text>Continue</Text>
        </Button>
      </View>
    </View>
  );
}

