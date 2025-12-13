import type { ActivityLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './ui/text';

const OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'not_very_active', label: 'Not Very Active' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
];

export function ActivityLevelSelector({
  value,
  onChange,
}: {
  value: ActivityLevel;
  onChange: (next: ActivityLevel) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'rounded-full border px-3 py-2',
              selected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background active:bg-accent'
            )}>
            <Text className={cn('text-sm', selected ? 'text-primary' : 'text-foreground')}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


