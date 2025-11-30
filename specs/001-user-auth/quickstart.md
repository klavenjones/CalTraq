# Quickstart – Caltraq User Accounts and Authentication

**Feature Branch**: `001-user-auth`  
**Spec**: `specs/001-user-auth/spec.md`

This quickstart explains how to run and exercise the Caltraq user accounts and authentication
feature using Clerk for identity and Convex for persistent user account records.

---

## Prerequisites

- Node.js (v18+) and Yarn (or npm) installed.
- Expo CLI available (via `npx` or globally).
- A Clerk instance configured with:
  - Email/password authentication enabled
  - Apple and Google sign-in enabled (optional but recommended)
  - JWT template named "convex" configured for Convex integration
- A Convex project created for Caltraq at [convex.dev](https://convex.dev).
- Local environment file (`.env.local`) configured with required keys.

---

## 1. Configure environment variables

1. Copy `.env.example` to `.env.local` at the project root (if available), or create `.env.local`.
2. Add the following required environment variables:

```bash
# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx  # From Clerk Dashboard > API Keys

# Convex Configuration  
EXPO_PUBLIC_CONVEX_URL=https://xxx.convex.cloud  # From Convex Dashboard

# Convex Server-side (for auth.config.ts)
CLERK_JWT_ISSUER_DOMAIN=https://xxx.clerk.accounts.dev  # Your Clerk JWT issuer domain
```

3. **Important**: Restart the Expo dev server after changing environment variables.

### Setting up Clerk + Convex Integration

1. In your Clerk Dashboard, go to **JWT Templates**.
2. Create a new template named `convex`.
3. Configure it to include the claims Convex needs for authentication.
4. Copy the **Issuer URL** (e.g., `https://clerk.xxx.accounts.dev`) to `CLERK_JWT_ISSUER_DOMAIN`.

---

## 2. Install dependencies

From the repository root:

```bash
yarn install
```

---

## 3. Initialize Convex

Before running the app, initialize Convex:

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex (if not already logged in)
- Create the `convex/_generated/` directory with TypeScript types
- Start the Convex development server
- Push your schema and functions to Convex

Keep this terminal running while developing.

---

## 4. Run the app

In a separate terminal, from the repository root:

```bash
yarn dev:expo
```

Or use the combined command that runs both Convex and Expo:

```bash
yarn dev
```

Then:

- Press `i` for iOS simulator (Mac), `a` for Android emulator, or `w` for Web.
- Or scan the Expo QR code with Expo Go on your physical device.

---

## 5. Exercise key flows

1. **Create account (P1)**
   - Open the sign-up flow in the app.
   - Complete the required fields and create an account with email/password.
   - Verify that you are signed in and see account-only screens.

2. **Sign in and out (P2)**
   - Sign out from the app.
   - Sign in again using:
     - Email/password, and
     - Apple or Google sign-in (once configured in Clerk).
   - Confirm that protected screens are accessible only when signed in.

3. **Recovery (P3)**
   - From the sign-in screen, start the “forgot password” or equivalent recovery flow.
   - Complete the flow and verify you regain access to the same account data.

4. **Cross-device consistency**
   - Sign in on a second device or platform (for example, Web or another simulator).
   - Confirm that your account is recognized and that any visible account metadata is consistent.

---

## 6. Observability and troubleshooting

- Watch the development logs (Metro bundler / Expo CLI output) for any auth-related errors.
- For Convex:
  - Verify that UserAccount records are being created/updated when users sign up or sign in.
- For Clerk:
  - Confirm that new users appear in the Clerk dashboard and that sign-in events look correct.

If sign-in or account creation fails, check:

- Environment variables for Clerk and Convex.
- Network connectivity from the device or simulator to the auth and data services.

---

## 7. Next steps

- Add automated tests for:
  - Successful sign-up and sign-in.
  - Handling invalid credentials.
  - Basic recovery flow behavior.
- Extend the data model and Convex usage to include Katch–McArdle settings, logs, and goals
  linked to the UserAccount entity.
