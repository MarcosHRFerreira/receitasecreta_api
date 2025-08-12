import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserAuthRequest } from '../types';
import { Loading } from '../components';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Limpar erro apenas quando o usuário tentar fazer login novamente
  // Removido o timer automático para manter a mensagem fixa

  const { register, handleSubmit, formState: { errors } } = useForm<UserAuthRequest>();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Redirecionar automaticamente se já estiver autenticado e não há erro
  useEffect(() => {
    console.log('🔑 [LOGIN] useEffect de redirecionamento:', {
      isAuthenticated,
      isLoading,
      hasError: !!error,
      from
    });
    
    if (isAuthenticated && !isLoading && !error) {
      console.log('🔑 [LOGIN] Condições atendidas para redirecionamento. Navegando para:', from);
      // Adicionar um pequeno delay para evitar redirecionamento muito rápido
      const timer = setTimeout(() => {
        console.log('🔑 [LOGIN] Executando navegação para:', from);
        navigate(from, { replace: true });
      }, 100);
      
      return () => {
        console.log('🔑 [LOGIN] Limpando timer de redirecionamento.');
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated, navigate, from, isLoading, error]);

  const onSubmit = async (data: UserAuthRequest) => {
    console.log('🔑 [LOGIN] Iniciando processo de login no componente:', { login: data.login });
    try {
      setIsLoading(true);
      setError('');
      console.log('🔑 [LOGIN] Chamando função login do AuthContext...');
      await login(data);
      console.log('🔑 [LOGIN] Login concluído com sucesso no componente.');
      // A navegação será feita automaticamente pelo useEffect quando isAuthenticated mudar
    } catch (err: unknown) {
      console.error('🔑 [LOGIN] Erro capturado no componente:', err);
      const errorMessage = err instanceof Error && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Erro ao fazer login. Verifique suas credenciais.';
      
      console.log('🔑 [LOGIN] Mensagem de erro definida:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🔑 [LOGIN] Processo de login finalizado no componente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🍰</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Receita Secreta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login em sua conta
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-4 rounded-md shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      Erro de autenticação
                    </p>
                    <p className="text-sm mt-1">
                      {error}
                    </p>
                    <p className="text-xs mt-2 text-red-500">
                       Clique no X para fechar esta mensagem ou tente fazer login novamente.
                     </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 px-4 py-4 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Loading size="sm" text="" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Autenticando...
                  </p>
                  <p className="text-sm mt-1">
                    Verificando suas credenciais, aguarde um momento.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Login */}
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                {...register('login', { 
                  required: 'Usuário é obrigatório',
                  minLength: { value: 3, message: 'Usuário deve ter pelo menos 3 caracteres' }
                })}
                type="text"
                id="login"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu usuário"
                disabled={isLoading}
              />
              {errors.login && (
                <p className="mt-1 text-sm text-red-600">{errors.login.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                })}
                type="password"
                id="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loading size="sm" text="" />
                  <span>Entrando...</span>
                </div>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Entrar</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;