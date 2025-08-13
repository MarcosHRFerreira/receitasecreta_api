import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import type { UserAuthRequest, UserRequest, AuthResponse } from '../types';
import { apiService } from '../services/api';
import { AuthContext } from './AuthContextDefinition';
import type { AuthContextType } from './AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Log para rastrear mudanças no estado de autenticação
  useEffect(() => {
    console.log('🔐 [AUTH] Estado de autenticação atualizado:', {
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated,
      userId: user?.id,
      username: user?.username
    });
  }, [user, token, isAuthenticated]);



  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 [AUTH] Inicializando autenticação...');
      
      // Verificar se há token e usuário salvos no localStorage
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔐 [AUTH] Dados do localStorage:', {
        hasToken: !!savedToken,
        tokenLength: savedToken?.length,
        hasUser: !!savedUser,
        userValue: savedUser
      });

      if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        try {
          console.log('🔐 [AUTH] Tentando recuperar usuário do localStorage...');
          const parsedUser = JSON.parse(savedUser);
          
          console.log('🔐 [AUTH] Usuário recuperado:', {
            id: parsedUser?.id,
            username: parsedUser?.username,
            email: parsedUser?.email,
            role: parsedUser?.role
          });
          
          setToken(savedToken);
          setUser(parsedUser);
          
          console.log('🔐 [AUTH] Autenticação restaurada com sucesso.');
        } catch (error) {
          console.error('🔐 [AUTH] Erro ao recuperar dados do usuário:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.log('🔐 [AUTH] Dados corrompidos removidos do localStorage.');
        }
      } else {
        console.log('🔐 [AUTH] Nenhum dado de autenticação encontrado no localStorage.');
      }
      
      // Garantir um tempo mínimo de loading para evitar flickering
      if (process.env.NODE_ENV !== 'test') {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setIsLoading(false);
      console.log('🔐 [AUTH] Inicialização da autenticação concluída.');
    };

    initializeAuth();
  }, []);

  // Listener para detectar mudanças no localStorage (ex: logout automático por token expirado)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedToken = localStorage.getItem('token');
      
      // Se o token foi removido externamente, limpar o estado
      if (!savedToken && (token || user)) {
        setToken(null);
        setUser(null);
      }
    };

    // Verificar periodicamente se o localStorage foi alterado
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => clearInterval(interval);
  }, [token, user]);

  const login = async (credentials: UserAuthRequest): Promise<void> => {
    console.log('🔐 [AUTH] Iniciando processo de login:', { login: credentials.login });
    setIsLoading(true);
    try {
      console.log('🔐 [AUTH] Enviando requisição de login para API...');
      const response: AuthResponse = await apiService.login(credentials);
      
      console.log('🔐 [AUTH] Resposta da API recebida:', {
        hasToken: !!response.token,
        tokenLength: response.token?.length,
        user: {
          id: response.user?.id,
          username: response.user?.username,
          email: response.user?.email,
          role: response.user?.role
        }
      });
      
      console.log('🔐 [AUTH] Definindo token no estado:', {
        tokenLength: response.token?.length,
        hasToken: !!response.token
      });
      setToken(response.token);
      
      console.log('🔐 [AUTH] Definindo usuário no estado:', {
        userId: response.user?.id,
        username: response.user?.username,
        hasUser: !!response.user
      });
      setUser(response.user);
      
      // Salvar no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('🔐 [AUTH] Login realizado com sucesso. Dados salvos no localStorage.');
      
      // Log do estado atual após as atualizações
      console.log('🔐 [AUTH] Estado após setToken/setUser:', {
        currentUser: user,
        currentToken: token,
        currentIsAuthenticated: isAuthenticated
      });
    } catch (error) {
      console.error('🔐 [AUTH] Erro durante o login:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        response: error && typeof error === 'object' && 'response' in error ? error.response : null
      });
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🔐 [AUTH] Processo de login finalizado.');
    }
  };

  const register = async (userData: UserRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiService.register(userData);
      
      setToken(response.token);
      setUser(response.user);
      
      // Salvar no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    
    // Remover do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};