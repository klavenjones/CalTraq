import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

export type FoodLogValues = {
  calories: number;
  protein: number;
};

export function FoodLogForm({
  title = 'Log food',
  submitLabel = 'Save',
  initialCalories,
  initialProtein,
  calorieTarget,
  proteinTarget,
  isSubmitting,
  onSubmit,
}: {
  title?: string;
  submitLabel?: string;
  initialCalories?: number;
  initialProtein?: number;
  calorieTarget?: number;
  proteinTarget?: number;
  isSubmitting?: boolean;
  onSubmit: (values: FoodLogValues) => void | Promise<void>;
}) {
  const [calories, setCalories] = React.useState(String(initialCalories ?? ''));
  const [protein, setProtein] = React.useState(String(initialProtein ?? ''));
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const cals = toNonNegativeNumber(calories);
    const prot = toNonNegativeNumber(protein);
    if (cals == null) return setError('Please enter calories.');
    if (prot == null) return setError('Please enter protein.');
    await onSubmit({ calories: cals, protein: prot });
  };

  const calsNum = toNonNegativeNumber(calories);
  const protNum = toNonNegativeNumber(protein);

  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {!!error && <Text className="text-sm text-destructive">{error}</Text>}
        {(calorieTarget != null || proteinTarget != null) && (
          <Text variant="muted">
            {calorieTarget != null
              ? `Calories: ${calsNum ?? 0}/${Math.round(calorieTarget)}`
              : 'Calories: —'}
            {'  •  '}
            {proteinTarget != null
              ? `Protein: ${protNum ?? 0}/${Math.round(proteinTarget)}g`
              : 'Protein: —'}
          </Text>
        )}
      </CardHeader>
      <CardContent className="gap-4">
        <View className="gap-2">
          <Label>Calories</Label>
          <Input
            value={calories}
            onChangeText={setCalories}
            keyboardType="number-pad"
            placeholder="e.g. 2100"
          />
        </View>

        <View className="gap-2">
          <Label>Protein (g)</Label>
          <Input
            value={protein}
            onChangeText={setProtein}
            keyboardType="number-pad"
            placeholder="e.g. 160"
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

function toNonNegativeNumber(s: string): number | null {
  const n = Number.parseFloat(s.trim());
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return Math.round(n);
}


