import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../../components/ui/Button';
import { ChefHatIcon } from '../../../../components/icons';

describe('Button Component', () => {
  describe('Renderização básica', () => {
    it('deve renderizar com texto correto', () => {
      render(<Button>Clique aqui</Button>);
      
      expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument();
    });

    it('deve renderizar sem children', () => {
      render(<Button />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('deve aplicar className customizada', () => {
      render(<Button className="custom-class">Botão</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Variantes de estilo', () => {
    it('deve aplicar variante primary por padrão', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-700');
    });

    it('deve aplicar variante secondary', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-gray-600', 'to-gray-700');
    });

    it('deve aplicar variante danger', () => {
      render(<Button variant="danger">Danger</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-red-600', 'to-red-700');
    });

    it('deve aplicar variante outline', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-gray-300', 'text-gray-700');
    });

    it('deve aplicar variante ghost', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-600', 'hover:text-gray-900', 'hover:bg-gray-100');
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho md por padrão', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'gap-2');
    });

    it('deve aplicar tamanho sm', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'gap-1.5');
    });

    it('deve aplicar tamanho lg', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'gap-2.5');
    });
  });

  describe('Ícones', () => {
    it('deve renderizar ícone à esquerda por padrão', () => {
      render(
        <Button icon={<ChefHatIcon data-testid="icon" />}>
          Com ícone
        </Button>
      );
      
      const icon = screen.getByTestId('icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(button.firstChild).toBe(icon.parentElement);
    });

    it('deve renderizar ícone à direita', () => {
      render(
        <Button icon={<ChefHatIcon data-testid="icon" />} iconPosition="right">
          Com ícone
        </Button>
      );
      
      const icon = screen.getByTestId('icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(button.lastChild).toBe(icon.parentElement);
    });

    it('deve aplicar tamanho correto do ícone baseado no size do botão', () => {
      const { rerender } = render(
        <Button size="sm" icon={<ChefHatIcon data-testid="icon" />}>
          Small
        </Button>
      );
      
      const iconContainer = screen.getByTestId('icon').closest('span');
      expect(iconContainer).toHaveClass('w-4', 'h-4');
      
      rerender(
        <Button size="lg" icon={<ChefHatIcon data-testid="icon" />}>
          Large
        </Button>
      );
      
      const iconContainerLg = screen.getByTestId('icon').closest('span');
      expect(iconContainerLg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Estado de loading', () => {
    it('deve mostrar spinner quando loading=true', () => {
      render(<Button loading>Loading</Button>);
      
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('deve ocultar ícone quando loading=true', () => {
      render(
        <Button loading icon={<ChefHatIcon data-testid="icon" />}>
          Loading
        </Button>
      );
      
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });

    it('deve desabilitar botão quando loading=true', () => {
      render(<Button loading>Loading</Button>);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('deve aplicar tamanho correto do spinner baseado no size', () => {
      const { rerender } = render(<Button loading size="sm">Small</Button>);
      
      let spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveClass('w-4', 'h-4');
      
      rerender(<Button loading size="lg">Large</Button>);
      
      spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Estado disabled', () => {
    it('deve estar desabilitado quando disabled=true', () => {
      render(<Button disabled>Disabled</Button>);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('deve aplicar classes de disabled', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Interações', () => {
    it('deve chamar onClick quando clicado', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClick quando disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('não deve chamar onClick quando loading', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Atributos HTML', () => {
    it('deve passar atributos HTML adicionais', () => {
      render(
        <Button type="submit" id="submit-btn" data-testid="custom-button">
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('id', 'submit-btn');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter classes de foco para acessibilidade', () => {
      render(<Button>Accessible</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });

    it('deve ter role button por padrão', () => {
      render(<Button>Button</Button>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Classes CSS', () => {
    it('deve aplicar classes base', () => {
      render(<Button>Base Classes</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        'transition-all',
        'duration-200'
      );
    });

    it('deve combinar classes corretamente com cn utility', () => {
      render(
        <Button className="custom-class" variant="primary" size="lg">
          Combined
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });
  });
});