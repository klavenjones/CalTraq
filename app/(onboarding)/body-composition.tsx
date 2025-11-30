import { BodyCompositionForm } from '@/components/onboarding/body-composition-form';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { RelativePathString, router } from 'expo-router';
import { View } from 'react-native';

/**
 * Body composition screen
 * Collects body measurements for body fat calculation
 */
export default function BodyCompositionScreen() {
  const { dispatch } = useOnboardingForm();

  function handleSubmit() {
    dispatch({ type: 'GO_TO_STEP', payload: 3 });
    router.push('/(onboarding)/activity-level' as RelativePathString);
  }

  return (
    <View className="flex-1 p-6">
      <BodyCompositionForm onSubmit={handleSubmit} />
    </View>
  );
}
