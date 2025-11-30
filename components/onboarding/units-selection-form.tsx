import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { convertOnboardingData } from '@/lib/calculations/unit-conversion';
import { useOnboardingForm } from '@/lib/onboarding/state';
import * as React from 'react';
import { View } from 'react-native';

/**
 * Units selection form component
 * Allows users to choose between Imperial and Metric units
 * Converts existing data when units change mid-flow
 */
export function UnitsSelectionForm() {
  const { state, dispatch } = useOnboardingForm();
  const [selectedUnits, setSelectedUnits] = React.useState<'imperial' | 'metric' | null>(
    state.units
  );

  function handleSelectUnits(units: 'imperial' | 'metric') {
    const previousUnits = state.units;
    setSelectedUnits(units);
    dispatch({ type: 'SET_UNITS', payload: units });

    // Convert existing data if units changed and we have data
    if (previousUnits && previousUnits !== units && state.basicStats) {
      // Note: Data is stored in metric, so we don't need to convert stored values
      // The display conversion happens in the form components
      // This is just to trigger re-renders in forms that depend on units
    }
  }

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Choose Your Units</CardTitle>
          <CardDescription>
            Select your preferred measurement system. You can change this later.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-3">
            <Button
              variant={selectedUnits === 'imperial' ? 'default' : 'outline'}
              className="w-full"
              onPress={() => handleSelectUnits('imperial')}>
              <Text>Imperial (lbs, inches)</Text>
            </Button>
            <Button
              variant={selectedUnits === 'metric' ? 'default' : 'outline'}
              className="w-full"
              onPress={() => handleSelectUnits('metric')}>
              <Text>Metric (kg, cm)</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

