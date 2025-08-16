import React, { useState, useRef, useCallback } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import Button from './ui/Button';
import Card from './ui/Card';

interface ImageUploadProps {
  receitaId: string;
  onImageDeleted?: (imagemId: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // em MB
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface UploadProgress {
  [key: string]: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  receitaId,
  onImageDeleted,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 5, // 5MB
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadSingleImage,
    deleteImage,
    imagens,
    isUploading,
    isDeleting,
    imageConfig,
    formatFileSize
  } = useImageUpload(receitaId);

  // Validação de arquivo
  const validateFile = useCallback((file: File): string | null => {
    // Verificar tipo
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: ${acceptedTypes.join(', ')}`;
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `Arquivo muito grande: ${fileSizeMB.toFixed(2)}MB. Tamanho máximo: ${maxFileSize}MB`;
    }

    // Verificar se já existe uma imagem com o mesmo nome
    if (imagens?.some(img => img.nomeOriginal === file.name)) {
      return `Já existe uma imagem com o nome: ${file.name}`;
    }

    return null;
  }, [acceptedTypes, maxFileSize, imagens]);

  // Processar arquivos selecionados
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: FileWithPreview[] = [];

    // Verificar limite de arquivos
    const totalFiles = (imagens?.length || 0) + selectedFiles.length + fileArray.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Limite de ${maxFiles} imagens excedido. Total atual: ${totalFiles}`);
      setErrors(newErrors);
      return;
    }

    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${index}`
        });
        validFiles.push(fileWithPreview);
      }
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [validateFile, maxFiles, imagens, selectedFiles.length]);

  // Handlers de drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  // Upload de arquivo
  const handleUpload = useCallback(async (file: FileWithPreview) => {
    if (!file.id) return;

    try {
      const uploadData = {
        receitaId,
        arquivo: file,
        descricao: '',
        ehPrincipal: false,
        ordemExibicao: (imagens?.length || 0) + 1
      };
      
      uploadSingleImage(uploadData);

      // Remover arquivo da lista de selecionados
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.id!];
        return newProgress;
      });

      // Limpar preview
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setErrors(prev => [...prev, `Erro no upload de ${file.name}: ${error}`]);
    }
  }, [uploadSingleImage, receitaId, imagens]);

  // Upload de todos os arquivos
  const handleUploadAll = useCallback(async () => {
    const uploads = selectedFiles.map(file => handleUpload(file));
    await Promise.allSettled(uploads);
  }, [selectedFiles, handleUpload]);

  // Remover arquivo da lista
  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  }, []);

  // Deletar imagem existente
  const handleDeleteImage = useCallback(async (imagemId: string) => {
    try {
      await deleteImage(imagemId);
      onImageDeleted?.(imagemId);
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      setErrors(prev => [...prev, `Erro ao deletar imagem: ${error}`]);
    }
  }, [deleteImage, onImageDeleted]);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Usar formatFileSize do hook

  return (
    <div className={`image-upload ${className}`}>
      {/* Área de Drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">
            📷
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Tipos aceitos: {acceptedTypes.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Tamanho máximo: {maxFileSize}MB por arquivo
            </p>
            <p className="text-sm text-gray-500">
              Máximo {maxFiles} imagens por receita
            </p>
          </div>
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Erros */}
      {errors.length > 0 && (
        <Card className="mt-4 p-4 bg-red-50 border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-red-800 font-medium mb-2">Erros de validação:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </Card>
      )}

      {/* Arquivos selecionados para upload */}
      {selectedFiles.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Arquivos selecionados ({selectedFiles.length})</h4>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedFiles.forEach(file => {
                    if (file.preview) URL.revokeObjectURL(file.preview);
                  });
                  setSelectedFiles([]);
                  setUploadProgress({});
                }}
              >
                Limpar
              </Button>
              <Button
                onClick={handleUploadAll}
                disabled={isUploading || selectedFiles.length === 0}
                size="sm"
              >
                {isUploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-3">
                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {/* Barra de progresso */}
                  {file.id && uploadProgress[file.id] !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpload(file)}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      Enviar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Imagens existentes */}
      {imagens && imagens.length > 0 && (
        <Card className="mt-4 p-4">
          <h4 className="font-medium mb-4">
            Imagens da receita ({imagens.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imagens.map((imagem) => (
              <div key={imagem.imagemId} className="border rounded-lg p-3">
                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                  <img
                    src={imagem.urlImagem}
                    alt={imagem.descricao || imagem.nomeOriginal}
                    className="w-full h-full object-cover"
                  />
                  {imagem.ehPrincipal && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Principal
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium truncate" title={imagem.nomeOriginal}>
                    {imagem.nomeOriginal}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(imagem.tamanhoBytes)}
                  </p>
                  {imagem.descricao && (
                    <p className="text-xs text-gray-600 truncate" title={imagem.descricao}>
                      {imagem.descricao}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteImage(imagem.imagemId)}
                    disabled={isDeleting}
                    className="w-full text-red-600 hover:text-red-800"
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Informações do sistema */}
      {imageConfig && (
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Configurações do sistema:</p>
          <p>• Tamanho máximo: {Math.round((imageConfig.maxFileSize || 5242880) / (1024 * 1024))}MB</p>
          <p>• Tipos aceitos: {imageConfig.allowedExtensions?.join(', ') || 'jpg, png, webp'}</p>
          <p>• Máximo por receita: {imageConfig.maxImagensPerReceita || 10}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;