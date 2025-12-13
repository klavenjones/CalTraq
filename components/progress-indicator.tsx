import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

export function ProgressIndicator({
  label,
  current,
  target,
  unit,
  className,
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  className?: string;
}) {
  const safeTarget = target <= 0 ? 1 : target;
  const pct = clamp(current / safeTarget, 0, 1);

  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-sm">
          {Math.round(current)}/{Math.round(target)}
          {unit ? unit : ''}
        </Text>
      </View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <View className="h-full rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
      </View>
    </View>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}


