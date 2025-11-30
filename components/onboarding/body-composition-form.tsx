import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { calculateBodyFat, calculateLeanBodyMass } from '@/lib/calculations/body-fat';
import { convertCmToIn } from '@/lib/calculations/unit-conversion';
import { useOnboardingForm } from '@/lib/onboarding/state';
import { bodyCompositionSchema, type BodyComposition } from '@/lib/validation/onboarding';
import * as React from 'react';
import { View } from 'react-native';

interface BodyCompositionFormProps {
  onSubmit?: (data: BodyComposition) => void;
}

/**
 * Body composition form component
 * Collects neck, waist, and optional hip measurements for body fat calculation
 */
export function BodyCompositionForm({ onSubmit }: BodyCompositionFormProps) {
  const { state, dispatch } = useOnboardingForm();
  const [neck, setNeck] = React.useState('');
  const [waist, setWaist] = React.useState('');
  const [hip, setHip] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isImperial = state.units === 'imperial';
  const isFemale = state.basicStats?.gender === 'female';

  // Convert stored metric values to display units
  React.useEffect(() => {
    if (state.bodyComposition) {
      const comp = state.bodyComposition;
      if (isImperial) {
        setNeck(convertCmToIn(comp.neckCircumference).toString());
        setWaist(convertCmToIn(comp.waistCircumference).toString());
        if (comp.hipCircumference) {
          setHip(convertCmToIn(comp.hipCircumference).toString());
        }
      } else {
        setNeck(comp.neckCircumference.toString());
        setWaist(comp.waistCircumference.toString());
        if (comp.hipCircumference) {
          setHip(comp.hipCircumference.toString());
        }
      }
    }
  }, [state.bodyComposition, isImperial]);

  function handleSubmit() {
    const numNeck = neck ? parseFloat(neck) : null;
    const numWaist = waist ? parseFloat(waist) : null;
    const numHip = hip ? parseFloat(hip) : null;

    if (!numNeck || !numWaist || (isFemale && !numHip)) {
      setErrors({ general: 'Please fill in all required measurements' });
      return;
    }

    // Convert to metric for storage
    const neckCm = isImperial ? numNeck * 2.54 : numNeck;
    const waistCm = isImperial ? numWaist * 2.54 : numWaist;
    const hipCm = numHip ? (isImperial ? numHip * 2.54 : numHip) : undefined;

    const formData: BodyComposition = {
      neckCircumference: neckCm,
      waistCircumference: waistCm,
      hipCircumference: hipCm,
    };

    try {
      bodyCompositionSchema.parse(formData);
      setErrors({});
      dispatch({ type: 'SET_BODY_COMPOSITION', payload: formData });
      dispatch({ type: 'SET_BODY_COMPOSITION_METHOD', payload: 'calculated' });

      // Calculate body fat and lean body mass
      if (state.basicStats) {
        const bodyFat = calculateBodyFat(
          state.basicStats.gender,
          state.basicStats.height,
          neckCm,
          waistCm,
          hipCm
        );
        const leanBodyMass = calculateLeanBodyMass(state.basicStats.weight, bodyFat);

        dispatch({ type: 'SET_CALCULATED_BODY_FAT', payload: bodyFat });
        dispatch({ type: 'SET_CALCULATED_LEAN_BODY_MASS', payload: leanBodyMass });
      }

      onSubmit?.(formData);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    }
  }

  // Auto-submit when form is valid (for better UX)
  React.useEffect(() => {
    if (neck && waist && (!isFemale || hip)) {
      handleSubmit();
    }
  }, [neck, waist, hip]);

  return (
    <View className="gap-4">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
          <CardDescription>
            We&apos;ll use these measurements to calculate your body fat percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="gap-1.5">
            <Label htmlFor="neck">Neck ({isImperial ? 'inches' : 'cm'})</Label>
            <Input
              id="neck"
              placeholder={isImperial ? '15' : '38'}
              keyboardType="numeric"
              value={neck}
              onChangeText={setNeck}
            />
          </View>

          <View className="gap-1.5">
            <Label htmlFor="waist">Waist ({isImperial ? 'inches' : 'cm'})</Label>
            <Input
              id="waist"
              placeholder={isImperial ? '32' : '81'}
              keyboardType="numeric"
              value={waist}
              onChangeText={setWaist}
            />
          </View>

          {isFemale && (
            <View className="gap-1.5">
              <Label htmlFor="hip">Hip ({isImperial ? 'inches' : 'cm'})</Label>
              <Input
                id="hip"
                placeholder={isImperial ? '36' : '91'}
                keyboardType="numeric"
                value={hip}
                onChangeText={setHip}
              />
            </View>
          )}

          {errors.general && (
            <Text className="text-sm font-medium text-destructive">{errors.general}</Text>
          )}
        </CardContent>
      </Card>
    </View>
  );
}

