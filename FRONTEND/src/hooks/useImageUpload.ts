import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { ReceitaImagemResponseDto, ReceitaImagemUpdateDto } from '../types';

// Tipos específicos para o hook de upload de imagens
export interface ImageUploadData {
  receitaId: string;
  arquivo: File;
  descricao?: string;
  ehPrincipal?: boolean;
  ordemExibicao?: number;
}

export interface ImageReorderData {
  receitaId: string;
  imagens: Array<{
    imagemId: string;
    ordemExibicao: number;
  }>;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImageUploadState {
  isUploading: boolean;
  progress: ImageUploadProgress | null;
  error: string | null;
  uploadedImages: ReceitaImagemResponseDto[];
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}

// Query keys para cache
const QUERY_KEYS = {
  RECEITA_IMAGENS: 'receita-imagens',
  IMAGEM_PRINCIPAL: 'imagem-principal',
  IMAGEM_ESTATISTICAS: 'imagem-estatisticas',
  IMAGEM_CONFIG: 'imagem-config',
} as const;

/**
 * Hook personalizado para gerenciamento de upload e manipulação de imagens de receitas.
 * 
 * Fornece funcionalidades para:
 * - Upload de imagens com validação
 * - Listagem de imagens por receita
 * - Atualização de dados de imagem
 * - Reordenação de imagens
 * - Exclusão de imagens
 * - Definição de imagem principal
 * - Validação de arquivos
 * - Controle de progresso de upload
 */
export const useImageUpload = (receitaId?: string) => {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    isUploading: false,
    progress: null,
    error: null,
    uploadedImages: [],
  });

  // Configurações do sistema de imagens
  const { data: imageConfig } = useQuery({
    queryKey: [QUERY_KEYS.IMAGEM_CONFIG],
    queryFn: () => apiService.getImageConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Listar imagens de uma receita
  const {
    data: imagens,
    isLoading: isLoadingImages,
    error: loadError,
    refetch: refetchImages,
  } = useQuery({
    queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId],
    queryFn: () => apiService.getReceitaImagens(receitaId!),
    enabled: !!receitaId,
  });

  // Buscar imagem principal
  const {
    data: imagemPrincipal,
    isLoading: isLoadingPrincipal,
  } = useQuery({
    queryKey: [QUERY_KEYS.IMAGEM_PRINCIPAL, receitaId],
    queryFn: () => apiService.getImagemPrincipal(receitaId!),
    enabled: !!receitaId,
    retry: false, // Não tentar novamente em caso de erro 404
    throwOnError: false, // Não lançar erro para o React Query
  });

  // Estatísticas de imagens
  const {
    data: estatisticas,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: [QUERY_KEYS.IMAGEM_ESTATISTICAS, receitaId],
    queryFn: () => apiService.getImagemEstatisticas(receitaId!),
    enabled: !!receitaId,
  });

  // Validação de arquivo de imagem
  const validateImageFile = useCallback((file: File): ImageValidationResult => {
    const errors: string[] = [];
    const config = imageConfig;

    if (!file) {
      errors.push('Nenhum arquivo selecionado');
      return { isValid: false, errors };
    }

    // Validar tipo de arquivo
    const allowedTypes = config?.allowedExtensions || ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    // Validar MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      errors.push('Tipo MIME de arquivo não permitido');
    }

    // Validar tamanho do arquivo
    const maxSize = config?.maxFileSize || 5 * 1024 * 1024; // 5MB padrão
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      errors.push(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
    }

    // Validar tamanho mínimo
    const minSize = 1024; // 1KB mínimo
    if (file.size < minSize) {
      errors.push('Arquivo muito pequeno');
    }

    // Validar nome do arquivo
    if (file.name.length > 255) {
      errors.push('Nome do arquivo muito longo');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [imageConfig]);

  // Validação de múltiplos arquivos
  const validateMultipleFiles = useCallback((files: File[]): ImageValidationResult => {
    const errors: string[] = [];
    const config = imageConfig;

    if (!files || files.length === 0) {
      errors.push('Nenhum arquivo selecionado');
      return { isValid: false, errors };
    }

    // Validar limite de imagens por receita
    const maxImages = config?.maxImagensPerReceita || 10;
    const currentImageCount = imagens?.content?.length || 0;
    
    if (currentImageCount + files.length > maxImages) {
      errors.push(`Limite de imagens excedido. Máximo: ${maxImages} imagens por receita`);
    }

    // Validar cada arquivo individualmente
    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          errors.push(`Arquivo ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [imageConfig, imagens, validateImageFile]);

  // Mutation para upload de imagem
  const uploadMutation = useMutation({
    mutationFn: async (data: ImageUploadData) => {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        error: null,
        progress: { loaded: 0, total: data.arquivo.size, percentage: 0 },
      }));

      try {
        const response = await apiService.uploadReceitaImagem(
          data.receitaId,
          data.arquivo,
          data.descricao,
          data.ehPrincipal,
          data.ordemExibicao,
          // Callback de progresso
          (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentage = Math.round((loaded * 100) / (total || 1));
            
            setUploadState(prev => ({
              ...prev,
              progress: { loaded, total: total || 0, percentage },
            }));
          }
        );

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: null,
          uploadedImages: [...prev.uploadedImages, response],
        }));

        return response;
      } catch (error) {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: null,
          error: error instanceof Error ? error.message : 'Erro no upload',
        }));
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_PRINCIPAL, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_ESTATISTICAS, receitaId] });
    },
  });

  // Mutation para upload múltiplo
  const uploadMultipleMutation = useMutation({
    mutationFn: async (data: { receitaId: string; files: File[]; descriptions?: string[] }) => {
      const { receitaId, files, descriptions = [] } = data;
      const uploadedImages: ReceitaImagemResponseDto[] = [];
      
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        error: null,
        uploadedImages: [],
      }));

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const description = descriptions[i];
          const isFirst = i === 0;
          
          const uploadData: ImageUploadData = {
            receitaId,
            arquivo: file,
            descricao: description,
            ehPrincipal: isFirst && !imagemPrincipal, // Primeira imagem como principal se não houver
            ordemExibicao: (imagens?.content?.length || 0) + i + 1,
          };

          const response = await uploadMutation.mutateAsync(uploadData);
          uploadedImages.push(response);
        }

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          uploadedImages,
        }));

        return uploadedImages;
      } catch (error) {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: error instanceof Error ? error.message : 'Erro no upload múltiplo',
        }));
        throw error;
      }
    },
  });

  // Mutation para atualizar imagem
  const updateMutation = useMutation({
    mutationFn: (data: ReceitaImagemUpdateDto) => apiService.updateReceitaImagem(data.imagemId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_PRINCIPAL, receitaId] });
    },
  });

  // Mutation para reordenar imagens
  const reorderMutation = useMutation({
    mutationFn: (data: ImageReorderData) => apiService.reorderReceitaImagens(data.receitaId, data.imagens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId] });
    },
  });

  // Mutation para definir imagem principal
  const setPrincipalMutation = useMutation({
    mutationFn: ({ imagemId, receitaId }: { imagemId: string; receitaId: string }) => 
      apiService.setImagemPrincipal(receitaId, imagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_PRINCIPAL, receitaId] });
    },
  });

  // Mutation para excluir imagem
  const deleteMutation = useMutation({
    mutationFn: (imagemId: string) => apiService.deleteReceitaImagem(imagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECEITA_IMAGENS, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_PRINCIPAL, receitaId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGEM_ESTATISTICAS, receitaId] });
    },
  });

  // Funções de conveniência
  const uploadSingleImage = useCallback(
    (data: ImageUploadData) => uploadMutation.mutate(data),
    [uploadMutation]
  );

  const uploadMultipleImages = useCallback(
    (receitaId: string, files: File[], descriptions?: string[]) => 
      uploadMultipleMutation.mutate({ receitaId, files, descriptions }),
    [uploadMultipleMutation]
  );

  const updateImage = useCallback(
    (data: ReceitaImagemUpdateDto) => updateMutation.mutate(data),
    [updateMutation]
  );

  const reorderImages = useCallback(
    (data: ImageReorderData) => reorderMutation.mutate(data),
    [reorderMutation]
  );

  const setPrincipalImage = useCallback(
    (imagemId: string, receitaId: string) => setPrincipalMutation.mutate({ imagemId, receitaId }),
    [setPrincipalMutation]
  );

  const deleteImage = useCallback(
    (imagemId: string) => deleteMutation.mutate(imagemId),
    [deleteMutation]
  );

  const clearUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: null,
      error: null,
      uploadedImages: [],
    });
  }, []);

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  // Utilitários
  const getImageUrl = useCallback((imagem: ReceitaImagemResponseDto) => {
    return imagem.urlImagem || `/api/receitas/imagens/arquivo/${imagem.caminhoArquivo}`;
  }, []);

  const getThumbnailUrl = useCallback((imagem: ReceitaImagemResponseDto) => {
    return imagem.urlThumbnail || getImageUrl(imagem);
  }, [getImageUrl]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // Estado
    uploadState,
    imagens: imagens?.content || [],
    imagemPrincipal,
    estatisticas,
    imageConfig,
    
    // Loading states
    isLoadingImages,
    isLoadingPrincipal,
    isLoadingStats,
    isUploading: uploadState.isUploading,
    
    // Errors
    loadError,
    uploadError: uploadState.error,
    
    // Mutations loading states
    isUpdating: updateMutation.isPending,
    isReordering: reorderMutation.isPending,
    isSettingPrincipal: setPrincipalMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Funções principais
    uploadSingleImage,
    uploadMultipleImages,
    updateImage,
    reorderImages,
    setPrincipalImage,
    deleteImage,
    
    // Validação
    validateImageFile,
    validateMultipleFiles,
    
    // Utilitários
    getImageUrl,
    getThumbnailUrl,
    formatFileSize,
    clearUploadState,
    clearError,
    refetchImages,
    
    // Progresso
    uploadProgress: uploadState.progress,
  };
};

export default useImageUpload;