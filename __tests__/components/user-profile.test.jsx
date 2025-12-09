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

// Mock fetch for the revalidate API route
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock the AuthService
jest.mock('@/services/auth.service', () => ({
  AuthService: {
    status: jest.fn(),
    logout: jest.fn(),
    sendVerificationEmail: jest.fn(),
  },
}));

// Mock the UsersService
jest.mock('@/services/users.service', () => ({
  UsersService: {
    getPublicProfile: jest.fn(),
    getCreatedPuzzles: jest.fn(),
    patchMe: jest.fn(),
    getAvatarCatalog: jest.fn(),
    follow: jest.fn(),
    unfollow: jest.fn(),
  },
}));

import UserProfileClient from '@/app/users/[id]/UserProfileClient';
import { AuthService } from '@/services/auth.service';
import { UsersService } from '@/services/users.service';

const mockUser = {
  id: 1,
  display_name: 'Test User',
  email: 'test@example.com',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  is_verified: true,
  stats: {
    puzzles: 5,
    likes_received: 10,
    followers: 3,
    following: 2,
  },
};

const mockAuthUser = {
  id: 1,
  email: 'test@example.com',
  is_verified: true,
};

const mockPuzzles = [
  { id: 1, title: 'Test Puzzle 1', size: 3, difficulty: 2 },
  { id: 2, title: 'Test Puzzle 2', size: 4, difficulty: 3 },
];

describe('User Profile - Name Change', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks for owner viewing their own profile
    AuthService.status.mockResolvedValue({
      ok: true,
      data: { user: mockAuthUser },
    });
    
    UsersService.getPublicProfile.mockResolvedValue({
      ok: true,
      data: mockUser,
    });
    
    UsersService.getCreatedPuzzles.mockResolvedValue({
      ok: true,
      data: { items: mockPuzzles },
    });
  });

  it('renders the profile page with user name', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
    });
  });

  it('shows edit button when user is viewing their own profile', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });
  });

  it('does not show edit button when viewing another user profile', async () => {
    // Mock as a different user logged in
    AuthService.status.mockResolvedValue({
      ok: true,
      data: { user: { id: 999, email: 'other@example.com' } },
    });

    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.queryByLabelText(/edit name/i)).not.toBeInTheDocument();
    });
  });

  it('shows name input when edit button is clicked', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('successfully changes the user name', async () => {
    UsersService.patchMe.mockResolvedValue({
      ok: true,
      data: { ...mockUser, display_name: 'New Name' },
    });

    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Clear and type new name
    const input = screen.getByPlaceholderText(/your display name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(UsersService.patchMe).toHaveBeenCalledWith({ name: 'New Name' });
    });

    // Check that the name was updated in the UI
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'New Name' })).toBeInTheDocument();
    });
  });

  it('shows error when name is empty', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Clear the input
    const input = screen.getByPlaceholderText(/your display name/i);
    await userEvent.clear(input);

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument();
    });

    expect(UsersService.patchMe).not.toHaveBeenCalled();
  });

  it('shows error when name is too long', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Type a very long name (>50 characters) by directly setting the value
    // (userEvent.type respects maxLength, but we need to bypass it for this test)
    const input = screen.getByPlaceholderText(/your display name/i);
    fireEvent.change(input, { target: { value: 'A'.repeat(51) } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/at most 50 characters/i)).toBeInTheDocument();
    });

    expect(UsersService.patchMe).not.toHaveBeenCalled();
  });

  it('cancels name editing and restores original name', async () => {
    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Type a different name
    const input = screen.getByPlaceholderText(/your display name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed Name');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      // Should be back to viewing mode with original name
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
    });

    expect(UsersService.patchMe).not.toHaveBeenCalled();
  });

  it('handles server error during name update', async () => {
    UsersService.patchMe.mockResolvedValue({
      ok: false,
      error: 'Failed to update name.',
    });

    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Type new name
    const input = screen.getByPlaceholderText(/your display name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update name/i)).toBeInTheDocument();
    });
  });

  it('shows saving state during name update', async () => {
    // Make the update take some time
    UsersService.patchMe.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ ok: true, data: mockUser }), 500))
    );

    render(
      <UserProfileClient
        userId="1"
        initialUser={mockUser}
        initialPuzzles={mockPuzzles}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/edit name/i)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByLabelText(/edit name/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your display name/i)).toBeInTheDocument();
    });

    // Type new name
    const input = screen.getByPlaceholderText(/your display name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Should show saving state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });
  });
});

