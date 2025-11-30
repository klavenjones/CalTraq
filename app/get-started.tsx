import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@clerk/clerk-expo';
import { useConvexAuth } from 'convex/react';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Image, type ImageStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOGO = require('@/assets/images/icon.png');

const LOGO_STYLE: ImageStyle = {
  height: 80,
  width: 80,
  resizeMode: 'contain',
};

export default function GetStartedScreen() {
  const { isLoaded } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [logoError, setLogoError] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Show loading indicator while auth status is being checked
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // If authenticated, the Stack.Protected guard will handle redirect
  // But we can also add a safety check here
  React.useEffect(() => {
    if (isLoaded && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoaded, isAuthenticated, router]);

  const handleGetStarted = React.useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push('/(auth)/sign-up');
    // Reset navigation state after a delay to allow navigation
    setTimeout(() => setIsNavigating(false), 1000);
  }, [router, isNavigating]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
      <View className="flex h-full w-full">
        {/* Logo with error handling. TODO: Uncomment when we have a logo will use generic text  */}
        {/* <View className="justify-center items-center h-20">
          {logoError ? (
            <Text variant="h1" className="text-4xl font-extrabold">
              CalTraq
            </Text>
          ) : (
            <Image
              source={LOGO}
              style={LOGO_STYLE}
              onError={() => setLogoError(true)}
              accessibilityLabel="CalTraq logo"
            />
          )}
        </View> */}
        <View className="grow items-center justify-center">
          <Text variant="h1" className="text-6xl font-bold">
            CalTraq
          </Text>
        </View>

        <View className="items-center gap-4 pb-20">
          {/* Caption */}
          <Text variant="p" className="center text-lg">
            Log your Calories the right way.
          </Text>

          {/* Get Started Button */}
          <Button
            onPress={handleGetStarted}
            disabled={isNavigating}
            className="w-full max-w-xs rounded-md"
            accessibilityLabel="Get Started"
            accessibilityRole="button"
            accessibilityHint="Navigate to sign up screen to create a new account">
            <Text className="text-right">Get Started</Text>
          </Button>

          {/* Already have an account link */}
          <View className="flex-row items-center gap-1">
            <Text className="text-sm text-muted-foreground">Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text
                className="text-sm font-medium text-primary underline underline-offset-4"
                accessibilityLabel="Sign In"
                accessibilityRole="link"
                accessibilityHint="Navigate to sign in screen">
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
