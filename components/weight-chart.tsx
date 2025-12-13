import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export type TrendLog = { date: string; weight?: number; calories?: number; protein?: number };

export function WeightChart({
  logs,
  className,
  title = 'Weight',
}: {
  logs: TrendLog[];
  className?: string;
  title?: string;
}) {
  const { width } = useWindowDimensions();
  const series = logs
    .filter((l) => typeof l.weight === 'number' && Number.isFinite(l.weight))
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
  const data = series.map((l) => l.weight as number);

  return (
    <View className={cn('gap-2', className)}>
      <Text className="text-sm font-medium">{title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
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
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // indigo-ish
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


