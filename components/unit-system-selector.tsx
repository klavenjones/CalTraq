import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { UnitSystem } from '@/lib/units';
import * as React from 'react';
import { View } from 'react-native';

export function UnitSystemSelector({
  value,
  onChange,
  disabled,
}: {
  value: UnitSystem;
  onChange: (next: UnitSystem) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row gap-2">
      <Button
        className="flex-1"
        variant={value === 'metric' ? 'default' : 'outline'}
        disabled={disabled}
        onPress={() => onChange('metric')}>
        <Text>Metric</Text>
      </Button>
      <Button
        className="flex-1"
        variant={value === 'imperial' ? 'default' : 'outline'}
        disabled={disabled}
        onPress={() => onChange('imperial')}>
        <Text>Imperial</Text>
      </Button>
    </View>
  );
}


