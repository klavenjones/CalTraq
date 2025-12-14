import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import type { UnitSystem } from '@/lib/units';
import { kgToLbs, lbsToKg, roundTo1 } from '@/lib/units';
import * as React from 'react';
import { View } from 'react-native';

export type WeightLogValues = { weightKg: number };

export function WeightLogForm({
  title = 'Log weight',
  submitLabel = 'Save',
  initialWeightKg,
  isSubmitting,
  onSubmit,
  unitSystem = 'metric',
}: {
  title?: string;
  submitLabel?: string;
  initialWeightKg?: number;
  isSubmitting?: boolean;
  onSubmit: (values: WeightLogValues) => void | Promise<void>;
  unitSystem?: UnitSystem;
}) {
  const [weight, setWeight] = React.useState(() => {
    if (typeof initialWeightKg !== 'number') return '';
    return unitSystem === 'imperial' ? String(roundTo1(kgToLbs(initialWeightKg))) : String(roundTo1(initialWeightKg));
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof initialWeightKg !== 'number') return;
    setWeight(unitSystem === 'imperial' ? String(roundTo1(kgToLbs(initialWeightKg))) : String(roundTo1(initialWeightKg)));
  }, [initialWeightKg, unitSystem]);

  const handleSubmit = async () => {
    setError(null);
    const w = toPositiveNumber(weight);
    if (w == null) return setError('Please enter a valid weight.');
    const weightKg = unitSystem === 'imperial' ? roundTo1(lbsToKg(w)) : roundTo1(w);
    await onSubmit({ weightKg });
  };

  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {!!error && <Text className="text-sm text-destructive">{error}</Text>}
      </CardHeader>
      <CardContent className="gap-4">
        <View className="gap-2">
          <Label>{unitSystem === 'imperial' ? 'Weight (lb)' : 'Weight (kg)'}</Label>
          <Input
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder={unitSystem === 'imperial' ? 'e.g. 180' : 'e.g. 82.5'}
          />
        </View>
      </CardContent>
      <CardFooter>
        <Button onPress={handleSubmit} disabled={isSubmitting} className="w-full">
          <Text>{submitLabel}</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

function toPositiveNumber(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  // keep 1 decimal for weigh-ins
  return Math.round(n * 10) / 10;
}


