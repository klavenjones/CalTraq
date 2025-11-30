# Quickstart – Get Started Screen

**Feature Branch**: `002-get-started-screen`  
**Spec**: `specs/002-get-started-screen/spec.md`

This quickstart explains how to run and test the CalTraq get started screen, which serves as the entry point for unauthenticated users.

---

## Prerequisites

- Node.js (v18+) and Yarn (or npm) installed.
- Expo CLI available (via `npx` or globally).
- A Clerk instance configured (see `specs/001-user-auth/quickstart.md` for setup).
- A Convex project initialized (see `specs/001-user-auth/quickstart.md` for setup).
- Local environment file (`.env.local`) configured with required keys.

---

## 1. Verify environment setup

Ensure your `.env.local` file contains:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

---

## 2. Install dependencies

From the repository root:

```bash
yarn install
```

---

## 3. Start development servers

In separate terminals:

**Terminal 1 - Convex:**
```bash
yarn dev:convex
```

**Terminal 2 - Expo:**
```bash
yarn dev:expo
```

Or use the combined command:
```bash
yarn dev
```

Then:
- Press `i` for iOS simulator (Mac), `a` for Android emulator, or `w` for Web.
- Or scan the Expo QR code with Expo Go on your physical device.

---

## 4. Exercise the get started screen

### 4.1. View as unauthenticated user

1. **Ensure you are signed out**:
   - If you're currently signed in, sign out from the app.
   - Or clear app data/reinstall to start fresh.

2. **Open the app**:
   - The get started screen should appear automatically when the app detects you're not authenticated.
   - You should see:
     - App logo (or "CalTraq" placeholder if logo fails to load)
     - Caption: "Log your Calories the Right Way"
     - "Get Started" button
     - "Already have an account? Sign In" text with clickable "Sign In" link

3. **Verify loading state**:
   - On app launch, you may briefly see a loading indicator (spinner) while authentication status is checked.
   - The get started screen should appear once unauthenticated status is confirmed.

### 4.2. Test navigation to sign-up

1. **Tap "Get Started" button**:
   - Should navigate to the sign-up screen (`/(auth)/sign-up`).
   - Verify the navigation is smooth and the sign-up screen loads correctly.

2. **Test rapid taps**:
   - Rapidly tap the "Get Started" button multiple times.
   - Navigation should handle this gracefully without creating duplicate navigation states.

### 4.3. Test navigation to sign-in

1. **Tap "Sign In" link**:
   - Within the "Already have an account? Sign In" text, tap the "Sign In" portion.
   - Should navigate to the sign-in screen (`/(auth)/sign-in`).
   - Verify only the "Sign In" text is clickable, not the entire "Already have an account?" phrase.

### 4.4. Verify authenticated user flow

1. **Sign in to the app**:
   - Complete the sign-in flow from the get started screen or directly.
   - Once authenticated, the get started screen should **not** be accessible.

2. **Open the app while authenticated**:
   - The app should redirect directly to the main app screen (`/index`).
   - The get started screen should not be shown.

### 4.5. Test edge cases

1. **Logo load failure**:
   - Simulate a logo load failure (if possible) or use a device with network issues.
   - Verify that placeholder text "CalTraq" appears styled to match app typography.

2. **Dark mode**:
   - Toggle dark mode (if available in your test environment).
   - Verify all text and UI elements are visible and maintain proper contrast.

3. **Different screen sizes**:
   - Test on different device sizes (phone, tablet) and orientations.
   - Verify the vertically centered layout adapts responsively.
   - Ensure no text truncation or overlapping elements.

4. **Accessibility**:
   - Enable screen reader (VoiceOver on iOS, TalkBack on Android).
   - Navigate through the screen and verify:
     - Button has appropriate label ("Get Started")
     - Link has appropriate label ("Sign In")
     - Focus order is logical (logo → caption → button → link)

---

## 5. Observability and troubleshooting

### Expected behavior

- **Loading state**: Brief spinner (<500ms typical) while auth status is checked.
- **Screen display**: All elements visible within 1 second on standard devices.
- **Navigation**: Smooth transitions to sign-up/sign-in screens.
- **Authentication guard**: Screen hidden when user is authenticated.

### Common issues

1. **Screen not appearing for unauthenticated users**:
   - Check that the screen is added to `Stack.Protected guard={!isAuthenticated}` in `app/_layout.tsx`.
   - Verify Clerk authentication is properly configured.

2. **Logo not loading**:
   - Check that logo asset exists in `assets/images/` directory.
   - Verify the asset path in the component code.
   - Fallback text "CalTraq" should appear if logo fails to load.

3. **Navigation not working**:
   - Verify Expo Router is properly configured.
   - Check that sign-up and sign-in routes exist at `(auth)/sign-up` and `(auth)/sign-in`.
   - Ensure navigation uses correct route paths.

4. **Dark mode issues**:
   - Verify Nativewind theme configuration.
   - Check that color classes use theme-aware colors (e.g., `text-foreground`, `bg-background`).

---

## 6. Next steps

- Add automated tests for:
  - Screen rendering with all elements
  - Navigation to sign-up and sign-in
  - Loading state during auth check
  - Logo error handling
  - Accessibility (screen reader labels, focus order)
- Verify performance metrics:
  - Screen load time < 1 second (SC-003)
  - 60fps during navigation transitions
- Test on physical devices across iOS, Android, and Web platforms.

