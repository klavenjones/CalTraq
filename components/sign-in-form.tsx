import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { Link, router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, type TextInput, View } from 'react-native';
import { api } from '../convex/_generated/api';

/** Maximum failed attempts before showing lockout warning */
const MAX_FAILED_ATTEMPTS = 5;
/** Lockout duration in milliseconds (30 seconds) */
const LOCKOUT_DURATION_MS = 30000;

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{ email?: string; password?: string; general?: string }>(
    {}
  );

  // Lockout state for abuse prevention
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [lockoutUntil, setLockoutUntil] = React.useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = React.useState(0);

  // Convex mutation to record sign-in and upsert user account
  const upsertUserAccount = useMutation(api.auth.upsertUserAccount);

  // Lockout countdown effect
  React.useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, lockoutUntil - Date.now());
      setLockoutRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  async function onSubmit() {
    if (!isLoaded || isSubmitting || isLockedOut) {
      return;
    }

    setIsSubmitting(true);
    setError({});

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        setError({});
        setFailedAttempts(0);
        await setActive({ session: signInAttempt.createdSessionId });

        // Create or update UserAccount in Convex after successful sign-in
        try {
          await upsertUserAccount({ email });
        } catch (convexErr) {
          // Log but don't block the sign-in flow
          console.warn('Failed to update UserAccount in Convex:', convexErr);
        }

        return;
      }
      // TODO: Handle other statuses (e.g., needs_second_factor)
      console.error(JSON.stringify(signInAttempt, null, 2));
    } catch (err) {
      // Increment failed attempts and potentially trigger lockout
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
        setError({
          general: 'Too many failed attempts. Please wait before trying again.',
        });
      } else {
        // See https://go.clerk.com/mRUDrIe for more info on error handling
        if (err instanceof Error) {
          // Neutral error messages to prevent account enumeration
          const neutralizedMessage = err.message
            .replace(/identifier/gi, 'email or password')
            .replace(/password is incorrect/gi, 'Invalid credentials');

          const isEmailMessage =
            err.message.toLowerCase().includes('identifier') ||
            err.message.toLowerCase().includes('email');
          setError(
            isEmailMessage ? { email: neutralizedMessage } : { password: neutralizedMessage }
          );
        } else {
          console.error(JSON.stringify(err, null, 2));
          setError({ general: 'An unexpected error occurred. Please try again.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to CalTraq</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
              />
              {error.email ? (
                <Text className="text-sm font-medium text-destructive">{error.email}</Text>
              ) : null}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Link asChild href={`/(auth)/forgot-password?email=${email}`}>
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4">
                    <Text className="font-normal leading-4">Forgot your password?</Text>
                  </Button>
                </Link>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
              {error.password ? (
                <Text className="text-sm font-medium text-destructive">{error.password}</Text>
              ) : null}
            </View>
            {error.general ? (
              <Text className="text-center text-sm font-medium text-destructive">
                {error.general}
              </Text>
            ) : null}
            {isLockedOut ? (
              <View className="rounded-md bg-destructive/10 p-3">
                <Text className="text-center text-sm text-destructive">
                  Too many attempts. Please wait {lockoutRemaining} seconds.
                </Text>
              </View>
            ) : null}
            <Button className="w-full" onPress={onSubmit} disabled={isSubmitting || isLockedOut}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text>Continue</Text>
              )}
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/(auth)/sign-up" className="text-sm underline underline-offset-4">
              Sign up
            </Link>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-sm text-muted-foreground">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
