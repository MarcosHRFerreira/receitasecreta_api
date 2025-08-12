import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { UserRole } from '../types';

// Mock do apiService
vi.mock('../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

// Componente de teste para usar o hook
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <button onClick={() => login({ login: 'test', password: 'test' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render with initial state', () => {
    renderWithAuthProvider();
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should restore user from localStorage', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: UserRole.USER,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderWithAuthProvider();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
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
    
    renderWithAuthProvider();
    
    const loginButton = screen.getByText('Login');
    loginButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
    
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.user));
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
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    renderWithAuthProvider();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });
    
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});