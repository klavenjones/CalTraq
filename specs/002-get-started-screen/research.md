# Research: Get Started Screen

**Feature**: Get Started Screen  
**Date**: 2025-01-27  
**Status**: Complete

## Research Questions & Findings

### 1. Expo Router Authentication Guard Integration

**Question**: How to properly integrate a new unauthenticated screen into the existing Expo Router auth guard system?

**Decision**: Use `Stack.Protected` with `guard={!isAuthenticated}` in `app/_layout.tsx`, following the existing pattern for auth screens.

**Rationale**: 
- The existing codebase already uses this pattern in `app/_layout.tsx` (lines 85-90)
- `Stack.Protected` is the Expo Router v6 way to conditionally show screens based on authentication state
- The guard uses `isAuthenticated` from `useConvexAuth()` which integrates Clerk authentication
- This ensures the screen is only accessible when `!isAuthenticated` is true

**Implementation Notes**:
- Add `<Stack.Screen name="get-started" />` inside the `Stack.Protected guard={!isAuthenticated}` block
- The screen will automatically be hidden when user is authenticated
- No additional routing logic needed

**Alternatives Considered**:
- Manual navigation guards in the screen component - rejected because Expo Router's `Stack.Protected` is more declarative and handles edge cases better
- Separate route group - rejected because it would complicate the routing structure unnecessarily

---

### 2. Logo Loading with Error Handling

**Question**: How to load the app logo with proper error handling and fallback to placeholder text?

**Decision**: Use React Native's `Image` component with `onError` handler and conditional rendering for fallback text.

**Rationale**:
- The codebase already uses `Image` component with `require()` for local assets (see `app/index.tsx` lines 13-16)
- React Native's `Image` component supports `onError` callback for handling load failures
- Conditional rendering allows switching between image and text fallback seamlessly
- The placeholder text "CalTraq" should use the existing `Text` component with appropriate styling

**Implementation Notes**:
- Use `require('@/assets/images/icon.png')` for the logo (or create a dedicated logo asset)
- Add state to track image load error: `const [logoError, setLogoError] = React.useState(false)`
- Use `onError={() => setLogoError(true)}` on the Image component
- Conditionally render `<Image>` or `<Text variant="h1">CalTraq</Text>` based on `logoError`
- Support dark mode by checking `useColorScheme()` if different logo assets are needed

**Alternatives Considered**:
- Using `expo-image` - rejected because the codebase currently uses React Native's `Image` component and switching would require additional dependency
- Always showing placeholder text - rejected because the spec requires showing the logo when available

---

### 3. Accessibility Implementation

**Question**: How to implement basic accessibility (screen reader labels, focus order, contrast) for the get started screen?

**Decision**: Use React Native's built-in accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) and ensure proper semantic structure.

**Rationale**:
- React Native provides comprehensive accessibility APIs that work across iOS, Android, and Web
- The existing `Text` component already supports accessibility roles (see `components/ui/text.tsx` lines 49-63)
- React Native Reusables Button component should already include accessibility support
- Nativewind/Tailwind color system ensures sufficient contrast when using theme colors

**Implementation Notes**:
- Add `accessibilityLabel="Get Started"` to the button
- Add `accessibilityRole="button"` to the button (if not already set by Button component)
- For the "Sign In" link, use `accessibilityLabel="Sign In"` and `accessibilityRole="link"`
- Wrap the "Already have an account?" text in a `Text` component with appropriate accessibility props
- Ensure focus order: logo → caption → button → link (natural top-to-bottom order)
- Use theme colors from Nativewind to ensure contrast (e.g., `text-foreground` for text, `bg-primary` for button)

**Alternatives Considered**:
- Using a dedicated accessibility library - rejected because React Native's built-in props are sufficient for basic accessibility requirements
- Skipping accessibility - rejected because it's a constitutional requirement (Principle 5)

---

### 4. Loading State During Authentication Check

**Question**: How to display a loading indicator while checking authentication status before showing the get started screen?

**Decision**: Use the existing `isLoaded` state from Clerk's `useAuth()` hook and show `ActivityIndicator` when `!isLoaded`.

**Rationale**:
- The existing `app/_layout.tsx` already uses this pattern (lines 68-80)
- Clerk's `useAuth()` hook provides `isLoaded` which indicates when auth state has been determined
- React Native's `ActivityIndicator` is the standard loading component (already used in `app/index.tsx` line 49)
- This ensures users see a loading state during the brief moment when auth status is being checked

**Implementation Notes**:
- In the get started screen component, use `const { isLoaded } = useAuth()` from `@clerk/clerk-expo`
- Show `<ActivityIndicator size="large" />` centered on screen when `!isLoaded`
- Once `isLoaded` is true, check `isAuthenticated` - if false, show the get started screen
- The `Stack.Protected` guard will handle redirecting authenticated users automatically

**Alternatives Considered**:
- Using Convex's `useConvexAuth()` - rejected because Clerk's `isLoaded` is more reliable for initial auth state check
- No loading state - rejected because the spec explicitly requires it (FR-011)

---

### 5. Navigation to Sign-Up and Sign-In Screens

**Question**: How to navigate from the get started screen to existing sign-up and sign-in screens?

**Decision**: Use Expo Router's `Link` component or `useRouter()` hook for navigation.

**Rationale**:
- Expo Router provides type-safe navigation via `Link` component and `useRouter()` hook
- The existing screens are at `(auth)/sign-up` and `(auth)/sign-in` routes
- `Link` is preferred for declarative navigation, `useRouter()` for programmatic navigation
- The codebase already uses both patterns (see `app/index.tsx` line 7 for Link import)

**Implementation Notes**:
- For the "Get Started" button: Use `useRouter()` with `router.push('/(auth)/sign-up')` in `onPress`
- For the "Sign In" link: Use `Link href="/(auth)/sign-in"` component wrapping the "Sign In" text
- Ensure navigation handles rapid taps gracefully (button should be disabled during navigation or use debouncing)

**Alternatives Considered**:
- Using React Navigation directly - rejected because Expo Router is the project standard
- Deep linking URLs - rejected because internal navigation doesn't require deep links

---

## Technology Choices Summary

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Navigation | Expo Router `Link` / `useRouter()` | Project standard, type-safe |
| Image Loading | React Native `Image` | Already used in codebase, supports error handling |
| Loading Indicator | React Native `ActivityIndicator` | Standard, already used in codebase |
| Styling | Nativewind (Tailwind) | Project standard, supports dark mode |
| UI Components | React Native Reusables | Project standard (Button, Text) |
| Auth State | Clerk `useAuth()` | Already integrated, provides `isLoaded` |
| Accessibility | React Native accessibility props | Built-in, cross-platform support |

## Open Questions Resolved

All technical questions have been resolved. The implementation approach is clear and follows existing codebase patterns.

