import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { QUERY_KEYS } from '../constants/queryKeys';
import type {
  ProdutoRequest,
  ReceitaRequest,
  ReceitaIngredienteRequest,
  ReceitaIngredienteDeleteRequest,
  PageRequest
} from '../types';

// Hooks para Usuários
export const useUsers = (params?: PageRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => apiService.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, id],
    queryFn: () => apiService.getUserById(id),
    enabled: !!id,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
  });
};

// Hooks para Produtos
export const useProdutos = (params?: PageRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUTOS, params],
    queryFn: () => apiService.getProdutos(params),
  });
};

export const useProduto = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUTO, id],
    queryFn: () => apiService.getProdutoById(id),
    enabled: !!id,
  });
};

export const useCreateProduto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (produtoData: ProdutoRequest) => apiService.createProduto(produtoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUTOS] });
    },
  });
};

export const useUpdateProduto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProdutoRequest> }) => 
      apiService.updateProduto(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUTOS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUTO, id] });
    },
  });
};

export const useDeleteProduto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteProduto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUTOS] });
    },
  });
};

// Hooks para Receitas
export const useReceitas = (params?: PageRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECEITAS, params],
    queryFn: () => apiService.getReceitas(params),
  });
};

export const useReceita = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECEITA, id],
    queryFn: () => apiService.getReceitaById(id),
    enabled: !!id,
  });
};

export const useCreateReceita = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (receitaData: ReceitaRequest) => apiService.createReceita(receitaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITAS] });
    },
  });
};

export const useUpdateReceita = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReceitaRequest> }) => 
      apiService.updateReceita(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITAS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA, id] });
    },
  });
};

export const useDeleteReceita = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteReceita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITAS] });
    },
  });
};

// Hooks para Ingredientes de Receitas
export const useReceitaIngredientes = (params?: PageRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECEITA_INGREDIENTES, params],
    queryFn: () => apiService.getReceitaIngredientes(params),
  });
};

export const useIngredientesByReceita = (receitaId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INGREDIENTES_BY_RECEITA, receitaId],
    queryFn: () => apiService.getIngredientesByReceita(receitaId),
    enabled: !!receitaId,
    staleTime: 0, // Força sempre buscar dados frescos
    gcTime: 0, // Não mantém cache
  });
};

export const useCreateReceitaIngrediente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ingredienteData: ReceitaIngredienteRequest) => 
      apiService.createReceitaIngrediente(ingredienteData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_INGREDIENTES] });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.INGREDIENTES_BY_RECEITA, variables.receitaId] 
      });
    },
  });
};

export const useUpdateReceitaIngrediente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ingredienteData: ReceitaIngredienteRequest) => 
      apiService.updateReceitaIngrediente(ingredienteData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_INGREDIENTES] });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.INGREDIENTES_BY_RECEITA, variables.receitaId] 
      });
    },
  });
};

export const useDeleteReceitaIngrediente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deleteData: ReceitaIngredienteDeleteRequest) => 
      apiService.deleteReceitaIngrediente(deleteData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_INGREDIENTES] });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.INGREDIENTES_BY_RECEITA, variables.receitaId] 
      });
    },
  });
};