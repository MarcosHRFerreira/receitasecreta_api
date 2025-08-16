import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduto, useCreateProduto, useUpdateProduto } from '../hooks/useApi';
import type { ProdutoFormData } from '../types';
import { UnidadeMedida, CategoriaProduto } from '../types';
import { Loading } from '../components';

const ProdutoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: produto, isLoading: loadingProduto } = useProduto(id || '');
  const createProdutoMutation = useCreateProduto();
  const updateProdutoMutation = useUpdateProduto();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProdutoFormData>({
    defaultValues: {
         nome: '',
         categoriaproduto: CategoriaProduto.INGREDIENTE_SECO,
         unidademedida: UnidadeMedida.GRAMA,
         custoporunidade: 0,
         fornecedor: '',
         descricao: '',
         codigobarras: '',
         observacao: ''
       }
  });

  // Carregar dados do produto para edição
  useEffect(() => {
    if (isEditing && produto) {
      reset({
          nome: produto.nome,
          categoriaproduto: produto.categoriaproduto,
          unidademedida: produto.unidademedida,
          custoporunidade: produto.custoporunidade,
          fornecedor: produto.fornecedor,
          descricao: produto.descricao || '',
          codigobarras: produto.codigobarras || '',
          observacao: produto.observacao || ''
        });
    }
  }, [produto, reset, isEditing]);

  const onSubmit = async (data: ProdutoFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const produtoRequest = {
        nome: data.nome,
        unidademedida: data.unidademedida,
        custoporunidade: data.custoporunidade,
        categoriaproduto: data.categoriaproduto,
        fornecedor: data.fornecedor,
        descricao: data.descricao,
        codigobarras: data.codigobarras,
        observacao: data.observacao
      };

      if (isEditing && produto) {
        await updateProdutoMutation.mutateAsync({ id: produto.id, data: produtoRequest });
      } else {
        await createProdutoMutation.mutateAsync(produtoRequest);
      }

      navigate('/produtos');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Erro ao salvar produto. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'INGREDIENTE_SECO': return '🥄';
      case 'BEBIDA_LACTEA': return '🥛';
      case 'LATICINIO': return '🧀';
      default: return '🥄';
    }
  };

  if (isEditing && loadingProduto) {
    return <Loading fullScreen text="Carregando produto..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <Link
            to="/produtos"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Nome do Produto *
              </label>
              <input
                {...register('nome', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                type="text"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Tomate, Leite, Açúcar..."
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Unidade de Medida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unidade de Medida *
              </label>
              <select
                 {...register('unidademedida', { required: 'Unidade de medida é obrigatória' })}
                 className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               >
                 <option value="GRAMA">Grama (g)</option>
                 <option value="KILO">Quilograma (kg)</option>
                 <option value="LITRO">Litro (l)</option>
                 <option value="UNIDADE">Unidade</option>
                 <option value="COLHER">Colher</option>
                 <option value="XICARA">Xícara</option>
               </select>
              {errors.unidademedida && (
                <p className="mt-1 text-sm text-red-600">{errors.unidademedida.message}</p>
              )}
            </div>

            {/* Custo por Unidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custo por Unidade *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('custoporunidade', { 
                  required: 'Custo por unidade é obrigatório',
                  min: { value: 0, message: 'Custo deve ser maior ou igual a zero' }
                })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              {errors.custoporunidade && (
                <p className="mt-1 text-sm text-red-600">{errors.custoporunidade.message}</p>
              )}
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fornecedor *
              </label>
              <input
                type="text"
                {...register('fornecedor', { required: 'Fornecedor é obrigatório' })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do fornecedor"
              />
              {errors.fornecedor && (
                <p className="mt-1 text-sm text-red-600">{errors.fornecedor.message}</p>
              )}
            </div>

            {/* Código de Barras */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Código de Barras
               </label>
               <input
                 type="text"
                 {...register('codigobarras')}
                 className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Código de barras do produto (opcional)"
               />
               {errors.codigobarras && (
                 <p className="mt-1 text-sm text-red-600">{errors.codigobarras.message}</p>
               )}
             </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <textarea
                {...register('descricao', { required: 'Descrição é obrigatória' })}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição do produto..."
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
              )}
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observação
              </label>
              <textarea
                {...register('observacao')}
                rows={2}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observações adicionais sobre o produto (opcional)..."
              />
              {errors.observacao && (
                <p className="mt-1 text-sm text-red-600">{errors.observacao.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria *
              </label>
              <select
                {...register('categoriaproduto', { required: 'Categoria é obrigatória' })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="INGREDIENTE_SECO">🥄 Ingrediente Seco</option>
                <option value="BEBIDA_LACTEA">🥛 Bebida Láctea</option>
                <option value="LATICINIO">🧀 Laticínio</option>
              </select>
              {errors.categoriaproduto && (
                <p className="mt-1 text-sm text-red-600">{errors.categoriaproduto.message}</p>
              )}
            </div>




          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Pré-visualização</h3>
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">{getCategoryIcon('OUTRO')}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {register('nome').name ? 'Nome do produto' : 'Nome do produto'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Categoria • Unidade de medida
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-sm text-gray-500 dark:text-gray-400">Preço (se informado)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:justify-end">
            <Link
              to="/produtos"
              className="w-full sm:w-auto px-6 py-2 text-center text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {isLoading ? (
                <Loading size="sm" text="" />
              ) : (
                isEditing ? 'Atualizar Produto' : 'Criar Produto'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Help */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 Dicas</h3>
        <ul className="text-blue-800 dark:text-blue-300 space-y-2 text-xs sm:text-sm">
          <li>• Escolha nomes descritivos para facilitar a busca</li>
          <li>• A categoria ajuda na organização e filtros</li>
          <li>• A unidade de medida deve corresponder à forma como você usa o produto nas receitas</li>
          <li>• O preço é opcional e pode ajudar no controle de custos das receitas</li>
        </ul>
      </div>
    </div>
  );
};

export default ProdutoForm;