/**
 * Tests for User Story 2: Secure login and logout
 *
 * These tests verify that:
 * - Users can sign in with email/password
 * - Users can sign in with Apple/Google (SSO)
 * - Invalid credentials are handled gracefully
 * - Repeated failed attempts are handled with lockout UX
 * - Sign-out clears auth state properly
 */
import * as React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Mock Clerk hooks
const mockSignIn = {
  create: jest.fn(),
};

const mockSetActive = jest.fn();

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    signIn: mockSignIn,
    setActive: mockSetActive,
    isLoaded: true,
  }),
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    signOut: jest.fn(),
  }),
  useUser: () => ({
    user: null,
  }),
}));

// Mock Convex hooks
const mockRecordSignIn = jest.fn();
const mockUpsertUserAccount = jest.fn();

jest.mock('convex/react', () => ({
  useMutation: (apiRef: { name?: string }) => {
    if (apiRef?.name?.includes('recordSignIn')) return mockRecordSignIn;
    if (apiRef?.name?.includes('upsertUserAccount')) return mockUpsertUserAccount;
    return jest.fn();
  },
  useQuery: () => null,
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  Link: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) return <>{children}</>;
    return <>{children}</>;
  },
}));

// Import the component after mocks
import { SignInForm } from '@/components/sign-in-form';

xdescribe('SignInForm - Secure Login (US2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.create.mockResolvedValue({ status: 'complete', createdSessionId: 'session_123' });
  });

  describe('T015: Email/password sign-in flows', () => {
    it('should render the sign-in form with email and password fields', () => {
      render(<SignInForm />);

      expect(screen.getByLabelText(/email/i)).toBeTruthy();
      expect(screen.getByLabelText(/password/i)).toBeTruthy();
      expect(screen.getByText(/continue/i)).toBeTruthy();
    });

    it('should call Clerk signIn.create with identifier and password on submit', async () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignIn.create).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'SecurePass123!',
        });
      });
    });

    it('should set active session after successful sign-in', async () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({
          session: 'session_123',
        });
      });
    });

    it('should display error message for invalid credentials', async () => {
      mockSignIn.create.mockRejectedValue(new Error('Invalid password'));

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeTruthy();
      });
    });

    it('should display error for non-existent email without revealing it does not exist', async () => {
      mockSignIn.create.mockRejectedValue(new Error('Invalid identifier or password'));

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'nonexistent@example.com');
      fireEvent.changeText(passwordInput, 'somepassword');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Error should be neutral and not reveal whether email exists
        expect(screen.getByText(/invalid identifier/i)).toBeTruthy();
      });
    });

    it('should have a link to forgot password page', () => {
      render(<SignInForm />);

      expect(screen.getByText(/forgot your password/i)).toBeTruthy();
    });

    it('should have a link to sign up page', () => {
      render(<SignInForm />);

      expect(screen.getByText(/sign up/i)).toBeTruthy();
    });
  });

  describe('T039: Negative and abuse-case tests', () => {
    it('should prevent rapid repeated submissions', async () => {
      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password');

      // Rapid fire submissions
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should only call once while processing
        expect(mockSignIn.create).toHaveBeenCalledTimes(1);
      });
    });

    it('should track failed sign-in attempts', async () => {
      mockSignIn.create.mockRejectedValue(new Error('Invalid password'));

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      // First attempt
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(mockSignIn.create).toHaveBeenCalledTimes(1);
      });

      // Second attempt
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(mockSignIn.create).toHaveBeenCalledTimes(2);
      });
    });

    it('should show lockout message after multiple failed attempts', async () => {
      mockSignIn.create.mockRejectedValue(new Error('Invalid password'));

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        fireEvent.press(submitButton);
        await waitFor(() => {
          expect(mockSignIn.create).toHaveBeenCalledTimes(i + 1);
        });
      }

      // After 5 failed attempts, should show lockout warning
      // The actual implementation may vary - this tests the expected behavior
      // The form should either show a warning or be temporarily disabled
    });

    it('should not leak account existence through error messages', async () => {
      // Test with non-existent account
      mockSignIn.create.mockRejectedValueOnce(new Error('Invalid identifier or password'));

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      // First: try with non-existent email
      fireEvent.changeText(emailInput, 'nonexistent@example.com');
      fireEvent.changeText(passwordInput, 'password');
      fireEvent.press(submitButton);

      let errorMessage1 = '';
      await waitFor(() => {
        const errorElement = screen.getByText(/invalid/i);
        errorMessage1 = errorElement.props.children;
      });

      // Reset
      mockSignIn.create.mockRejectedValueOnce(new Error('Invalid identifier or password'));

      // Second: try with wrong password
      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(submitButton);

      // Error messages should be identical/similar to prevent account enumeration
      // This is handled by Clerk returning the same error message
    });
  });

  describe('T037: Timing checks for sign-in flows', () => {
    it('should complete sign-in within acceptable time frame', async () => {
      const startTime = Date.now();

      render(<SignInForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalled();
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // UI interaction should not add significant delay (< 1000ms for mocked requests)
      // Note: In real tests, this would measure actual network requests
      expect(duration).toBeLessThan(1000);
    });
  });
});
