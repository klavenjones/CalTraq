import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { RelativePathString, router } from 'expo-router';
import { View } from 'react-native';

/**
 * Welcome screen for onboarding flow
 * First screen users see when starting onboarding
 */
export default function WelcomeScreen() {
  function handleGetStarted() {
    router.push('/(onboarding)/units' as RelativePathString);
  }

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CalTraq</CardTitle>
          <CardDescription className="text-base">
            Let&apos;s set up your personalized nutrition plan. This will only take a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <Button className="w-full" onPress={handleGetStarted}>
            <Text>Get Started</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}
