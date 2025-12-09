import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock the auth events
jest.mock('@/lib/auth-events', () => ({
  emitAuthChange: jest.fn(),
}));

// Mock the AuthService
jest.mock('@/services/auth.service', () => ({
  AuthService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

import SignInPage from '@/app/auth/sign-in/page';
import SignUpPage from '@/app/auth/sign-up/page';
import { AuthService } from '@/services/auth.service';
import { emitAuthChange } from '@/lib/auth-events';

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Page', () => {
    it('renders the sign in form correctly', () => {
      render(<SignInPage />);

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('shows validation errors when form is submitted empty', async () => {
      render(<SignInPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email format', async () => {
      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, 'testpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('successfully logs in with valid credentials', async () => {
      AuthService.login.mockResolvedValue({
        ok: true,
        data: { user: { id: 1, email: 'test@example.com' } },
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'testpassword123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AuthService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'testpassword123',
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
      });

      expect(emitAuthChange).toHaveBeenCalled();
    });

    it('displays server error when login fails', async () => {
      AuthService.login.mockResolvedValue({
        ok: false,
        error: 'Invalid credentials.',
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during sign in', async () => {
      // Make the login take some time
      AuthService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 500))
      );

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'testpassword123');
      fireEvent.click(submitButton);

      // Button should show loading state
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    });
  });

  describe('Sign Up Page', () => {
    it('renders the sign up form correctly', () => {
      render(<SignUpPage />);

      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it('shows validation errors when form is submitted empty', async () => {
      render(<SignUpPage />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('shows validation error for short password', async () => {
      render(<SignUpPage />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'short');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Look for the error message specifically (has auth-error class)
        const errorElement = document.querySelector('.auth-error');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement.textContent).toMatch(/at least 8 characters/i);
      });

      expect(AuthService.register).not.toHaveBeenCalled();
    });

    it('successfully creates an account with valid data', async () => {
      AuthService.register.mockResolvedValue({
        ok: true,
        data: { id: 1, name: 'Test User', email: 'test@example.com' },
      });

      render(<SignUpPage />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'testpassword123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AuthService.register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123',
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
      });
    });

    it('displays server error when registration fails', async () => {
      AuthService.register.mockResolvedValue({
        ok: false,
        error: 'Email already registered.',
      });

      render(<SignUpPage />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'testpassword123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during sign up', async () => {
      // Make the register take some time
      AuthService.register.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 500))
      );

      render(<SignUpPage />);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'testpassword123');
      fireEvent.click(submitButton);

      // Button should show loading state
      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    });
  });
});

