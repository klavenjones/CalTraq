import { SignUpForm } from '@/components/sign-up-form';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <SafeAreaView className="w-full max-w-sm">
        <SignUpForm />
      </SafeAreaView>
    </ScrollView>
  );
}
