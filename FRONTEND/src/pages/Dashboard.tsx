import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReceitas, useProdutos, useUsers } from '../hooks/useApi';
import { Loading } from '../components';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  HomeIcon, 
  ChefHatIcon, 
  PackageIcon, 
  UsersIcon, 
  PlusIcon, 
  SearchIcon 
} from '../components/icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: receitas, isLoading: loadingReceitas } = useReceitas();
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();
  const { data: usuarios, isLoading: loadingUsuarios } = useUsers();

  const stats = useMemo(() => {
    const baseStats = [
      {
        name: 'Total de Receitas',
        value: receitas?.content?.length || 0,
        icon: <ChefHatIcon />,
        color: 'from-blue-500 to-blue-600',
        link: '/receitas'
      },
      {
        name: 'Total de Produtos',
        value: produtos?.content?.length || 0,
        icon: <PackageIcon />,
        color: 'from-green-500 to-green-600',
        link: '/produtos'
      }
    ];

    if (user?.role === 'ADMIN') {
      baseStats.push({
        name: 'Total de Usuários',
        value: usuarios?.content?.length || 0,
        icon: <UsersIcon />,
        color: 'from-purple-500 to-purple-600',
        link: '/usuarios'
      });
    }

    return baseStats;
  }, [receitas?.content?.length, produtos?.content?.length, usuarios?.content?.length, user?.role]);

  const quickActions = useMemo(() => [
    {
      name: 'Nova Receita',
      description: 'Criar uma nova receita',
      icon: <PlusIcon />,
      variant: 'primary' as const,
      link: '/receitas/nova'
    },
    {
      name: 'Novo Produto',
      description: 'Cadastrar um novo produto',
      icon: <PackageIcon />,
      variant: 'secondary' as const,
      link: '/produtos/novo'
    },
    {
      name: 'Buscar Receitas',
      description: 'Encontrar receitas por ingredientes',
      icon: <SearchIcon />,
      variant: 'outline' as const,
      link: '/receitas?search=true'
    }
  ], []);

  const recentReceitas = useMemo(() => {
    return receitas?.content?.slice(0, 5) || [];
  }, [receitas?.content]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <PageHeader
        title={`Bem-vindo, ${user?.username}!`}
        subtitle="Gerencie suas receitas e produtos de forma fácil e organizada."
        icon={<HomeIcon />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.link}>
            <Card hover className="h-full">
              <div className="flex items-center">
                <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingReceitas || loadingProdutos || loadingUsuarios ? (
                      <Loading size="sm" text="" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">
            Ações Rápidas
          </h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.name} to={action.link}>
                <Button
                  variant={action.variant}
                  size="lg"
                  icon={action.icon}
                  className="w-full h-auto flex-col py-6 gap-3"
                >
                  <span className="font-semibold">{action.name}</span>
                  <span className="text-sm opacity-90 font-normal">{action.description}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Recent Recipes */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Receitas Recentes
            </h2>
            <Link to="/receitas">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </Card.Header>
        <Card.Content>
        
          {loadingReceitas ? (
            <Loading text="Carregando receitas..." />
          ) : recentReceitas.length > 0 ? (
            <div className="space-y-3">
              {recentReceitas.map((receita) => (
                <Link
                  key={receita.receitaId}
                  to={`/receitas/${receita.receitaId}`}
                >
                  <Card hover padding="sm" className="border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{receita.nomeReceita}</h3>
                        <p className="text-sm text-gray-600">
                          {receita.categoria} • {receita.dificuldade}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {receita.tempoPreparo}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHatIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Nenhuma receita encontrada</p>
              <Link to="/receitas/nova">
                <Button icon={<PlusIcon />}>
                  Criar primeira receita
                </Button>
              </Link>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;