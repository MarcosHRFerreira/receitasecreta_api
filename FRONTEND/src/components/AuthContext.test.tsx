import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { UserRole } from '../types';

// Mock do apiService
vi.mock('../services/api', () => ({
  apiService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

// Componente de teste para usar o hook
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <button onClick={() => login({ login: 'test@test.com', password: 'password' })} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should restore user from localStorage', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: UserRole.USER,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: UserRole.USER,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      },
      token: 'fake-token'
    };
    
    vi.mocked(apiService.login).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    loginBtn.click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.user));
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: UserRole.USER,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('testuser');

    const logoutBtn = screen.getByTestId('logout-btn');
    logoutBtn.click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});