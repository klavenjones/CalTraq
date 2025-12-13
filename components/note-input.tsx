import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

export function NoteInput({
  title = 'Notes',
  submitLabel = 'Save note',
  initialNotes,
  isSubmitting,
  onSubmit,
}: {
  title?: string;
  submitLabel?: string;
  initialNotes?: string;
  isSubmitting?: boolean;
  onSubmit: (notes: string) => void | Promise<void>;
}) {
  const [notes, setNotes] = React.useState(initialNotes ?? '');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (notes.trim().length === 0) return setError('Please enter a note (or delete to clear).');
    await onSubmit(notes);
  };

  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {!!error && <Text className="text-sm text-destructive">{error}</Text>}
      </CardHeader>
      <CardContent className="gap-4">
        <View className="gap-2">
          <Label>Today</Label>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Great workout, low appetite today."
            multiline
            className="h-24 py-3"
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


