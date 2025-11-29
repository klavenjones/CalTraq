# Quickstart – Caltraq User Accounts and Authentication

**Feature Branch**: `001-user-auth`  
**Spec**: `specs/001-user-auth/spec.md`

This quickstart explains how to run and exercise the Caltraq user accounts and authentication
feature using Clerk for identity and Convex for persistent user account records.

---

## Prerequisites

- Node.js and Yarn (or your preferred package manager) installed.
- Expo CLI available (via `npx` or globally).
- A Clerk instance configured with:
  - Email/password authentication
  - Apple and Google sign-in enabled
- A Convex project created for Caltraq.
- Local environment file (`.env.local`) configured with the required Clerk and Convex keys.

---

## 1. Configure environment variables

1. Ensure `.env.local` exists at the project root.
2. Add or confirm the following keys (names are illustrative; align with your existing setup):
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Convex-related keys required by the Convex client and server configuration
3. Restart the Expo dev server after changing environment variables.

---

## 2. Run the app

From the repository root:

```bash
yarn dev
```

Then:

- Press `i` for iOS simulator (Mac), `a` for Android emulator, or `w` for Web.
- Or scan the Expo QR code with Expo Go.

---

## 3. Exercise key flows

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

## 4. Observability and troubleshooting

- Watch the development logs (Metro bundler / Expo CLI output) for any auth-related errors.
- For Convex:
  - Verify that UserAccount records are being created/updated when users sign up or sign in.
- For Clerk:
  - Confirm that new users appear in the Clerk dashboard and that sign-in events look correct.

If sign-in or account creation fails, check:

- Environment variables for Clerk and Convex.
- Network connectivity from the device or simulator to the auth and data services.

---

## 5. Next steps

- Add automated tests for:
  - Successful sign-up and sign-in.
  - Handling invalid credentials.
  - Basic recovery flow behavior.
- Extend the data model and Convex usage to include Katch–McArdle settings, logs, and goals
  linked to the UserAccount entity.
