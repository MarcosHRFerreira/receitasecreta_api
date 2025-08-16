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
    <div className="space-y-6 animate-fade-in" role="main">
      {/* Welcome Header */}
      <div className="animate-slide-down" role="banner">
        <PageHeader
          title={`Bem-vindo, ${user?.username}!`}
          subtitle="Gerencie suas receitas e produtos de forma fácil e organizada."
          icon={<HomeIcon />}
        />
      </div>

      {/* Stats Cards */}
      <section 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-children"
        role="region"
        aria-label="Estatísticas do sistema"
      >
        {stats.map((stat) => (
          <Link 
            key={stat.name} 
            to={stat.link} 
            className="group"
            aria-label={`Ver detalhes de ${stat.name}: ${stat.value} itens`}
          >
            <Card 
              hover 
              className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform"
              role="article"
              ariaLabel={`Estatística: ${stat.name}`}
            >
              <div className="flex items-center">
                <div 
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110`}
                  role="img"
                  aria-label={`Ícone de ${stat.name}`}
                >
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    {loadingReceitas || loadingProdutos || loadingUsuarios ? (
                      <Loading size="sm" text="" ariaLabel="Carregando estatísticas" />
                    ) : (
                      <span className="animate-fade-in-up" aria-label={`${stat.value} ${stat.name.toLowerCase()}`}>{stat.value}</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="animate-fade-in-delay" role="region" aria-label="Ações rápidas">
        <Card 
          className="transition-all duration-300 hover:shadow-lg"
          role="region"
          ariaLabel="Seção de ações rápidas"
        >
          <Card.Header>
            <h2 
              className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200"
              id="quick-actions-heading"
            >
              Ações Rápidas
            </h2>
          </Card.Header>
          <Card.Content>
            <nav 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-stagger-children"
              role="navigation"
              aria-labelledby="quick-actions-heading"
            >
              {quickActions.map((action) => (
                <Link 
                  key={action.name} 
                  to={action.link}
                  aria-label={`${action.name}: ${action.description}`}
                >
                  <Button
                    variant={action.variant}
                    size="lg"
                    icon={action.icon}
                    className="w-full h-auto flex-col py-6 gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl transform"
                    ariaLabel={`${action.name}: ${action.description}`}
                  >
                    <span className="font-semibold">{action.name}</span>
                    <span className="text-sm opacity-90 font-normal">{action.description}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </Card.Content>
        </Card>
      </section>

      {/* Recent Recipes */}
      <section className="animate-fade-in-up" role="region" aria-label="Receitas recentes">
        <Card 
          className="transition-all duration-300 hover:shadow-lg"
          role="region"
          ariaLabel="Seção de receitas recentes"
        >
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 
                className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200"
                id="recent-recipes-heading"
              >
                Receitas Recentes
              </h2>
              <Link 
                to="/receitas"
                aria-label="Ver todas as receitas"
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105"
                  ariaLabel="Ver todas as receitas"
                >
                  Ver todas
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {loadingReceitas ? (
              <div className="animate-pulse" role="status" aria-live="polite">
                <Loading text="Carregando receitas..." ariaLabel="Carregando lista de receitas recentes" />
              </div>
            ) : recentReceitas.length > 0 ? (
              <nav 
                className="space-y-3 animate-stagger-children"
                role="navigation"
                aria-labelledby="recent-recipes-heading"
                aria-label="Lista de receitas recentes"
              >
                {recentReceitas.map((receita) => (
                  <Link
                    key={receita.receitaId}
                    to={`/receitas/${receita.receitaId}`}
                    className="group"
                    aria-label={`Ver receita: ${receita.nomeReceita}, categoria ${receita.categoria}, dificuldade ${receita.dificuldade}, tempo de preparo ${receita.tempoPreparo}`}
                  >
                    <Card 
                      hover 
                      padding="sm" 
                      className="border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:scale-[1.01] transform group-hover:border-amber-300 dark:group-hover:border-amber-600"
                      role="article"
                      ariaLabel={`Receita: ${receita.nomeReceita}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">{receita.nomeReceita}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                            {receita.categoria} • {receita.dificuldade}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          {receita.tempoPreparo}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </nav>
            ) : (
              <div className="text-center py-8 animate-fade-in" role="region" aria-label="Estado vazio - nenhuma receita encontrada">
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110"
                  role="img"
                  aria-label="Ícone de receita vazia"
                >
                  <ChefHatIcon size={32} className="text-gray-400 dark:text-gray-300" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">Nenhuma receita encontrada</p>
                <Link 
                  to="/receitas/nova"
                  aria-label="Criar sua primeira receita"
                >
                  <Button 
                    icon={<PlusIcon />} 
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    ariaLabel="Criar primeira receita"
                  >
                    Criar primeira receita
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;