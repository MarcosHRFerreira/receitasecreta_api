import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '../../../../components/ui/PageHeader';
import { ChefHatIcon, PlusIcon } from '../../../../components/icons';
import Button from '../../../../components/ui/Button';

describe('PageHeader Component', () => {
  describe('Renderização básica', () => {
    it('deve renderizar com título obrigatório', () => {
      render(<PageHeader title="Título da Página" />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Título da Página')).toBeInTheDocument();
    });

    it('deve aplicar classes base corretas', () => {
      render(<PageHeader title="Título" />);
      
      // O container principal é o div mais externo
      const container = document.querySelector('.bg-white.rounded-xl.shadow-sm');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass(
        'bg-white',
        'rounded-xl',
        'shadow-sm',
        'border',
        'border-gray-100',
        'p-6',
        'mb-6'
      );
    });
  });

  describe('Título', () => {
    it('deve renderizar título com classes corretas', () => {
      render(<PageHeader title="Meu Título" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Meu Título');
      expect(title).toHaveClass(
        'text-2xl',
        'font-bold',
        'text-gray-900',
        'tracking-tight'
      );
    });

    it('deve renderizar títulos longos corretamente', () => {
      const longTitle = 'Este é um título muito longo para testar como o componente se comporta com textos extensos';
      render(<PageHeader title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('deve renderizar títulos com caracteres especiais', () => {
      const specialTitle = 'Título com ñáéíóú & símbolos 123!';
      render(<PageHeader title={specialTitle} />);
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe('Subtítulo', () => {
    it('deve renderizar subtítulo quando fornecido', () => {
      render(
        <PageHeader 
          title="Título" 
          subtitle="Este é o subtítulo da página" 
        />
      );
      
      const subtitle = screen.getByText('Este é o subtítulo da página');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('text-gray-600', 'mt-1', 'text-sm');
    });

    it('não deve renderizar subtítulo quando não fornecido', () => {
      render(<PageHeader title="Título" />);
      
      const subtitle = document.querySelector('.text-gray-600.mt-1.text-sm');
      expect(subtitle).not.toBeInTheDocument();
    });

    it('deve renderizar subtítulo vazio', () => {
      render(<PageHeader title="Título" subtitle="" />);
      
      // Quando subtitle é string vazia, o elemento <p> não é renderizado
      const subtitleElement = document.querySelector('p.text-gray-600');
      expect(subtitleElement).not.toBeInTheDocument();
    });
  });

  describe('Ícone', () => {
    it('deve renderizar ícone quando fornecido', () => {
      const TestIcon = () => <span data-testid="test-icon">🏠</span>;
      render(<PageHeader title="Título" icon={<TestIcon />} />);

      // O ícone é renderizado dentro de uma div com classes específicas
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      
      // Verifica se o container do ícone existe
      const iconContainer = screen.getByTestId('test-icon').closest('div');
      expect(iconContainer).toHaveClass('w-12', 'h-12');
    });

    it('deve aplicar classes corretas no container do ícone', () => {
      render(
        <PageHeader 
          title="Título" 
          icon={<ChefHatIcon data-testid="page-icon" />} 
        />
      );
      
      const iconContainer = screen.getByTestId('page-icon').parentElement;
      expect(iconContainer).toHaveClass(
        'w-12',
        'h-12',
        'bg-gradient-to-br',
        'from-blue-500',
        'to-blue-600',
        'rounded-xl',
        'flex',
        'items-center',
        'justify-center',
        'text-white',
        'text-2xl',
        'shadow-lg'
      );
    });

    it('não deve renderizar ícone quando não fornecido', () => {
      render(<PageHeader title="Título" />);

      // Verifica se não há container de ícone
      const iconContainer = document.querySelector('.w-12.h-12');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('deve posicionar ícone antes do título', () => {
      render(
        <PageHeader 
          title="Título" 
          icon={<ChefHatIcon data-testid="page-icon" />} 
        />
      );
      
      const contentContainer = screen.getByTestId('page-icon').closest('.flex.items-center.gap-4');
      const iconContainer = screen.getByTestId('page-icon').parentElement;
      const titleContainer = screen.getByRole('heading').parentElement;
      
      expect(contentContainer?.firstChild).toBe(iconContainer?.parentElement);
      expect(contentContainer?.lastChild).toBe(titleContainer);
    });
  });

  describe('Actions', () => {
    it('deve renderizar actions quando fornecidas', () => {
      render(
        <PageHeader 
          title="Título" 
          actions={
            <Button data-testid="action-button">
              <PlusIcon /> Adicionar
            </Button>
          }
        />
      );
      
      const actionButton = screen.getByTestId('action-button');
      expect(actionButton).toBeInTheDocument();
      expect(screen.getByText('Adicionar')).toBeInTheDocument();
    });

    it('deve aplicar classes corretas no container de actions', () => {
      render(
        <PageHeader 
          title="Título" 
          actions={
            <Button data-testid="action-button">Ação</Button>
          }
        />
      );
      
      const actionsContainer = screen.getByTestId('action-button').parentElement;
      expect(actionsContainer).toHaveClass('flex-shrink-0');
    });

    it('não deve renderizar container de actions quando actions não são fornecidas', () => {
      render(<PageHeader title="Título" />);
      
      const actionsContainer = document.querySelector('.flex-shrink-0');
      expect(actionsContainer).not.toBeInTheDocument();
    });

    it('deve renderizar múltiplas actions', () => {
      render(
        <PageHeader 
          title="Título" 
          actions={
            <div className="flex gap-2">
              <Button data-testid="action-1">Ação 1</Button>
              <Button data-testid="action-2">Ação 2</Button>
            </div>
          }
        />
      );
      
      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
    });
  });

  describe('Layout e responsividade', () => {
    it('deve aplicar classes de layout responsivo', () => {
      render(<PageHeader title="Título" />);
      
      const layoutContainer = screen.getByRole('heading').closest('.flex.flex-col.sm\\:flex-row');
      expect(layoutContainer).toHaveClass(
        'flex',
        'flex-col',
        'sm:flex-row',
        'sm:items-center',
        'sm:justify-between',
        'gap-4'
      );
    });

    it('deve aplicar classes corretas no container de conteúdo', () => {
      render(
        <PageHeader 
          title="Título" 
          icon={<ChefHatIcon data-testid="icon" />}
        />
      );
      
      const contentContainer = screen.getByTestId('icon').closest('.flex.items-center.gap-4');
      expect(contentContainer).toHaveClass('flex', 'items-center', 'gap-4');
    });

    it('deve aplicar flex-shrink-0 no container do ícone', () => {
      render(
        <PageHeader 
          title="Título" 
          icon={<ChefHatIcon data-testid="icon" />}
        />
      );
      
      const iconWrapper = screen.getByTestId('icon').closest('.flex-shrink-0');
      expect(iconWrapper).toHaveClass('flex-shrink-0');
    });
  });

  describe('ClassName customizada', () => {
    it('deve aplicar className customizada', () => {
      render(
        <PageHeader 
          title="Título" 
          className="custom-header-class" 
        />
      );
      
      const header = document.querySelector('.custom-header-class');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('custom-header-class');
    });

    it('deve combinar className customizada com classes base', () => {
      render(
        <PageHeader 
          title="Título" 
          className="custom-class" 
        />
      );
      
      const header = document.querySelector('.custom-class');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        'custom-class',
        'bg-white',
        'rounded-xl',
        'shadow-sm',
        'border',
        'border-gray-100',
        'p-6',
        'mb-6'
      );
    });
  });

  describe('Composição completa', () => {
    it('deve renderizar todos os elementos quando fornecidos', () => {
      render(
        <PageHeader 
          title="Página Completa"
          subtitle="Subtítulo da página"
          icon={<ChefHatIcon data-testid="complete-icon" />}
          actions={
            <Button data-testid="complete-action">
              <PlusIcon /> Nova Receita
            </Button>
          }
          className="complete-header"
        />
      );
      
      // Verificar todos os elementos
      expect(screen.getByText('Página Completa')).toBeInTheDocument();
      expect(screen.getByText('Subtítulo da página')).toBeInTheDocument();
      expect(screen.getByTestId('complete-icon')).toBeInTheDocument();
      expect(screen.getByTestId('complete-action')).toBeInTheDocument();
      expect(screen.getByText('Nova Receita')).toBeInTheDocument();
      
      // Verificar classe customizada
      const header = document.querySelector('.complete-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('complete-header');
    });

    it('deve manter hierarquia correta dos elementos', () => {
      render(
        <PageHeader 
          title="Título"
          subtitle="Subtítulo"
          icon={<span data-testid="hierarchy-icon">🏠</span>}
          actions={<Button data-testid="hierarchy-action">Ação</Button>}
        />
      );
      
      // Verifica se todos os elementos estão presentes
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('Subtítulo')).toBeInTheDocument();
      expect(screen.getByTestId('hierarchy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('hierarchy-action')).toBeInTheDocument();
      
      // Verifica se o ícone está dentro de um container com flex-shrink-0
      const iconContainer = screen.getByTestId('hierarchy-icon').closest('.flex-shrink-0');
      expect(iconContainer).toBeInTheDocument();
      
      // Verifica se a ação está dentro de um container com flex-shrink-0
      const actionContainer = screen.getByTestId('hierarchy-action').closest('.flex-shrink-0');
      expect(actionContainer).toBeInTheDocument();
    });
  });

  describe('Casos extremos', () => {
    it('deve funcionar com título muito longo', () => {
      const veryLongTitle = 'A'.repeat(200);
      render(<PageHeader title={veryLongTitle} />);
      
      expect(screen.getByText(veryLongTitle)).toBeInTheDocument();
    });

    it('deve funcionar com subtítulo muito longo', () => {
      const veryLongSubtitle = 'B'.repeat(300);
      render(
        <PageHeader 
          title="Título" 
          subtitle={veryLongSubtitle} 
        />
      );
      
      expect(screen.getByText(veryLongSubtitle)).toBeInTheDocument();
    });

    it('deve funcionar com actions complexas', () => {
      render(
        <PageHeader 
          title="Título" 
          actions={
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" variant="outline">Filtrar</Button>
              <Button size="sm" variant="secondary">Exportar</Button>
              <Button size="sm" variant="primary">Adicionar</Button>
            </div>
          }
        />
      );
      
      expect(screen.getByText('Filtrar')).toBeInTheDocument();
      expect(screen.getByText('Exportar')).toBeInTheDocument();
      expect(screen.getByText('Adicionar')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter heading com nível correto', () => {
      render(<PageHeader title="Título Acessível" />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Título Acessível');
    });

    it('deve manter estrutura semântica correta', () => {
      render(
        <PageHeader 
          title="Título Principal"
          subtitle="Subtítulo descritivo"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Subtítulo descritivo');
      
      expect(heading.tagName).toBe('H1');
      expect(subtitle.tagName).toBe('P');
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      render(
        <PageHeader 
          title="Performance Test"
          subtitle="Testing render performance"
          icon={<ChefHatIcon />}
          actions={<Button>Action</Button>}
        />
      );
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Menos de 50ms
    });
  });
});