import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserAuthRequest } from '../types';
import { Loading } from '../components';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Limpar erro apenas quando o usuário tentar fazer login novamente
  // Removido o timer automático para manter a mensagem fixa

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields }
  } = useForm<UserAuthRequest>({
    mode: 'onChange'
  });

  const watchedFields = watch();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" role="main">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50" role="banner">
        <ThemeToggle size="sm" className="sm:hidden" aria-label="Alternar tema claro/escuro" />
        <ThemeToggle size="md" className="hidden sm:block" aria-label="Alternar tema claro/escuro" />
      </div>
      
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <header className="text-center animate-slide-down">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent animate-gradient drop-shadow-sm" style={{fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
            RECEITA SECRETA
          </h1>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 animate-fade-in-delay" role="doc-subtitle">
            Faça login em sua conta para continuar
          </p>
        </header>

        {/* Form */}
        <Card 
          className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-slide-up hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] dark:border dark:border-gray-700/50"
          role="region"
          ariaLabel="Formulário de autenticação"
        >
          <Card.Content>
            <form 
              className="space-y-4 sm:space-y-6" 
              onSubmit={handleSubmit(onSubmit)} 
              role="form" 
              aria-label="Formulário de login"
              noValidate
            >
              {error && (
                <div 
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300 animate-shake-and-fade-in"
                  role="alert"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400 animate-bounce" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      aria-label="Fechar mensagem de erro"
                    >
                      <span className="sr-only">Fechar mensagem de erro</span>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg shadow-sm animate-pulse-glow" role="status" aria-live="polite">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Loading size="sm" text="" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        Autenticando...
                      </p>
                      <p className="text-sm mt-1 animate-typing">
                        Verificando suas credenciais, aguarde um momento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 sm:space-y-5 animate-stagger-children">
                {/* Login */}
                <Input
                  {...register('login', { 
                    required: 'Usuário é obrigatório',
                    minLength: {
                      value: 3,
                      message: 'Usuário deve ter pelo menos 3 caracteres'
                    }
                  })}
                  label="Usuário"
                  type="text"
                  placeholder="Digite seu usuário"
                  disabled={isLoading}
                  error={errors.login?.message}
                  leftIcon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                  variant="filled"
                  size="md"
                  className={`text-sm sm:text-base transition-all duration-200 ${
                    touchedFields.login && !errors.login && watchedFields.login
                      ? 'border-green-500 dark:border-green-400'
                      : ''
                  }`}
                  aria-label="Nome de usuário"
                  aria-required="true"
                  aria-invalid={!!errors.login}
                  aria-describedby={errors.login ? 'login-error' : undefined}
                />

                {/* Password */}
                <Input
                  {...register('password', { 
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  label="Senha"
                  type="password"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  error={errors.password?.message}
                  leftIcon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  variant="filled"
                  size="md"
                  className={`text-sm sm:text-base transition-all duration-200 ${
                    touchedFields.password && !errors.password && watchedFields.password
                      ? 'border-green-500 dark:border-green-400'
                      : ''
                  }`}
                  aria-label="Senha"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                loadingText="Processando login, aguarde..."
                variant="primary"
                size="md"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                icon={
                  !isLoading && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )
                }
                iconPosition="right"
                ariaLabel={isLoading ? "Processando login, aguarde..." : "Fazer login na conta"}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              {/* Links */}
              <nav 
                className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in-up" 
                role="navigation" 
                aria-label="Links de navegação e opções adicionais"
              >
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 font-medium hover:underline transform hover:scale-105 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-2 py-1"
                    aria-label="Ir para página de recuperação de senha"
                    role="link"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Não tem uma conta?{' '}
                    <Link
                      to="/register"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:underline transform hover:scale-105 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-2 py-1"
                      aria-label="Ir para página de cadastro de nova conta"
                      role="link"
                    >
                      Cadastre-se aqui
                    </Link>
                  </p>
                </div>
              </nav>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Login;