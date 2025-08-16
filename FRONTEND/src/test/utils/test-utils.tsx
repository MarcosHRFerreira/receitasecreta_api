/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../contexts/AuthContext";
import { vi } from "vitest";

// Configuração customizada do QueryClient para testes
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper com todos os providers necessários
interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const AllTheProviders = ({
  children,
  queryClient = createTestQueryClient(),
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Render customizado com providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { queryClient, initialEntries, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient} initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Render apenas com QueryClient (sem AuthProvider)
const renderWithQueryClient = (
  ui: ReactElement,
  queryClient = createTestQueryClient()
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

// Render apenas com Router (sem outros providers)
const renderWithRouter = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper });
};

// Mock do usuário autenticado
export const mockAuthenticatedUser = {
  id: "1",
  username: "Test User",
  email: "test@test.com",
  role: "USER" as const,
};

export const mockAdminUser = {
  id: "2",
  username: "Admin User",
  email: "admin@test.com",
  role: "ADMIN" as const,
};

// Função para simular delay em testes
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock de localStorage para testes
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Função para limpar todos os mocks
export const clearAllMocks = () => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
};

// Re-export everything
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export {
  customRender as render,
  renderWithQueryClient,
  renderWithRouter,
  createTestQueryClient,
};
