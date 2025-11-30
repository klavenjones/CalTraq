import { SignInForm } from '@/components/sign-in-form';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <SafeAreaView className="w-full max-w-sm">
        <SignInForm />
      </SafeAreaView>
    </ScrollView>
  );
}
