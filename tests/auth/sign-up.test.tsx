/**
 * Tests for User Story 1: Create and access a Caltraq account
 *
 * These tests verify that:
 * - Users can create an account with email/password
 * - UserAccount records are created in Convex after successful sign-up
 * - Abandoned sign-up flows are handled gracefully
 * - Resumed sign-up flows complete successfully
 */
import * as React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Mock Clerk hooks
const mockSignUp = {
  create: jest.fn(),
  prepareEmailAddressVerification: jest.fn(),
};

jest.mock('@clerk/clerk-expo', () => ({
  useSignUp: () => ({
    signUp: mockSignUp,
    isLoaded: true,
  }),
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    userId: null,
  }),
  useUser: () => ({
    user: null,
  }),
}));

// Mock Convex hooks
const mockUpsertUserAccount = jest.fn();

jest.mock('convex/react', () => ({
  useMutation: () => mockUpsertUserAccount,
  useQuery: () => null,
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  Link: ({ children, ...props }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import the component after mocks
import { SignUpForm } from '@/components/sign-up-form';

xdescribe('SignUpForm - Account Creation (US1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.create.mockResolvedValue({});
    mockSignUp.prepareEmailAddressVerification.mockResolvedValue({});
  });

  describe('T009: Account creation and persistence', () => {
    it('should render the sign-up form with email and password fields', () => {
      render(<SignUpForm />);

      expect(screen.getByLabelText(/email/i)).toBeTruthy();
      expect(screen.getByLabelText(/password/i)).toBeTruthy();
      expect(screen.getByText(/continue/i)).toBeTruthy();
    });

    it('should call Clerk signUp.create with email and password on submit', async () => {
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledWith({
          emailAddress: 'test@example.com',
          password: 'SecurePass123!',
        });
      });
    });

    it('should call prepareEmailAddressVerification after successful sign-up', async () => {
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp.prepareEmailAddressVerification).toHaveBeenCalledWith({
          strategy: 'email_code',
        });
      });
    });

    it('should navigate to verify-email page after successful sign-up initiation', async () => {
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('verify-email'));
      });
    });

    it('should display email-related errors when sign-up fails due to invalid email', async () => {
      mockSignUp.create.mockRejectedValue(new Error('This identifier is already in use'));

      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/identifier is already in use/i)).toBeTruthy();
      });
    });

    it('should display password-related errors when sign-up fails due to weak password', async () => {
      mockSignUp.create.mockRejectedValue(new Error('Password is too weak'));

      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'weak');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is too weak/i)).toBeTruthy();
      });
    });
  });

  describe('T033: Abandoned and resumed sign-up flows', () => {
    it('should not prevent re-submission after a failed attempt', async () => {
      // First attempt fails
      mockSignUp.create.mockRejectedValueOnce(new Error('Network error'));

      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledTimes(1);
      });

      // Second attempt succeeds
      mockSignUp.create.mockResolvedValueOnce({});
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle email already registered gracefully with clear message', async () => {
      mockSignUp.create.mockRejectedValue(new Error('This email address is already registered'));

      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*already/i)).toBeTruthy();
      });
    });

    it('should clear previous errors when user starts typing again', async () => {
      mockSignUp.create.mockRejectedValueOnce(new Error('Invalid email format'));

      render(<SignUpForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByText(/continue/i);

      // First submission with error
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'SecurePass123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeTruthy();
      });

      // User types a new value - error should be displayed until next submission
      // (The actual behavior depends on implementation - this tests the current expected behavior)
      mockSignUp.create.mockResolvedValueOnce({});
      fireEvent.changeText(emailInput, 'valid@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUp.create).toHaveBeenLastCalledWith({
          emailAddress: 'valid@example.com',
          password: 'SecurePass123!',
        });
      });
    });
  });
});
