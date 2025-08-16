import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReceita, useDeleteReceita, useIngredientesByReceita } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContextDefinition';
import { Loading, Modal, ReceitaImageGallery } from '../components';
import type { ReceitaIngrediente } from '../types';

const ReceitaDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  const { data: receita, isLoading, error } = useReceita(id || '');
  const { data: ingredientes, isLoading: loadingIngredientes } = useIngredientesByReceita(id || '');
  const deleteReceitaMutation = useDeleteReceita();

  // Função para verificar se o usuário atual NÃO é o autor da receita (para desabilitar botões)
  const isNotReceitaOwner = (): boolean => {
    if (!user || !receita?.userId) return true; // Se não há usuário ou userId, desabilitar
    return receita.userId !== user.id; // Desabilitar se o usuário NÃO é o proprietário
  };

  const handleDelete = async () => {
    if (!receita) return;
    
    try {
      await deleteReceitaMutation.mutateAsync(receita.receitaId);
      navigate('/receitas');
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
    }
  };

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'FACIL': return 'bg-green-100 text-green-800';
      case 'COMPLEXA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'ENTRADA': return '🥗';
      case 'PRATO_PRINCIPAL': return '🍽️';
      case 'SOBREMESA': return '🍰';
      case 'BEBIDA': return '🥤';
      case 'LANCHE': return '🥪';
      default: return '🍴';
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Carregando receita..." />;
  }

  if (error || !receita) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Receita não encontrada</div>
        <Link
          to="/receitas"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Voltar para receitas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-slide-down transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4 animate-fade-in-delay">
              <span className="text-3xl animate-pulse-glow">{getCategoryIcon(receita.categoria)}</span>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white animate-fade-in-up break-words">{receita.nomeReceita}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 animate-stagger-children">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-105">
                    {receita.categoria}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-105 ${getDifficultyColor(receita.dificuldade)}`}>
                    {receita.dificuldade}
                  </span>
                </div>
              </div>
            </div>
            
            {receita.notas && (
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4 animate-fade-in-delay break-words">{receita.notas}</p>
            )}
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center animate-stagger-children">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-up">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tempo</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receita.tempoPreparo}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-up">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Porções</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receita.rendimento}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-up">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dificuldade</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receita.dificuldade}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-up">
                <div className="text-2xl mb-1">🏷️</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categoria</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receita.categoria}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto animate-stagger-children">
            {isNotReceitaOwner() ? (
              <button
                disabled
                className="w-full sm:w-auto bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed opacity-50 text-center transition-all duration-300"
              >
                <span className="sm:hidden">✏️ Editar</span>
                <span className="hidden sm:inline">✏️ Editar</span>
              </button>
            ) : (
              <Link
                to={`/receitas/${receita.receitaId}/editar`}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 text-center hover:scale-105 hover:shadow-lg"
              >
                <span className="sm:hidden">✏️ Editar</span>
                <span className="hidden sm:inline">✏️ Editar</span>
              </Link>
            )}
            <button
              onClick={() => setDeleteModalOpen(true)}
              disabled={isNotReceitaOwner()}
              className={`w-full sm:w-auto px-4 py-2 rounded-md transition-all duration-300 ${
                isNotReceitaOwner() 
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-lg'
              }`}
            >
              <span className="sm:hidden">🗑️ Excluir</span>
              <span className="hidden sm:inline">🗑️ Excluir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <div className="animate-fade-in-delay">
        <ReceitaImageGallery receitaId={receita.receitaId} />
      </div>

      {/* Ingredients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow animate-fade-in-up transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
        <div 
          className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          onClick={() => setShowIngredients(!showIngredients)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center animate-fade-in-delay">
              🥕 Ingredientes
              {ingredientes && (
                <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full transition-all duration-300 hover:scale-110">
                  {ingredientes.length || 0}
                </span>
              )}
            </h2>
            <span className={`transform transition-all duration-300 ${showIngredients ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {showIngredients && (
          <div className="p-6 animate-fade-in">
            {loadingIngredientes ? (
              <Loading text="Carregando ingredientes..." />
            ) : ingredientes && ingredientes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 animate-stagger-children">
                {ingredientes.map((ingrediente: ReceitaIngrediente, index: number) => (
                   <div key={`${ingrediente.receitaId}-${ingrediente.produtoId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-fade-in-up">
                     <div className="flex items-center space-x-3 flex-1 min-w-0">
                       <span className="text-xl sm:text-2xl animate-pulse-glow flex-shrink-0">🥄</span>
                       <div className="min-w-0 flex-1">
                         <div className="font-medium text-gray-900 dark:text-white truncate">
                           {ingrediente.produto?.nome || 'Produto não encontrado'}
                         </div>
                         <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                           {ingrediente.produto?.categoria || ''}
                         </div>
                       </div>
                     </div>
                     <div className="text-right flex-shrink-0 ml-2">
                       <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                         {ingrediente.quantidade} {ingrediente.unidadeMedida}
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="text-4xl mb-4 animate-pulse">🥕</div>
                <p className="text-gray-600 mb-4 animate-fade-in-delay">Nenhum ingrediente cadastrado</p>
                <div className="animate-fade-in-up">
                  <Link
                    to={`/receitas/${receita.receitaId}/editar`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Adicionar ingredientes
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow animate-fade-in-up transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
        <div 
          className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white animate-fade-in-delay">📝 Modo de Preparo</h2>
            <span className={`transform transition-all duration-300 text-gray-600 dark:text-gray-400 ${showInstructions ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {showInstructions && (
          <div className="p-6 animate-fade-in">
            {receita.modoPreparo ? (
              <div className="prose max-w-none animate-fade-in-up">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {receita.modoPreparo}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="text-4xl mb-4 animate-pulse">📝</div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 animate-fade-in-delay">Modo de preparo não informado</p>
                <div className="animate-fade-in-up">
                  <Link
                    to={`/receitas/${receita.receitaId}/editar`}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Adicionar instruções
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {receita.notas && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 animate-fade-in-up transition-all duration-300 hover:shadow-md">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center animate-fade-in-delay">
            💡 Notas
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap animate-fade-in">{receita.notas}</p>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center animate-fade-in-up px-4 sm:px-0">
        <Link
          to="/receitas"
          className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
        >
          ← Voltar para receitas
        </Link>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4 animate-fade-in">
          <p className="text-gray-600 dark:text-gray-300 animate-fade-in-delay">
            Tem certeza que deseja excluir a receita <strong className="text-gray-900 dark:text-white">{receita.nomeReceita}</strong>?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 animate-shake-and-fade-in">
            Esta ação não pode ser desfeita e todos os ingredientes associados também serão removidos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end animate-stagger-children">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteReceitaMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50"
            >
              {deleteReceitaMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReceitaDetail;