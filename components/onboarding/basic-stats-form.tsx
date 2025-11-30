import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { convertCmToIn, convertKgToLb } from '@/lib/calculations/unit-conversion';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { basicStatsSchema, type BasicStats } from '@/lib/validation/onboarding';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

interface BasicStatsFormProps {
  onSubmit?: (data: BasicStats) => void;
}

/**
 * Basic stats form component
 * Collects height, weight, gender, age, and optional body fat percentage
 * Displays values in user's selected unit system
 */
export function BasicStatsForm({ onSubmit }: BasicStatsFormProps) {
  const { state, dispatch } = useOnboardingForm();
  const [height, setHeight] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [gender, setGender] = React.useState<'male' | 'female' | 'other' | ''>('');
  const [age, setAge] = React.useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isImperial = state.units === 'imperial';

  // Convert display values to metric for storage
  function getMetricHeight(): number | null {
    if (!height) return null;
    const numHeight = parseFloat(height);
    if (isNaN(numHeight)) return null;
    return isImperial ? numHeight * 2.54 : numHeight; // inches to cm
  }

  function getMetricWeight(): number | null {
    if (!weight) return null;
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return null;
    return isImperial ? numWeight / 2.20462 : numWeight; // lbs to kg
  }

  // Convert stored metric values to display units
  React.useEffect(() => {
    if (state.basicStats) {
      const stats = state.basicStats;
      if (isImperial) {
        setHeight(convertCmToIn(stats.height).toString());
        setWeight(convertKgToLb(stats.weight).toString());
      } else {
        setHeight(stats.height.toString());
        setWeight(stats.weight.toString());
      }
      setGender(stats.gender);
      setAge(stats.age.toString());
      if (stats.bodyFatPercentage) {
        setBodyFatPercentage(stats.bodyFatPercentage.toString());
      }
    }
  }, [state.basicStats, isImperial]);

  function handleCalculateForMe() {
    router.push('/(onboarding)/body-composition');
  }

  function handleSubmit() {
    const metricHeight = getMetricHeight();
    const metricWeight = getMetricWeight();
    const numAge = age ? parseInt(age, 10) : null;
    const numBodyFat = bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined;

    if (!metricHeight || !metricWeight || !numAge || !gender) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    const formData: BasicStats = {
      height: metricHeight,
      weight: metricWeight,
      gender: gender as 'male' | 'female' | 'other',
      age: numAge,
      bodyFatPercentage: numBodyFat,
    };

    try {
      basicStatsSchema.parse(formData);
      setErrors({});
      dispatch({ type: 'SET_BASIC_STATS', payload: formData });
      if (numBodyFat !== undefined) {
        dispatch({ type: 'SET_BODY_COMPOSITION_METHOD', payload: 'manual' });
      }
      onSubmit?.(formData);
    } catch (error: any) {
      // Handle Zod validation errors with field-specific messages
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const path = err.path[0];
          if (path === 'height') {
            fieldErrors.height = 'Height must be between 30-300 cm (1-10 feet)';
          } else if (path === 'weight') {
            fieldErrors.weight = 'Weight must be between 20-500 kg (44-1100 lbs)';
          } else if (path === 'age') {
            fieldErrors.general = 'Age must be between 13-120 years';
          } else if (path === 'bodyFatPercentage') {
            fieldErrors.general = 'Body fat percentage must be between 0-50%';
          } else {
            fieldErrors.general = err.message || 'Please check your input values';
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Please check your input values' });
      }
    }
  }

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-1.5">
            <Label htmlFor="height" nativeID="height-label">
              Height ({isImperial ? 'inches' : 'cm'})
            </Label>
            <Input
              id="height"
              aria-labelledby="height-label"
              accessibilityLabel={`Height in ${isImperial ? 'inches' : 'centimeters'}`}
              placeholder={isImperial ? '70' : '178'}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
            {errors.height && (
              <Text className="text-sm font-medium text-destructive">{errors.height}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Label htmlFor="weight" nativeID="weight-label">
              Weight ({isImperial ? 'lbs' : 'kg'})
            </Label>
            <Input
              id="weight"
              aria-labelledby="weight-label"
              accessibilityLabel={`Weight in ${isImperial ? 'pounds' : 'kilograms'}`}
              placeholder={isImperial ? '160' : '73'}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            {errors.weight && (
              <Text className="text-sm font-medium text-destructive">{errors.weight}</Text>
            )}
          </View>

          <View className="gap-1.5">
            <Label htmlFor="gender">Gender</Label>
            <View className="flex-row gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <Button
                  key={g}
                  variant={gender === g ? 'default' : 'outline'}
                  className="flex-1"
                  onPress={() => setGender(g)}>
                  <Text className="capitalize">{g}</Text>
                </Button>
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              placeholder="30"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="bodyFat">Body Fat % (Optional)</Label>
            <Input
              id="bodyFat"
              placeholder="15"
              keyboardType="numeric"
              value={bodyFatPercentage}
              onChangeText={setBodyFatPercentage}
            />
            <Text className="text-xs text-muted-foreground">
              If you don&apos;t know, we can calculate it for you
            </Text>
          </View>

          {!bodyFatPercentage && (
            <Button variant="outline" onPress={handleCalculateForMe}>
              <Text>Calculate for me</Text>
            </Button>
          )}

          {errors.general && (
            <Text className="text-sm font-medium text-destructive">{errors.general}</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );
}
