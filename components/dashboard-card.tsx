import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

export function DashboardCard({
  title,
  value,
  subtitle,
  className,
  children,
}: {
  title: string;
  value?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn('mx-4', className)}>
      <CardHeader className="gap-1">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {value != null && <Text className="text-2xl font-semibold">{value}</Text>}
        {subtitle != null && <Text variant="muted">{subtitle}</Text>}
      </CardHeader>
      {children ? (
        <CardContent>
          <View className="gap-3">{children}</View>
        </CardContent>
      ) : null}
    </Card>
  );
}


