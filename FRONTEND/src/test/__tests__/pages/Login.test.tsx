import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../../../pages/Login';
import { AuthProvider } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';

// Mocks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

vi.mock('../../../hooks/useAuth');

const mockNavigate = vi.fn();
const mockUseAuth = vi.mocked(useAuth);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseLocation = vi.mocked(useLocation);

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Login Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: '/login',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
    
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
    });
  });

  it('deve renderizar o formulário de login', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve exibir o título da página', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});