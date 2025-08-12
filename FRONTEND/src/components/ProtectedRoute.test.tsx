import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { UserRole } from '../types';

// Mock do useAuth
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../contexts/AuthContextDefinition';

const TestComponent = () => <div>Protected Content</div>;

const renderProtectedRoute = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('should show loading when authentication is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    
    expect(screen.getByRole('generic')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: UserRole.USER,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderProtectedRoute();
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show access denied when user does not have required role', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: UserRole.USER,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
    expect(screen.getByText('Você não tem permissão para acessar esta página.')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user has required role', () => {
    const mockUser = {
      id: '1',
      username: 'admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});