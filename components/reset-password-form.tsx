import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { api } from '../convex/_generated/api';

export function ResetPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const codeInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState({ code: '', password: '', general: '' });

  // Convex mutation to upsert user account after successful password reset
  const upsertUserAccount = useMutation(api.auth.upsertUserAccount);

  async function onSubmit() {
    if (!isLoaded || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError({ code: '', password: '', general: '' });

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        // Set the active session to
        // the newly created session (user is now signed in)
        await setActive({ session: result.createdSessionId });

        // Upsert the user account in Convex after successful recovery
        // This ensures the account is active and lastSignInAt is updated
        try {
          await upsertUserAccount({ email });
        } catch (convexErr) {
          // Log but don't block - the user is already authenticated
          console.warn('Failed to update UserAccount after recovery:', convexErr);
        }

        return;
      }
      // TODO: Handle other statuses (e.g., needs_second_factor)
      setError({ code: '', password: '', general: 'Additional verification may be required.' });
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isPasswordMessage = err.message.toLowerCase().includes('password');
        const isCodeMessage =
          err.message.toLowerCase().includes('code') ||
          err.message.toLowerCase().includes('incorrect') ||
          err.message.toLowerCase().includes('expired');

        if (isPasswordMessage) {
          setError({ code: '', password: err.message, general: '' });
        } else if (isCodeMessage) {
          setError({ code: err.message, password: '', general: '' });
        } else {
          setError({ code: '', password: '', general: err.message });
        }
        return;
      }
      console.error(JSON.stringify(err, null, 2));
      setError({
        code: '',
        password: '',
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Reset password</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter the code sent to your email and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">New password</Label>
              </View>
              <Input
                id="password"
                secureTextEntry
                onChangeText={setPassword}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={onPasswordSubmitEditing}
              />
              {error.password ? (
                <Text className="text-sm font-medium text-destructive">{error.password}</Text>
              ) : null}
            </View>
            <View className="gap-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
                ref={codeInputRef}
                id="code"
                autoCapitalize="none"
                onChangeText={setCode}
                returnKeyType="send"
                keyboardType="numeric"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                onSubmitEditing={onSubmit}
                editable={!isSubmitting}
              />
              {error.code ? (
                <Text className="text-sm font-medium text-destructive">{error.code}</Text>
              ) : null}
            </View>
            {error.general ? (
              <Text className="text-center text-sm font-medium text-destructive">
                {error.general}
              </Text>
            ) : null}
            <Button className="w-full" onPress={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text>Reset Password</Text>
              )}
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
