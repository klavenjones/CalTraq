import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../convex/_generated/api';

export function ForgotPasswordForm() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = React.useState(emailParam);
  const { signIn, isLoaded } = useSignIn();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ email?: string }>({});
  const [successMessage, setSuccessMessage] = React.useState('');

  // Record recovery request in Convex for analytics and abuse detection
  const recordRecoveryRequest = useMutation(api.auth.recordRecoveryRequest);

  const onSubmit = async () => {
    if (!email) {
      setError({ email: 'Email is required' });
      return;
    }
    if (!isLoaded || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError({});
    setSuccessMessage('');

    try {
      // Record the recovery request in Convex (for analytics/abuse detection)
      // This is done before the Clerk call to track all attempts
      try {
        await recordRecoveryRequest({ identifierUsed: email });
      } catch (convexErr) {
        // Log but don't block the recovery flow
        console.warn('Failed to record recovery request:', convexErr);
      }

      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      router.push(`/(auth)/reset-password?email=${email}`);
    } catch (err) {
      // Use neutral error messaging to prevent account enumeration
      // Don't reveal whether the email exists in the system
      if (err instanceof Error) {
        // Neutralize error messages
        const neutralMessage =
          'If an account exists with this email, you will receive a password reset code.';

        // For certain errors, we still proceed to the reset screen
        // to avoid revealing account existence
        const shouldProceed =
          err.message.toLowerCase().includes("couldn't find") ||
          err.message.toLowerCase().includes('not found') ||
          err.message.toLowerCase().includes('does not exist');

        if (shouldProceed) {
          // Show neutral success message and proceed
          setSuccessMessage(neutralMessage);
          // Still navigate to prevent enumeration attacks
          setTimeout(() => {
            router.push(`/(auth)/reset-password?email=${email}`);
          }, 1500);
        } else {
          // For other errors (e.g., rate limiting), show the actual error
          setError({ email: err.message });
        }
        return;
      }
      console.error(JSON.stringify(err, null, 2));
      setError({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue={email}
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                onSubmitEditing={onSubmit}
                returnKeyType="send"
                editable={!isSubmitting}
              />
              {error.email ? (
                <Text className="text-sm font-medium text-destructive">{error.email}</Text>
              ) : null}
              {successMessage ? (
                <Text className="text-sm font-medium text-green-600">{successMessage}</Text>
              ) : null}
            </View>
            <Button className="w-full" onPress={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text>Reset your password</Text>
              )}
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
