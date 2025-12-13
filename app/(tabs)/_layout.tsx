import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Redirect, Tabs } from 'expo-router';
import { ChartLineIcon, HouseIcon, SettingsIcon, UtensilsIcon, WeightIcon } from 'lucide-react-native';
import * as React from 'react';

export default function TabsLayout() {
  const profile = useQuery(api.queries.getProfile, {});

  // While loading profile, avoid flashing tabs.
  if (profile === undefined) return null;
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <HouseIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="log-food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => <UtensilsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="log-weight"
        options={{
          title: 'Weight',
          tabBarIcon: ({ color, size }) => <WeightIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <ChartLineIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}


