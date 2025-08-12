import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReceita, useDeleteReceita, useIngredientesByReceita } from '../hooks/useApi';
import { Loading, Modal } from '../components';
import type { ReceitaIngrediente } from '../types';

const ReceitaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  const { data: receita, isLoading, error } = useReceita(id || '');
  const { data: ingredientes, isLoading: loadingIngredientes } = useIngredientesByReceita(id || '');
  const deleteReceitaMutation = useDeleteReceita();

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{getCategoryIcon(receita.categoria)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{receita.nomeReceita}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {receita.categoria}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(receita.dificuldade)}`}>
                    {receita.dificuldade}
                  </span>
                </div>
              </div>
            </div>
            
            {receita.notas && (
              <p className="text-gray-600 text-lg mb-4">{receita.notas}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm text-gray-600">Tempo</div>
                <div className="font-semibold">{receita.tempoPreparo}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm text-gray-600">Porções</div>
                <div className="font-semibold">{receita.rendimento}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm text-gray-600">Dificuldade</div>
                <div className="font-semibold">{receita.dificuldade}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl mb-1">🏷️</div>
                <div className="text-sm text-gray-600">Categoria</div>
                <div className="font-semibold">{receita.categoria}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0">
            <Link
              to={`/receitas/${receita.receitaId}/editar`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              ✏️ Editar
            </Link>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              🗑️ Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowIngredients(!showIngredients)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              🥕 Ingredientes
              {ingredientes && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {ingredientes.length || 0}
                </span>
              )}
            </h2>
            <span className={`transform transition-transform ${showIngredients ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {showIngredients && (
          <div className="p-6">
            {loadingIngredientes ? (
              <Loading text="Carregando ingredientes..." />
            ) : ingredientes && ingredientes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ingredientes.map((ingrediente: ReceitaIngrediente, index: number) => (
                   <div key={`${ingrediente.receitaId}-${ingrediente.produtoId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center space-x-3">
                       <span className="text-2xl">🥄</span>
                       <div>
                         <div className="font-medium text-gray-900">
                           {ingrediente.produto?.nome || 'Produto não encontrado'}
                         </div>
                         <div className="text-sm text-gray-600">
                           {ingrediente.produto?.categoria || ''}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="font-semibold text-gray-900">
                         {ingrediente.quantidade} {ingrediente.unidadeMedida}
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🥕</div>
                <p className="text-gray-600 mb-4">Nenhum ingrediente cadastrado</p>
                <Link
                  to={`/receitas/${receita.receitaId}/editar`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Adicionar ingredientes
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow">
        <div 
          className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">📝 Modo de Preparo</h2>
            <span className={`transform transition-transform ${showInstructions ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
        
        {showInstructions && (
          <div className="p-6">
            {receita.modoPreparo ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {receita.modoPreparo}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">Modo de preparo não informado</p>
                <Link
                  to={`/receitas/${receita.receitaId}/editar`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Adicionar instruções
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {receita.notas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            💡 Notas
          </h3>
          <p className="text-yellow-700 whitespace-pre-wrap">{receita.notas}</p>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center">
        <Link
          to="/receitas"
          className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
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
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir a receita <strong>{receita.nomeReceita}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita e todos os ingredientes associados também serão removidos.
          </p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteReceitaMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
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