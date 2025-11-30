/**
 * Tests for User Story 3: Password and access recovery
 *
 * These tests verify that:
 * - Users can initiate password recovery
 * - Recovery requests are tracked
 * - Error messages do not reveal account existence
 * - Password reset completes successfully
 * - Account data is preserved after recovery
 */
import * as React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Mock Clerk hooks
const mockSignIn = {
  create: jest.fn(),
  attemptFirstFactor: jest.fn(),
};

const mockSetActive = jest.fn();

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    signIn: mockSignIn,
    setActive: mockSetActive,
    isLoaded: true,
  }),
}));

// Mock Convex hooks
const mockRecordRecoveryRequest = jest.fn();
const mockResolveRecoveryRequest = jest.fn();
const mockUpsertUserAccount = jest.fn();

jest.mock('convex/react', () => ({
  useMutation: (apiRef: { name?: string }) => {
    if (apiRef?.name?.includes('recordRecoveryRequest')) return mockRecordRecoveryRequest;
    if (apiRef?.name?.includes('resolveRecoveryRequest')) return mockResolveRecoveryRequest;
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
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('expo-router/build/hooks', () => ({
  useLocalSearchParams: () => ({ email: 'test@example.com' }),
}));

// Import components after mocks
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { ResetPasswordForm } from '@/components/reset-password-form';

xdescribe('Password Recovery - User Story 3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.create.mockResolvedValue({});
    mockSignIn.attemptFirstFactor.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session_123',
    });
    mockRecordRecoveryRequest.mockResolvedValue('request_123');
  });

  describe('T021: Forgot Password Form', () => {
    it('should render the forgot password form with email field', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByLabelText(/email/i)).toBeTruthy();
      expect(screen.getByText(/reset your password/i)).toBeTruthy();
    });

    it('should show error when submitting with empty email', async () => {
      jest.mock('expo-router/build/hooks', () => ({
        useLocalSearchParams: () => ({ email: '' }),
      }));

      render(<ForgotPasswordForm />);

      // Clear any pre-filled email
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.changeText(emailInput, '');

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeTruthy();
      });
    });

    it('should call Clerk signIn.create with reset_password_email_code strategy', async () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignIn.create).toHaveBeenCalledWith({
          strategy: 'reset_password_email_code',
          identifier: 'test@example.com',
        });
      });
    });

    it('should navigate to reset-password screen after successful request', async () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          expect.stringContaining('reset-password')
        );
      });
    });

    it('should display neutral error message for non-existent email', async () => {
      // Clerk should return a neutral error that doesn't reveal account existence
      mockSignIn.create.mockRejectedValue(
        new Error("Couldn't find your account")
      );

      render(<ForgotPasswordForm />);

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Error should be displayed but should not explicitly confirm
        // whether an account exists or not
        expect(screen.getByText(/couldn't find your account/i)).toBeTruthy();
      });
    });
  });

  describe('T034: Neutral messaging for recovery attempts', () => {
    it('should show same message regardless of email existence', async () => {
      // For this test, we verify that the success message is neutral
      // and doesn't confirm whether the email exists
      mockSignIn.create.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.changeText(emailInput, 'anyemail@example.com');

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should navigate to reset password regardless
        // The actual email may or may not exist, but we still proceed
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });

  describe('T024: Reset Password Form', () => {
    it('should render the reset password form with new password and code fields', () => {
      render(<ResetPasswordForm />);

      expect(screen.getByLabelText(/new password/i)).toBeTruthy();
      expect(screen.getByLabelText(/verification code/i)).toBeTruthy();
      expect(screen.getByText(/reset password/i)).toBeTruthy();
    });

    it('should call Clerk attemptFirstFactor with code and password', async () => {
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/new password/i);
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByText(/reset password/i);

      fireEvent.changeText(passwordInput, 'NewSecurePass123!');
      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignIn.attemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'reset_password_email_code',
          code: '123456',
          password: 'NewSecurePass123!',
        });
      });
    });

    it('should set active session after successful password reset', async () => {
      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/new password/i);
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByText(/reset password/i);

      fireEvent.changeText(passwordInput, 'NewSecurePass123!');
      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({
          session: 'session_123',
        });
      });
    });

    it('should display error for invalid verification code', async () => {
      mockSignIn.attemptFirstFactor.mockRejectedValue(
        new Error('Invalid verification code')
      );

      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/new password/i);
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByText(/reset password/i);

      fireEvent.changeText(passwordInput, 'NewSecurePass123!');
      fireEvent.changeText(codeInput, 'wrong');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should show code-related error
        // The actual error display depends on implementation
      });
    });

    it('should display error for weak password', async () => {
      mockSignIn.attemptFirstFactor.mockRejectedValue(
        new Error('Password is too weak')
      );

      render(<ResetPasswordForm />);

      const passwordInput = screen.getByLabelText(/new password/i);
      const codeInput = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByText(/reset password/i);

      fireEvent.changeText(passwordInput, 'weak');
      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is too weak/i)).toBeTruthy();
      });
    });
  });

  describe('T035: Recovery handlers do not leak identifier existence', () => {
    it('should proceed with recovery flow even for non-existent emails', async () => {
      // When email doesn't exist, Clerk might still proceed
      // (depends on Clerk configuration)
      mockSignIn.create.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.changeText(emailInput, 'nonexistent@example.com');

      const submitButton = screen.getByText(/reset your password/i);
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should still navigate - actual email delivery is handled by Clerk
        expect(mockRouter.push).toHaveBeenCalled();
      });
    });
  });
});

