# CalTraq

A nutrition tracking mobile app built with [React Native](https://reactnative.dev), [Expo](https://expo.dev), [Clerk](https://go.clerk.com/gjgxNgT) (authentication), [Convex](https://convex.dev) (backend), and [React Native Reusables](https://reactnativereusables.com) (UI).

## Architecture Overview

### Authentication & Data Persistence

CalTraq uses a dual-provider architecture for authentication and data persistence:

- **Clerk**: Handles user identity, credentials, and SSO (Apple/Google). Manages sign-up, sign-in, password recovery, and session management.
- **Convex**: Stores application-specific user data (`UserAccount` records) keyed by Clerk user IDs. Provides real-time data sync and serverless functions.

This separation keeps authentication concerns in Clerk while allowing application data to evolve independently in Convex.

For detailed setup and testing instructions, see: [`specs/001-user-auth/quickstart.md`](specs/001-user-auth/quickstart.md)

## Getting Started

### Prerequisites

1. **Clerk Setup**:
   - [Create a Clerk account](https://go.clerk.com/blVsQlm)
   - Enable Email/Password authentication
   - Enable Apple and Google as SSO Connections (optional)
   - Create a JWT template named `convex` for Convex integration

2. **Convex Setup**:
   - [Create a Convex account](https://convex.dev)
   - Create a new project for CalTraq

3. **Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Add your `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from [Clerk API keys](https://go.clerk.com/u8KAui7)
   - Add your `EXPO_PUBLIC_CONVEX_URL` from Convex Dashboard
   - Add your `CLERK_JWT_ISSUER_DOMAIN` for Convex auth config

### Running the App

```bash
# Install dependencies
yarn install

# Start Convex development server (in one terminal)
npx convex dev

# Start Expo development server (in another terminal)
yarn dev:expo

# Or run both together
yarn dev
```

This will launch the Expo Go Server. You can open the app with:

- **iOS**: press `i` to launch in the iOS simulator (Mac only)
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

Or scan the QR code with the [Expo Go](https://expo.dev/go) app to test on your device.

## Included Screens and Features

- Protected routes using Clerk authentication
- Sign in screen
- OAuth with Apple, GitHub, and Google
- Forgot password screen
- Reset password screen
- Verify email screen
- User profile button
- Sign out screen

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🔐 Authentication powered by [Clerk](https://go.clerk.com/Q1MKAz0)
- 💾 Backend powered by [Convex](https://convex.dev) with real-time sync
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Project Structure

```
CalTraq/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens (sign-in, sign-up, etc.)
│   └── index.tsx          # Main app screen (protected)
├── components/            # Reusable UI components
│   ├── ui/               # React Native Reusables primitives
│   └── *-form.tsx        # Auth form components
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema (UserAccount, RecoveryRequest)
│   ├── auth.ts           # Auth-related functions
│   └── auth.config.ts    # Clerk integration config
├── lib/                  # Shared utilities
│   ├── clerk/auth.ts     # Clerk helper hooks
│   └── convex/auth.ts    # Convex auth hooks
└── tests/                # Test files
    ├── auth/             # Unit tests for auth components
    └── e2e/              # End-to-end auth flow tests
```

## Learn More

- [Clerk Docs](https://go.clerk.com/Q1MKAz0)
- [Convex Docs](https://docs.convex.dev)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

---

If this template helps you move faster, consider giving [React Native Reusables](https://github.com/founded-labs/react-native-reusables) a ⭐ on GitHub. It helps a lot!
