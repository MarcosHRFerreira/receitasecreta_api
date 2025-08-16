import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useReceitas, useDeleteReceita } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContextDefinition';
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
  const { user } = useAuth();
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

  const isNotReceitaOwner = (receita: Receita): boolean => {
    if (!user || !receita.userId) return true;
    return receita.userId !== user.id;
  };

  const filteredReceitas = receitas.filter((receita) => {
    const matchesSearch = !searchTerm || 
      receita.nomeReceita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receita.notas?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || receita.categoria === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || receita.dificuldade === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('categoria', selectedCategory);
    if (selectedDifficulty) params.set('dificuldade', selectedDifficulty);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, setSearchParams]);

  const openDeleteModal = (receita: Receita) => {
    setReceitaToDelete(receita);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (receitaToDelete) {
      try {
        await deleteReceitaMutation.mutateAsync(receitaToDelete.id);
        setDeleteModalOpen(false);
        setReceitaToDelete(null);
      } catch (error) {
        console.error('Erro ao deletar receita:', error);
      }
    }
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
          variant="primary"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-down">
        <PageHeader 
          title="Receitas"
          subtitle="Gerencie suas receitas culinárias"
          icon={<ChefHatIcon />}
        >
          <Link to="/receitas/nova">
            <Button icon={<PlusIcon />} className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Nova Receita
            </Button>
          </Link>
        </PageHeader>
      </div>

      <div className="animate-fade-in-delay">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <Card.Header>
            <div className="flex items-center gap-2">
              <FilterIcon className="text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {/* Search Bar - Full width on mobile */}
              <div>
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Filters Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="BOLO">Bolo</option>
                    <option value="TORTA">Torta</option>
                    <option value="DOCE">Doce</option>
                    <option value="SALGADO">Salgado</option>
                    <option value="BEBIDA">Bebida</option>
                    <option value="ENTRADA">Entrada</option>
                    <option value="PRATO_PRINCIPAL">Prato Principal</option>
                    <option value="SOBREMESA">Sobremesa</option>
                    <option value="LANCHE">Lanche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dificuldade
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todas as dificuldades</option>
                    <option value="FACIL">Fácil</option>
                    <option value="MEDIA">Média</option>
                    <option value="COMPLEXA">Complexa</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ações
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Limpar
                    </Button>
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 flex items-center gap-1 ${
                          viewMode === 'grid'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <GridIcon className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Grid</span>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 flex items-center gap-1 ${
                          viewMode === 'list'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <ListIcon className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Lista</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Results Section */}
      <div className="animate-fade-in-up">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {filteredReceitas.length} receita(s) encontrada(s)
              </h3>
            </div>
          </Card.Header>
          <Card.Content>
            {filteredReceitas.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <ChefHatIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma receita encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Tente ajustar os filtros ou criar uma nova receita.
                </p>
                <Link to="/receitas/nova">
                  <Button icon={<PlusIcon />}>
                    Criar Nova Receita
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredReceitas.map((receita) => (
                      <Card key={receita.receitaId} className="transition-all duration-300 hover:shadow-lg hover:scale-105">
                        <Card.Content className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
                              {receita.nomeReceita}
                            </h4>
                            <span className="text-2xl flex-shrink-0">🍽️</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {receita.notas}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-center">
                              {receita.categoria}
                            </span>
                            <span className={`px-2 py-1 rounded text-center ${
                              receita.dificuldade === 'FACIL' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {receita.dificuldade}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center sm:text-left">
                            ⏱️ {receita.tempoPreparo} min • 👥 {receita.rendimento} porções
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link to={`/receitas/${receita.receitaId}`} className="flex-1">
                              <Button variant="primary" size="sm" icon={<ViewIcon />} className="w-full">
                                <span className="hidden sm:inline">Ver</span>
                                <span className="sm:hidden">Visualizar</span>
                              </Button>
                            </Link>
                            <div className="flex gap-2">
                              {!isNotReceitaOwner(receita) && (
                                <Link to={`/receitas/${receita.receitaId}/editar`} className="flex-1 sm:flex-none">
                                  <Button variant="secondary" size="sm" icon={<EditIcon />} className="w-full sm:w-auto">
                                    <span className="sm:hidden">Editar</span>
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<DeleteIcon />}
                                onClick={() => openDeleteModal(receita)}
                                disabled={isNotReceitaOwner(receita)}
                                className={`flex-1 sm:flex-none ${isNotReceitaOwner(receita) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span className="sm:hidden">Excluir</span>
                              </Button>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReceitas.map((receita) => (
                      <Card key={receita.receitaId} className="transition-all duration-300 hover:shadow-lg">
                        <Card.Content className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">🍽️</span>
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {receita.nomeReceita}
                                  </h4>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs self-start sm:self-center ${
                                  receita.dificuldade === 'FACIL' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {receita.dificuldade}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                {receita.notas}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">{receita.categoria}</span>
                                <span>⏱️ {receita.tempoPreparo} min</span>
                                <span>👥 {receita.rendimento} porções</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                              <Link to={`/receitas/${receita.receitaId}`} className="flex-1 sm:flex-none">
                                <Button variant="primary" size="sm" icon={<ViewIcon />} className="w-full sm:w-auto">
                                  <span className="hidden sm:inline">Ver</span>
                                  <span className="sm:hidden">Visualizar Receita</span>
                                </Button>
                              </Link>
                              {!isNotReceitaOwner(receita) && (
                                <Link to={`/receitas/${receita.receitaId}/editar`} className="flex-1 sm:flex-none">
                                  <Button variant="secondary" size="sm" icon={<EditIcon />} className="w-full sm:w-auto">
                                    <span className="hidden sm:inline">Editar</span>
                                    <span className="sm:hidden">Editar Receita</span>
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<DeleteIcon />}
                                onClick={() => openDeleteModal(receita)}
                                disabled={isNotReceitaOwner(receita)}
                                className={`flex-1 sm:flex-none ${isNotReceitaOwner(receita) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <span className="hidden sm:inline">Excluir</span>
                                <span className="sm:hidden">Excluir Receita</span>
                              </Button>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4 animate-fade-in">
          <p className="text-gray-600 animate-fade-in-delay">
            Tem certeza que deseja excluir a receita <strong>{receitaToDelete?.nomeReceita}</strong>?
          </p>
          <p className="text-sm text-red-600 animate-shake-and-fade-in">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:justify-end animate-stagger-children">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="w-full sm:w-auto transition-all duration-300 hover:scale-105 order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteReceitaMutation.isPending}
              className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg order-1 sm:order-2"
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