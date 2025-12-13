import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { TrendLog } from './weight-chart';

export function ProteinChart({
  logs,
  targetProtein,
  className,
  title = 'Protein',
}: {
  logs: TrendLog[];
  targetProtein?: number;
  className?: string;
  title?: string;
}) {
  const { width } = useWindowDimensions();
  const series = logs
    .filter((l) => typeof l.protein === 'number' && Number.isFinite(l.protein))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (series.length < 2) {
    return (
      <View className={cn('gap-2', className)}>
        <Text className="text-sm font-medium">{title}</Text>
        <Text variant="muted">Not enough data yet.</Text>
      </View>
    );
  }

  const labels = series.map((l) => l.date.slice(5));
  const data = series.map((l) => l.protein as number);

  const datasets = [{ data }];
  if (typeof targetProtein === 'number' && Number.isFinite(targetProtein)) {
    datasets.push({ data: data.map(() => targetProtein) });
  }

  return (
    <View className={cn('gap-2', className)}>
      <Text className="text-sm font-medium">{title}</Text>
      <LineChart
        data={{ labels, datasets }}
        width={Math.max(320, width - 32)}
        height={220}
        withInnerLines={false}
        withOuterLines={false}
        withDots
        bezier
        chartConfig={chartConfig}
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#0b0b0d',
  backgroundGradientTo: '#0b0b0d',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // blue
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForBackgroundLines: {
    stroke: 'rgba(255,255,255,0.06)',
  },
  propsForDots: {
    r: '3',
    strokeWidth: '2',
    stroke: '#0b0b0d',
  },
};


