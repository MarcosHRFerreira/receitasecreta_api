import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRequest } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserRequest & { confirmPassword: string }>();
  const password = watch('password');

  const onSubmit = async (data: UserRequest & { confirmPassword: string }) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Filtrar dados para enviar apenas os campos esperados pelo backend
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      
      setSuccess('Usuário cadastrado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Erro ao cadastrar usuário. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" role="main">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50" role="banner">
        <ThemeToggle size="sm" className="sm:hidden" aria-label="Alternar entre tema claro e escuro" />
        <ThemeToggle size="md" className="hidden sm:block" aria-label="Alternar entre tema claro e escuro" />
      </div>
      
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <header className="text-center animate-slide-down" role="banner">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500 shadow-lg" role="img" aria-label="Ícone do aplicativo Receita Secreta">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
            Receita Secreta
          </h1>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300" role="doc-subtitle">
            Crie sua conta
          </p>
        </header>

        {/* Form */}
        <Card 
          className="w-full max-w-md mx-auto"
          role="region"
          ariaLabel="Formulário de cadastro"
        >
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            role="form"
            aria-label="Formulário para criar nova conta"
            noValidate
          >
            {error && (
              <div 
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            {success && (
              <div 
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            )}

            <div className="space-y-4" role="group" aria-label="Campos do formulário de cadastro">
              {/* Login */}
              <Input
                {...register('login', { 
                  required: 'Login é obrigatório',
                  minLength: { value: 3, message: 'Login deve ter pelo menos 3 caracteres' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Login deve conter apenas letras, números e underscore'
                  }
                })}
                type="text"
                id="login"
                label="Login *"
                placeholder="Digite seu login"
                disabled={isLoading}
                error={errors.login?.message}
                ariaLabel="Campo de login - obrigatório"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m0 0a3 3 0 01-3 3H9a3 3 0 01-3-3m0 0a3 3 0 013-3h6.75zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Email */}
              <Input
                {...register('email', { 
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail deve ter um formato válido'
                  }
                })}
                type="email"
                id="email"
                label="E-mail *"
                placeholder="Digite seu e-mail"
                disabled={isLoading}
                error={errors.email?.message}
                ariaLabel="Campo de e-mail - obrigatório"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Password */}
              <Input
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                })}
                type="password"
                id="password"
                label="Senha *"
                placeholder="Digite sua senha"
                disabled={isLoading}
                error={errors.password?.message}
                ariaLabel="Campo de senha - obrigatório, mínimo 6 caracteres"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Confirm Password */}
              <Input
                {...register('confirmPassword', { 
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === password || 'As senhas não coincidem'
                })}
                type="password"
                id="confirmPassword"
                label="Confirmar Senha *"
                placeholder="Confirme sua senha"
                disabled={isLoading}
                error={errors.confirmPassword?.message}
                ariaLabel="Campo de confirmação de senha - obrigatório, deve ser igual à senha"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Criando conta, aguarde..."
              className="w-full"
              variant="primary"
              ariaLabel={isLoading ? "Criando conta, aguarde..." : "Criar nova conta"}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>

            {/* Login Link */}
            <nav className="text-center" role="navigation" aria-label="Link para página de login">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-1 py-1"
                  aria-label="Ir para página de login"
                  role="link"
                >
                  Faça login aqui
                </Link>
              </p>
            </nav>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;