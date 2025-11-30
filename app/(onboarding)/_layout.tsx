import { OnboardingFormProvider, useOnboardingForm } from '@/lib/onboarding/state';
import { useOnboardingPersistence } from '@/lib/onboarding/persistence';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as React from 'react';
import { BackHandler, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useConvexAuth } from 'convex/react';
import { useUserAccount } from '@/lib/convex/auth'; // Add this import

/**
 * Onboarding layout with progress indicator
 * Wraps all onboarding screens with form state provider
 * Loads saved progress on mount and saves progress after each step
 */
export default function OnboardingLayout() {
  return (
    <OnboardingFormProvider>
      <OnboardingLayoutContent />
    </OnboardingFormProvider>
  );
}

function OnboardingLayoutContent() {
  const { state, dispatch } = useOnboardingForm();
  const { loadProgress, saveProgress } = useOnboardingPersistence();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const { isAuthenticated } = useConvexAuth();
  const userAccount = useUserAccount(); // Add this - checks if UserAccount exists

  // Load saved progress on mount
  React.useEffect(() => {
    async function loadSavedProgress() {
      try {
        const savedState = await loadProgress();
        console.log(savedState, 'savedState');
        if (savedState) {
          dispatch({ type: 'LOAD_STATE', payload: savedState });

          // Navigate to last completed step
          const stepRoutes = [
            'welcome',
            'units',
            'basic-stats',
            'body-composition',
            'activity-level',
            'goal',
            'review',
          ];

          const currentStep = savedState.currentStep ?? 0;
          if (currentStep > 0 && currentStep < stepRoutes.length) {
            router.replace(`/(onboarding)/${stepRoutes[currentStep]}` as any);
          }
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedProgress();
  }, []);

  // Save progress after each step change - but only if authenticated AND UserAccount exists
  React.useEffect(() => {
    if (!isLoading && state.units !== null && isAuthenticated && userAccount) {
      // Add userAccount check
      saveProgress(state).catch((error) => {
        console.error('Failed to save progress:', error);
      });
    }
  }, [
    state.currentStep,
    state.units,
    state.basicStats,
    state.bodyComposition,
    state.activityLevel,
    state.goal,
    isLoading,
    isAuthenticated,
    userAccount, // Add to dependencies
  ]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: () => <ProgressIndicator />,
          headerLeft: () => <BackButton />,
        }}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="units" />
        <Stack.Screen name="basic-stats" />
        <Stack.Screen name="body-composition" />
        <Stack.Screen name="activity-level" />
        <Stack.Screen name="goal" />
        <Stack.Screen name="review" />
      </Stack>
      <BackHandlerWrapper />
    </>
  );
}

/**
 * Back button component that navigates backward while preserving form state
 */
function BackButton() {
  const router = useRouter();
  const segments = useSegments();
  const { state, dispatch } = useOnboardingForm();

  // Don't show back button on welcome screen
  if (segments.includes('welcome')) {
    return null;
  }

  function handleBack() {
    const currentStep = state.currentStep;
    if (currentStep > 0) {
      dispatch({ type: 'GO_TO_STEP', payload: currentStep - 1 });
    }

    // Navigate to previous screen based on current step
    const stepRoutes = [
      'welcome',
      'units',
      'basic-stats',
      'body-composition',
      'activity-level',
      'goal',
      'review',
    ];

    if (currentStep > 0) {
      const previousRoute = stepRoutes[currentStep - 1];
      router.push(`/(onboarding)/${previousRoute}` as any);
    } else {
      router.back();
    }
  }

  return (
    <Button variant="ghost" onPress={handleBack}>
      <Text>Back</Text>
    </Button>
  );
}

/**
 * BackHandler wrapper to handle device back button on Android
 */
function BackHandlerWrapper() {
  const router = useRouter();
  const segments = useSegments();
  const { state, dispatch } = useOnboardingForm();

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Don't allow back on welcome screen
      if (segments.includes('welcome')) {
        return true; // Prevent default back behavior
      }

      const currentStep = state.currentStep;
      if (currentStep > 0) {
        dispatch({ type: 'GO_TO_STEP', payload: currentStep - 1 });

        const stepRoutes = [
          'welcome',
          'units',
          'basic-stats',
          'body-composition',
          'activity-level',
          'goal',
          'review',
        ];

        const previousRoute = stepRoutes[currentStep - 1];
        router.push(`/(onboarding)/${previousRoute}` as any);
        return true; // Prevent default back behavior
      }

      return false; // Allow default back behavior
    });

    return () => backHandler.remove();
  }, [router, segments, state.currentStep, dispatch]);

  return null;
}

/**
 * Progress indicator component showing current step
 */
function ProgressIndicator() {
  const { state } = useOnboardingForm();
  const totalSteps = 7;
  const currentStep = state.currentStep + 1; // 1-indexed for display

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm font-medium">
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
