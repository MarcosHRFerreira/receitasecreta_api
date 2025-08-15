import React, { useState } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import { Loading, Modal } from './';
import type { ReceitaImagemResponseDto } from '../types';

interface ReceitaImageGalleryProps {
  receitaId: string;
  showTitle?: boolean;
}

const ReceitaImageGallery: React.FC<ReceitaImageGalleryProps> = ({ 
  receitaId, 
  showTitle = true 
}) => {
  const [selectedImage, setSelectedImage] = useState<ReceitaImagemResponseDto | null>(null);
  const [showGallery, setShowGallery] = useState(true);

  const {
    imagens,
    isLoadingImages
  } = useImageUpload(receitaId);

  const isLoading = isLoadingImages;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Loading text="Carregando imagens..." />
      </div>
    );
  }

  // Usar apenas a lista de imagens retornada pelo hook
  // O hook já gerencia a ordenação e não há necessidade de separar imagem principal
  const allImages = imagens || [];
  const hasImages = allImages.length > 0;

  // Se não há imagens, não exibir a seção
  if (!hasImages) {
    return null;
  }

  const getImageUrl = (imagem: ReceitaImagemResponseDto) => {
    return imagem.urlImagem;
  };

  const openImageModal = (imagem: ReceitaImagemResponseDto) => {
    setSelectedImage(imagem);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {showTitle && (
          <div 
            className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowGallery(!showGallery)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📸 Imagens da Receita
                {hasImages && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {allImages.length}
                  </span>
                )}
              </h2>
              <span className={`transform transition-transform ${showGallery ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </div>
        )}
        
        {showGallery && (
          <div className="p-6">
            {/* Galeria de Todas as Imagens */}
            {hasImages && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allImages.map((imagem) => (
                    <div 
                      key={imagem.imagemId}
                      className="relative group cursor-pointer"
                      onClick={() => openImageModal(imagem)}
                    >
                      <img
                        src={getImageUrl(imagem)}
                        alt={imagem.descricao || 'Imagem da receita'}
                        className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                          🔍
                        </span>
                      </div>
                      {imagem.descricao && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg">
                          <p className="text-white text-xs truncate">{imagem.descricao}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há imagens */}
            {!hasImages && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-600 mb-4">Nenhuma imagem cadastrada para esta receita</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para visualizar imagem ampliada */}
      <Modal
        isOpen={!!selectedImage}
        onClose={closeImageModal}
        title={selectedImage?.descricao || 'Imagem da Receita'}
        size="lg"
      >
        {selectedImage && (
          <div className="space-y-4">
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.descricao || 'Imagem da receita'}
              className="w-full max-w-2xl mx-auto max-h-80 object-contain rounded-lg"
            />
            {selectedImage.descricao && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
                <p className="text-gray-700">{selectedImage.descricao}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReceitaImageGallery;