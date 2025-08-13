import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/Loading';
import { apiService } from '../services/api';
import type { ResetPasswordFormData, ApiErrorResponse } from '../types';

const ResetPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('newPassword');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token inválido ou não fornecido.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await apiService.validateResetToken(token);
        if (response.valid) {
          setTokenValid(true);
        } else {
          setError(response.message || 'Token inválido ou expirado.');
        }
      } catch (err: unknown) {
        console.error('Erro ao validar token:', err);
        const apiError = err as ApiErrorResponse;
        setError(
          apiError.response?.data?.message || 
          'Token inválido ou expirado.'
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token não encontrado.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      console.error('Erro ao redefinir senha:', err);
      const apiError = err as ApiErrorResponse;
      setError(
        apiError.response?.data?.message || 
        'Erro ao redefinir senha. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return <Loading />;
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Token Inválido
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'O token de recuperação é inválido ou expirou.'}
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Solicitar nova recuperação
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redefinir senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua nova senha
          </p>
        </div>

        <Card className="p-8">
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <input
                {...register('newPassword', {
                  required: 'Nova senha é obrigatória',
                  minLength: {
                    value: 8,
                    message: 'A senha deve ter pelo menos 8 caracteres'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
                  }
                })}
                type="password"
                id="newPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua nova senha"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar nova senha
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) => value === password || 'As senhas não coincidem'
                })}
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirme sua nova senha"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Voltar para o login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;