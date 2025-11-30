/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|@rn-primitives/.*|class-variance-authority|clsx|tailwind-merge|lucide-react-native|convex)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'convex/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/_generated/**',
  ],
  testEnvironment: 'jsdom',
};
