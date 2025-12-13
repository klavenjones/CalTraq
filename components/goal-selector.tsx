import type { Goal } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './ui/text';

const OPTIONS: Array<{ value: Goal; label: string; helper: string }> = [
  { value: 'lose', label: 'Lose', helper: 'Cut calories' },
  { value: 'maintain', label: 'Maintain', helper: 'Hold steady' },
  { value: 'gain', label: 'Gain', helper: 'Surplus calories' },
];

export function GoalSelector({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-xl border p-3',
              selected ? 'border-primary bg-primary/10' : 'border-border bg-background active:bg-accent'
            )}>
            <Text className={cn('font-medium', selected ? 'text-primary' : 'text-foreground')}>
              {opt.label}
            </Text>
            <Text variant="muted" className={cn(selected ? 'text-primary/80' : undefined)}>
              {opt.helper}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


