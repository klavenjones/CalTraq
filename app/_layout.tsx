import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient, useConvexAuth } from 'convex/react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

/**
 * Initialize Convex client with the deployment URL
 *
 * Environment Variables Required:
 * - EXPO_PUBLIC_CONVEX_URL: The Convex deployment URL (e.g., https://xxx.convex.cloud)
 * - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Clerk publishable key (already configured)
 */
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserAccountProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </ThemeProvider>
        </UserAccountProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

SplashScreen.preventAutoHideAsync();

/**
 * Context for the current user's Convex UserAccount
 * This is loaded on app start for signed-in users and provides
 * account data to downstream components.
 */
export const UserAccountContext = React.createContext<{
  userAccount: unknown | null;
  isLoading: boolean;
}>({
  userAccount: null,
  isLoading: true,
});

export function useUserAccountContext() {
  return React.useContext(UserAccountContext);
}

function Routes() {
  const { isLoaded } = useAuth();
  const { isAuthenticated } = useConvexAuth();

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="get-started" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="index" />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}
    </Stack>
  );
}

/**
 * Provider component that loads the UserAccount from Convex
 * for signed-in users and makes it available via context.
 */
function UserAccountProvider({ children }: { children: React.ReactNode }) {
  // The UserAccount will be loaded from Convex using the useUserAccount hook
  // This is a placeholder - actual implementation uses useQuery from convex/react
  // which will be available after running `npx convex dev`
  const [userAccount, setUserAccount] = React.useState<unknown | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // TODO: Replace with actual Convex query once _generated files are available
  // const userAccount = useQuery(api.auth.getCurrentUserAccount);
  // const isLoading = userAccount === undefined;

  React.useEffect(() => {
    // Temporary: mark as loaded after a brief delay
    // This will be replaced by actual Convex query reactivity
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const value = React.useMemo(() => ({ userAccount, isLoading }), [userAccount, isLoading]);

  return <UserAccountContext.Provider value={value}>{children}</UserAccountContext.Provider>;
}

const SIGN_IN_SCREEN_OPTIONS = {
  heaerTransparent: true,
  title: '',
};

const SIGN_UP_SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};
