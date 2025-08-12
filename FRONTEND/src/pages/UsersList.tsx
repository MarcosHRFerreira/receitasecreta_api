import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../hooks/useApi';
import { Loading, Modal } from '../components';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  UsersIcon, 
  SearchIcon, 
  FilterIcon, 
  DeleteIcon,
  RefreshIcon,
  UserIcon,
  AdminIcon
} from '../components/icons';
import type { User } from '../types';
import { useAuth } from '../hooks/useAuth';

const UsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: usersData, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const users = useMemo(() => usersData?.content || [], [usersData?.content]);

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !selectedRole || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  // Atualizar URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedRole) params.set('role', selectedRole);
    setSearchParams(params);
  }, [searchTerm, selectedRole, setSearchParams]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'USER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'USER': return '👤';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <Loading fullScreen text="Carregando usuários..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Erro ao carregar usuários</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="primary"
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
        title="Usuários"
        subtitle="Gerencie os usuários do sistema"
        icon={<UsersIcon />}
      />

      {/* Filters */}
      <Card>
        <Card.Header>
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome de usuário ou e-mail..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Todas as funções</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="USER">Usuário</option>
                </select>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <Card.Content>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
                <UsersIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card hover>
          <Card.Content>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
                <AdminIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card hover>
          <Card.Content>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
                <UserIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Comuns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'USER').length}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Results */}
      <Card>
        {filteredUsers.length === 0 ? (
          <Card.Content>
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          </Card.Content>
        ) : (
          <Card.Content>
            <div className="mb-4 text-sm text-gray-600">
              {filteredUsers.length} usuário(s) encontrado(s)
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getRoleIcon(user.role)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.id !== currentUser?.id && (
                          <Button
                            onClick={() => openDeleteModal(user)}
                            variant="danger"
                            size="sm"
                            icon={<DeleteIcon />}
                          >
                            Excluir
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.username}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita. Todas as receitas criadas por este usuário serão mantidas.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              variant="danger"
            >
              {deleteUserMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersList;