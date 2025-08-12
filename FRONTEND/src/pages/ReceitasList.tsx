import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useReceitas, useDeleteReceita } from '../hooks/useApi';
import { Loading, Modal } from '../components';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  ChefHatIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  EditIcon, 
  DeleteIcon, 
  ViewIcon,
  RefreshIcon 
} from '../components/icons';
import type { Receita } from '../types';

const ReceitasList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('dificuldade') || '');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState<Receita | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: receitasData, isLoading, error } = useReceitas();
  const deleteReceitaMutation = useDeleteReceita();

  const receitas = receitasData?.content || [];

  // Filtrar receitas
  const filteredReceitas = receitas.filter((receita) => {
    const matchesSearch = !searchTerm || 
      receita.nomeReceita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receita.notas?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || receita.categoria === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || receita.dificuldade === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Atualizar URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('categoria', selectedCategory);
    if (selectedDifficulty) params.set('dificuldade', selectedDifficulty);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, setSearchParams]);

  const handleDelete = async () => {
    if (!receitaToDelete) return;
    
    try {
      await deleteReceitaMutation.mutateAsync(receitaToDelete.receitaId);
      setDeleteModalOpen(false);
      setReceitaToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
    }
  };

  const openDeleteModal = (receita: Receita) => {
    setReceitaToDelete(receita);
    setDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  if (isLoading) {
    return <Loading fullScreen text="Carregando receitas..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Erro ao carregar receitas</div>
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
        title="Receitas"
        subtitle="Gerencie suas receitas culinárias"
        icon={<ChefHatIcon />}
        actions={
          <Link to="/receitas/nova">
            <Button icon={<PlusIcon />}>
              Nova Receita
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
          <div>
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
              <option value="ENTRADA">Entrada</option>
              <option value="PRATO_PRINCIPAL">Prato Principal</option>
              <option value="SOBREMESA">Sobremesa</option>
              <option value="BEBIDA">Bebida</option>
              <option value="LANCHE">Lanche</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificuldade
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Todas as dificuldades</option>
              <option value="FACIL">Fácil</option>
              <option value="COMPLEXA">Complexa</option>
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
        {filteredReceitas.length === 0 ? (
          <Card.Content>
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma receita encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou criar uma nova receita.
              </p>
              <Link to="/receitas/nova">
                <Button icon={<PlusIcon />}>
                  Nova Receita
                </Button>
              </Link>
            </div>
          </Card.Content>
        ) : (
          <Card.Content>
            <div className="mb-4 text-sm text-gray-600">
              {filteredReceitas.length} receita(s) encontrada(s)
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReceitas.map((receita) => (
                  <Card key={receita.receitaId} hover>
                    <Card.Content>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {receita.nomeReceita}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {receita.notas}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {receita.categoria}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          receita.dificuldade === 'FACIL' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {receita.dificuldade}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        ⏱️ {receita.tempoPreparo} min • 👥 {receita.rendimento} porções
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/receitas/${receita.receitaId}`} className="flex-1">
                          <Button variant="outline" size="sm" icon={<ViewIcon />} className="w-full">
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/receitas/${receita.receitaId}/editar`} className="flex-1">
                          <Button variant="secondary" size="sm" icon={<EditIcon />} className="w-full">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={() => openDeleteModal(receita)}
                        />
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceitas.map((receita) => (
                  <Card key={receita.receitaId} hover>
                    <Card.Content>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {receita.nomeReceita}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {receita.notas}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{receita.categoria}</span>
                            <span>{receita.dificuldade}</span>
                            <span>⏱️ {receita.tempoPreparo}</span>
                            <span>👥 {receita.rendimento}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link to={`/receitas/${receita.receitaId}`}>
                            <Button variant="outline" size="sm" icon={<ViewIcon />}>
                              Ver
                            </Button>
                          </Link>
                          <Link to={`/receitas/${receita.receitaId}/editar`}>
                            <Button variant="secondary" size="sm" icon={<EditIcon />}>
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => openDeleteModal(receita)}
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
            Tem certeza que deseja excluir a receita <strong>{receitaToDelete?.nomeReceita}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita.
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
              disabled={deleteReceitaMutation.isPending}
            >
              {deleteReceitaMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReceitasList;