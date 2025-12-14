import { Redirect } from 'expo-router';
import { useConvexAuth } from 'convex/react';

export default function Index() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/(auth)/sign-in" />;
}
