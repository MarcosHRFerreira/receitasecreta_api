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
import type { Produto } from '../types';

const ProdutosList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: produtosData, isLoading, error } = useProdutos();
  const deleteProdutoMutation = useDeleteProduto();

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
        <div className="text-red-600 text-lg mb-4">Erro ao carregar produtos</div>
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
            <FilterIcon className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Limpar
              </Button>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600 mb-4">
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
            <div className="mb-4 text-sm text-gray-600">
              {filteredProdutos.length} produto(s) encontrado(s)
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProdutos.map((produto) => (
                  <Card key={produto.id} hover>
                    <Card.Content>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getCategoryIcon(produto.categoria)}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {produto.nome}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {produto.categoria}
                          </p>
                        </div>
                      </div>
                      
                      {produto.descricao && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {produto.descricao}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {produto.categoria}
                        </span>
                        {/* Preço não disponível */}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link to={`/produtos/${produto.id}/editar`} className="flex-1">
                          <Button variant="outline" size="sm" icon={<EditIcon />} className="w-full">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={() => openDeleteModal(produto)}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <span className="text-2xl">{getCategoryIcon(produto.categoria)}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {produto.nome}
                            </h3>
                            {produto.descricao && (
                              <p className="text-gray-600 text-sm mt-1">
                                {produto.descricao}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{produto.categoria}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link to={`/produtos/${produto.id}/editar`}>
                            <Button variant="outline" size="sm" icon={<EditIcon />}>
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => openDeleteModal(produto)}
                          />
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
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteProdutoMutation.isPending}
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