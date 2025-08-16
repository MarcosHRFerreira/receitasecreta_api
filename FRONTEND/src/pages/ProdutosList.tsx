import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProdutos, useDeleteProduto } from '../hooks/useApi';
import { Loading, Modal } from '../components';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  PackageIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  EditIcon, 
  DeleteIcon, 
  RefreshIcon 
} from '../components/icons';
import { useAuth } from '../contexts/AuthContextDefinition';
import type { Produto } from '../types';

const ProdutosList: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: produtosData, isLoading, error } = useProdutos();
  const deleteProdutoMutation = useDeleteProduto();

  // Função para verificar se o usuário atual NÃO é o autor do produto (para desabilitar botões)
  const isNotProdutoOwner = (produto: Produto): boolean => {
    if (!user || !produto.userId) return true; // Se não há usuário ou userId, desabilitar
    return produto.userId !== user.id; // Desabilitar se o usuário NÃO é o proprietário
  };

  const produtos = produtosData?.content || [];

  // Filtrar produtos
  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch = !searchTerm || 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || produto.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Atualizar URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('categoria', selectedCategory);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, setSearchParams]);

  const handleDelete = async () => {
    if (!produtoToDelete) return;
    
    try {
      await deleteProdutoMutation.mutateAsync(produtoToDelete.id);
      setDeleteModalOpen(false);
      setProdutoToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  const openDeleteModal = (produto: Produto) => {
    setProdutoToDelete(produto);
    setDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'INGREDIENTE_SECO': return '🥄';
      case 'BEBIDA_LACTEA': return '🥛';
      case 'LATICINIO': return '🧀';
      case 'VEGETAL': return '🥬';
      case 'FRUTA': return '🍎';
      case 'CARNE': return '🥩';
      case 'LACTEO': return '🥛';
      case 'CEREAL': return '🌾';
      case 'TEMPERO': return '🧄';
      case 'BEBIDA': return '🥤';
      case 'DOCE': return '🍯';
      case 'OUTRO': return '📦';
      default: return '🥄';
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Carregando produtos..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 text-lg mb-4">Erro ao carregar produtos</div>
        <Button 
          onClick={() => window.location.reload()}
          icon={<RefreshIcon />}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Produtos"
        subtitle="Gerencie seus ingredientes e produtos"
        icon={<PackageIcon />}
        actions={
          <Link to="/produtos/novo">
            <Button icon={<PlusIcon />}>
              Novo Produto
            </Button>
          </Link>
        }
      />
      {/* Filters */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <FilterIcon className="text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas as categorias</option>
                <option value="INGREDIENTE_SECO">Ingrediente Seco</option>
                <option value="BEBIDA_LACTEA">Bebida Láctea</option>
                <option value="LATICINIO">Laticínio</option>
                <option value="VEGETAL">Vegetal</option>
                <option value="FRUTA">Fruta</option>
                <option value="CARNE">Carne</option>
                <option value="LACTEO">Laticínio</option>
                <option value="CEREAL">Cereal</option>
                <option value="TEMPERO">Tempero</option>
                <option value="BEBIDA">Bebida</option>
                <option value="DOCE">Doce</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            {/* Actions */}
            <div className="sm:col-span-1 flex flex-col sm:items-end justify-end space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <span className="sm:hidden">Limpar Filtros</span>
                <span className="hidden sm:inline">Limpar</span>
              </Button>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm transition-colors flex items-center justify-center ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-3 py-2 text-sm transition-colors flex items-center justify-center ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>
          </Card.Content>
        </Card>

        {/* Results */}
        <Card>
        {filteredProdutos.length === 0 ? (
          <Card.Content>
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tente ajustar os filtros ou criar um novo produto.
              </p>
              <Link to="/produtos/novo">
                <Button icon={<PlusIcon />}>
                  Novo Produto
                </Button>
              </Link>
            </div>
          </Card.Content>
        ) : (
          <Card.Content>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {filteredProdutos.length} produto(s) encontrado(s)
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProdutos.map((produto) => (
                  <Card key={produto.id} hover>
                    <Card.Content>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getCategoryIcon(produto.categoria)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                            {produto.nome}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {produto.categoria}
                          </p>
                        </div>
                      </div>
                      
                      {produto.descricao && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {produto.descricao}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs sm:text-sm truncate">
                          {produto.categoria}
                        </span>
                        {/* Preço não disponível */}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        {isNotProdutoOwner(produto) ? (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={<EditIcon />} 
                            className="flex-1 opacity-50 cursor-not-allowed" 
                            disabled
                          >
                            <span className="sm:hidden">Editar Produto</span>
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                        ) : (
                          <Link to={`/produtos/${produto.id}/editar`} className="flex-1">
                            <Button variant="outline" size="sm" icon={<EditIcon />} className="w-full">
                              <span className="sm:hidden">Editar Produto</span>
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={() => openDeleteModal(produto)}
                          disabled={isNotProdutoOwner(produto)}
                          className={`sm:w-auto ${isNotProdutoOwner(produto) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProdutos.map((produto) => (
                  <Card key={produto.id} hover>
                    <Card.Content>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{getCategoryIcon(produto.categoria)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                              {produto.nome}
                            </h3>
                            {produto.descricao && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                                {produto.descricao}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="truncate">{produto.categoria}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 flex-shrink-0">
                          {isNotProdutoOwner(produto) ? (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              icon={<EditIcon />} 
                              className="opacity-50 cursor-not-allowed w-full sm:w-auto" 
                              disabled
                            >
                              <span className="sm:hidden">Editar Produto</span>
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          ) : (
                            <Link to={`/produtos/${produto.id}/editar`} className="w-full sm:w-auto">
                              <Button variant="outline" size="sm" icon={<EditIcon />} className="w-full">
                                <span className="sm:hidden">Editar Produto</span>
                                <span className="hidden sm:inline">Editar</span>
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => openDeleteModal(produto)}
                            disabled={isNotProdutoOwner(produto)}
                            className={`w-full sm:w-auto ${isNotProdutoOwner(produto) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span className="sm:hidden">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
          </Card.Content>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir o produto <strong>{produtoToDelete?.nome}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita. O produto será removido de todas as receitas que o utilizam.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteProdutoMutation.isPending}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {deleteProdutoMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProdutosList;