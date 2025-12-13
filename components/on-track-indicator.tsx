import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

export type OnTrackStatus = 'on_track' | 'close' | 'off_track' | 'unknown';

export function OnTrackIndicator({
  status,
  title = 'On track',
  detail,
  className,
}: {
  status: OnTrackStatus;
  title?: string;
  detail?: string;
  className?: string;
}) {
  const { dotClass, textClass, label } = statusToStyles(status);
  return (
    <View className={cn('flex-row items-start gap-3', className)}>
      <View className={cn('mt-1.5 h-2.5 w-2.5 rounded-full', dotClass)} />
      <View className="flex-1 gap-0.5">
        <Text className={cn('font-medium', textClass)}>
          {title}: {label}
        </Text>
        {detail ? <Text variant="muted">{detail}</Text> : null}
      </View>
    </View>
  );
}

function statusToStyles(status: OnTrackStatus) {
  switch (status) {
    case 'on_track':
      return { dotClass: 'bg-emerald-500', textClass: 'text-emerald-600', label: 'Yes' };
    case 'close':
      return { dotClass: 'bg-amber-500', textClass: 'text-amber-600', label: 'Close' };
    case 'off_track':
      return { dotClass: 'bg-rose-500', textClass: 'text-rose-600', label: 'No' };
    case 'unknown':
    default:
      return { dotClass: 'bg-muted-foreground/40', textClass: 'text-foreground', label: 'Not enough data' };
  }
}


