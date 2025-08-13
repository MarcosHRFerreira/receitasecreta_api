import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../../../components/Loading';

describe('Loading Component', () => {
  describe('Renderização básica', () => {
    it('deve renderizar com texto padrão', () => {
      render(<Loading />);
      
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('deve renderizar spinner', () => {
      render(<Loading />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'border-2', 'border-gray-300', 'border-t-blue-600');
    });

    it('deve renderizar com texto customizado', () => {
      render(<Loading text="Processando..." />);
      
      expect(screen.getByText('Processando...')).toBeInTheDocument();
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    it('deve renderizar sem texto quando text é string vazia', () => {
      render(<Loading text="" />);
      
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      // Spinner ainda deve estar presente
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho md por padrão', () => {
      render(<Loading />);
      
      const spinner = document.querySelector('.animate-spin');
      const text = screen.getByText('Carregando...');
      
      expect(spinner).toHaveClass('h-8', 'w-8');
      expect(text).toHaveClass('text-base');
    });

    it('deve aplicar tamanho sm', () => {
      render(<Loading size="sm" />);
      
      const spinner = document.querySelector('.animate-spin');
      const text = screen.getByText('Carregando...');
      
      expect(spinner).toHaveClass('h-4', 'w-4');
      expect(text).toHaveClass('text-sm');
    });

    it('deve aplicar tamanho lg', () => {
      render(<Loading size="lg" />);
      
      const spinner = document.querySelector('.animate-spin');
      const text = screen.getByText('Carregando...');
      
      expect(spinner).toHaveClass('h-12', 'w-12');
      expect(text).toHaveClass('text-lg');
    });
  });

  describe('Modo fullScreen', () => {
    it('deve renderizar em modo normal por padrão', () => {
      render(<Loading />);
      
      const container = screen.getByText('Carregando...').closest('div');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'space-y-2');
      expect(container).not.toHaveClass('fixed', 'inset-0');
    });

    it('deve renderizar em modo fullScreen', () => {
      render(<Loading fullScreen />);
      
      const fullScreenContainer = document.querySelector('.fixed.inset-0');
      expect(fullScreenContainer).toBeInTheDocument();
      expect(fullScreenContainer).toHaveClass(
        'fixed',
        'inset-0',
        'bg-white',
        'bg-opacity-75',
        'flex',
        'items-center',
        'justify-center',
        'z-50'
      );
    });

    it('deve manter conteúdo interno em modo fullScreen', () => {
      render(<Loading fullScreen text="Carregando dados..." />);
      
      expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Estrutura e layout', () => {
    it('deve ter estrutura flex correta', () => {
      render(<Loading />);
      
      const container = screen.getByText('Carregando...').closest('div');
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'space-y-2'
      );
    });

    it('deve posicionar spinner antes do texto', () => {
      render(<Loading text="Aguarde..." />);
      
      const container = screen.getByText('Aguarde...').closest('div');
      const spinner = container?.querySelector('.animate-spin');
      const text = screen.getByText('Aguarde...');
      
      expect(container?.firstChild).toBe(spinner);
      expect(container?.lastChild).toBe(text);
    });
  });

  describe('Estilos do spinner', () => {
    it('deve aplicar classes de animação e cores corretas', () => {
      render(<Loading />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-2',
        'border-gray-300',
        'border-t-blue-600'
      );
    });

    it('deve manter classes de spinner em todos os tamanhos', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(<Loading size={size} />);
        
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toHaveClass(
          'animate-spin',
          'rounded-full',
          'border-2',
          'border-gray-300',
          'border-t-blue-600'
        );
        
        unmount();
      });
    });
  });

  describe('Estilos do texto', () => {
    it('deve aplicar cor correta do texto', () => {
      render(<Loading />);
      
      const text = screen.getByText('Carregando...');
      expect(text).toHaveClass('text-gray-600');
    });

    it('deve manter cor do texto em todos os tamanhos', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(<Loading size={size} />);
        
        const text = screen.getByText('Carregando...');
        expect(text).toHaveClass('text-gray-600');
        
        unmount();
      });
    });
  });

  describe('Casos de uso específicos', () => {
    it('deve funcionar com texto muito longo', () => {
      const longText = 'Este é um texto muito longo para testar como o componente se comporta com textos extensos que podem quebrar em múltiplas linhas';
      render(<Loading text={longText} />);
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('deve funcionar com caracteres especiais no texto', () => {
      const specialText = 'Carregando... 🔄 100% ñáéíóú';
      render(<Loading text={specialText} />);
      
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('deve renderizar múltiplas instâncias independentemente', () => {
      render(
        <div>
          <Loading text="Loading 1" size="sm" />
          <Loading text="Loading 2" size="lg" fullScreen={false} />
        </div>
      );
      
      expect(screen.getByText('Loading 1')).toBeInTheDocument();
      expect(screen.getByText('Loading 2')).toBeInTheDocument();
      
      const spinners = document.querySelectorAll('.animate-spin');
      expect(spinners).toHaveLength(2);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter texto visível para screen readers', () => {
      render(<Loading />);
      
      const text = screen.getByText('Carregando...');
      expect(text).toBeVisible();
    });

    it('deve manter acessibilidade em modo fullScreen', () => {
      render(<Loading fullScreen />);
      
      const text = screen.getByText('Carregando...');
      expect(text).toBeVisible();
    });

    it('deve ser possível encontrar por texto', () => {
      render(<Loading text="Processando dados" />);
      
      expect(screen.getByText('Processando dados')).toBeInTheDocument();
    });
  });

  describe('Performance e otimização', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      render(<Loading />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
    });

    it('deve limpar recursos corretamente ao desmontar', () => {
      const { unmount } = render(<Loading fullScreen />);
      
      expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument();
      
      unmount();
      
      expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    });
  });
});