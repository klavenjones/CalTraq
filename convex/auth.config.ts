/**
 * Convex authentication configuration for Clerk integration
 *
 * This file configures Convex to use Clerk as the identity provider,
 * allowing Convex functions to authenticate users via Clerk-issued JWTs.
 */
export default {
  providers: [
    {
      // The Clerk JWT issuer domain from environment variables
      domain: process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN!,
      // Application ID for the Convex JWT template in Clerk
      applicationID: 'convex',
    },
  ],
};

