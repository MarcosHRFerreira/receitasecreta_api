import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Layout, ProtectedRoute } from './components';
import {
  Login,
  Register,
  Dashboard,
  ReceitasList,
  ReceitaDetail,
  ReceitaForm,
  ProdutosList,
  ProdutoForm,
  UsersList,
  ForgotPassword,
  ResetPassword
} from './pages';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para redirecionamento baseado em autenticação
const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

// Componente principal de rotas
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rota raiz - redireciona baseado na autenticação */}
        <Route path="/" element={<AuthRedirect />} />
        
        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <Layout>
              <Login />
            </Layout>
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <Layout>
              <Register />
            </Layout>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <Layout>
              <ForgotPassword />
            </Layout>
          } 
        />
        <Route 
          path="/reset-password/:token" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : 
            <Layout>
              <ResetPassword />
            </Layout>
          } 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas de Receitas */}
        <Route 
          path="/receitas" 
          element={
            <ProtectedRoute>
              <Layout>
                <ReceitasList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/receitas/nova" 
          element={
            <ProtectedRoute>
              <Layout>
                <ReceitaForm />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/receitas/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <ReceitaDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/receitas/:id/editar" 
          element={
            <ProtectedRoute>
              <Layout>
                <ReceitaForm />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas de Produtos */}
        <Route 
          path="/produtos" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProdutosList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/produtos/novo" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProdutoForm />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/produtos/:id/editar" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProdutoForm />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Rotas de Usuários (apenas para ADMIN) */}
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <UsersList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Rota 404 */}
        <Route 
          path="*" 
          element={
            <Layout>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
                <p className="text-gray-600 mb-6">A página que você está procurando não existe.</p>
                <a 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Voltar ao Dashboard
                </a>
              </div>
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
};

// Componente principal da aplicação
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
