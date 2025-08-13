import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../../../components/ui/Card';

describe('Card Component', () => {
  describe('Renderização básica', () => {
    it('deve renderizar com children', () => {
      render(
        <Card>
          <div data-testid="card-content">Conteúdo do card</div>
        </Card>
      );
      
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
    });

    it('deve aplicar classes base por padrão', () => {
      render(
        <Card>
          <div>Content</div>
        </Card>
      );
      
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass(
        'bg-white',
        'rounded-xl',
        'shadow-sm',
        'border',
        'border-gray-100'
      );
    });
  });

  describe('Props de estilo', () => {
    it('deve aplicar className customizada', () => {
      render(
        <Card className="custom-class">
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('deve aplicar classes de hover quando hover=true', () => {
      render(
        <Card hover>
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).toHaveClass(
        'hover:shadow-lg',
        'hover:border-gray-200',
        'transition-all',
        'duration-200'
      );
    });

    it('não deve aplicar classes de hover quando hover=false', () => {
      render(
        <Card hover={false}>
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).not.toHaveClass('hover:shadow-lg');
      expect(card).not.toHaveClass('hover:border-gray-200');
    });
  });

  describe('Padding variants', () => {
    it('deve aplicar padding md por padrão', () => {
      render(
        <Card>
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).toHaveClass('p-6');
    });

    it('deve aplicar padding none', () => {
      render(
        <Card padding="none">
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
    });

    it('deve aplicar padding sm', () => {
      render(
        <Card padding="sm">
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).toHaveClass('p-4');
    });

    it('deve aplicar padding lg', () => {
      render(
        <Card padding="lg">
          <div data-testid="content">Content</div>
        </Card>
      );
      
      const card = screen.getByTestId('content').parentElement;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Card.Header', () => {
    it('deve renderizar Card.Header com children', () => {
      render(
        <Card>
          <Card.Header>
            <h2 data-testid="header-title">Título do Header</h2>
          </Card.Header>
        </Card>
      );
      
      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByText('Título do Header')).toBeInTheDocument();
    });

    it('deve aplicar classes padrão do header', () => {
      render(
        <Card>
          <Card.Header>
            <div data-testid="header-content">Header</div>
          </Card.Header>
        </Card>
      );
      
      const header = screen.getByTestId('header-content').parentElement;
      expect(header).toHaveClass('mb-4');
    });

    it('deve aplicar className customizada no header', () => {
      render(
        <Card>
          <Card.Header className="custom-header-class">
            <div data-testid="header-content">Header</div>
          </Card.Header>
        </Card>
      );
      
      const header = screen.getByTestId('header-content').parentElement;
      expect(header).toHaveClass('custom-header-class', 'mb-4');
    });
  });

  describe('Card.Content', () => {
    it('deve renderizar Card.Content com children', () => {
      render(
        <Card>
          <Card.Content>
            <p data-testid="content-text">Conteúdo principal</p>
          </Card.Content>
        </Card>
      );
      
      expect(screen.getByTestId('content-text')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo principal')).toBeInTheDocument();
    });

    it('deve aplicar className customizada no content', () => {
      render(
        <Card>
          <Card.Content className="custom-content-class">
            <div data-testid="content-element">Content</div>
          </Card.Content>
        </Card>
      );
      
      const content = screen.getByTestId('content-element').parentElement;
      expect(content).toHaveClass('custom-content-class');
    });
  });

  describe('Card.Footer', () => {
    it('deve renderizar Card.Footer com children', () => {
      render(
        <Card>
          <Card.Footer>
            <button data-testid="footer-button">Ação</button>
          </Card.Footer>
        </Card>
      );
      
      expect(screen.getByTestId('footer-button')).toBeInTheDocument();
      expect(screen.getByText('Ação')).toBeInTheDocument();
    });

    it('deve aplicar classes padrão do footer', () => {
      render(
        <Card>
          <Card.Footer>
            <div data-testid="footer-content">Footer</div>
          </Card.Footer>
        </Card>
      );
      
      const footer = screen.getByTestId('footer-content').parentElement;
      expect(footer).toHaveClass('mt-4', 'pt-4', 'border-t', 'border-gray-100');
    });

    it('deve aplicar className customizada no footer', () => {
      render(
        <Card>
          <Card.Footer className="custom-footer-class">
            <div data-testid="footer-content">Footer</div>
          </Card.Footer>
        </Card>
      );
      
      const footer = screen.getByTestId('footer-content').parentElement;
      expect(footer).toHaveClass(
        'custom-footer-class',
        'mt-4',
        'pt-4',
        'border-t',
        'border-gray-100'
      );
    });
  });

  describe('Composição completa', () => {
    it('deve renderizar Card completo com Header, Content e Footer', () => {
      render(
        <Card>
          <Card.Header>
            <h2 data-testid="card-title">Título</h2>
          </Card.Header>
          <Card.Content>
            <p data-testid="card-description">Descrição do card</p>
          </Card.Content>
          <Card.Footer>
            <button data-testid="card-action">Ação</button>
          </Card.Footer>
        </Card>
      );
      
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByTestId('card-description')).toBeInTheDocument();
      expect(screen.getByTestId('card-action')).toBeInTheDocument();
    });

    it('deve manter estrutura hierárquica correta', () => {
      render(
        <Card data-testid="main-card">
          <Card.Header>
            <h2 data-testid="header">Header</h2>
          </Card.Header>
          <Card.Content>
            <p data-testid="content">Content</p>
          </Card.Content>
          <Card.Footer>
            <div data-testid="footer">Footer</div>
          </Card.Footer>
        </Card>
      );
      
      const mainCard = document.querySelector('.bg-white.rounded-xl.shadow-sm');
      const header = screen.getByTestId('header').parentElement;
      const content = screen.getByTestId('content').parentElement;
      const footer = screen.getByTestId('footer').parentElement;
      
      expect(mainCard).toContainElement(header);
      expect(mainCard).toContainElement(content);
      expect(mainCard).toContainElement(footer);
    });
  });

  describe('Casos de uso específicos', () => {
    it('deve funcionar apenas com Content', () => {
      render(
        <Card>
          <Card.Content>
            <p data-testid="only-content">Apenas conteúdo</p>
          </Card.Content>
        </Card>
      );
      
      expect(screen.getByTestId('only-content')).toBeInTheDocument();
    });

    it('deve funcionar com múltiplos elementos no mesmo nível', () => {
      render(
        <Card>
          <Card.Content>
            <p data-testid="content-1">Primeiro conteúdo</p>
          </Card.Content>
          <Card.Content>
            <p data-testid="content-2">Segundo conteúdo</p>
          </Card.Content>
        </Card>
      );
      
      expect(screen.getByTestId('content-1')).toBeInTheDocument();
      expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });

    it('deve combinar todas as props corretamente', () => {
      render(
        <Card 
          className="custom-card" 
          hover 
          padding="lg"
        >
          <Card.Header className="custom-header">
            <h2 data-testid="title">Título</h2>
          </Card.Header>
          <Card.Content className="custom-content">
            <p data-testid="text">Conteúdo</p>
          </Card.Content>
          <Card.Footer className="custom-footer">
            <button data-testid="button">Botão</button>
          </Card.Footer>
        </Card>
      );
      
      const header = screen.getByTestId('title').parentElement;
      const content = screen.getByTestId('text').parentElement;
      const footer = screen.getByTestId('button').parentElement;
      const card = header?.parentElement; // O Card é o container pai dos subcomponentes
      
      // Card principal
      expect(card).toHaveClass('custom-card', 'p-8', 'hover:shadow-lg');
      
      // Subcomponentes
      expect(header).toHaveClass('custom-header', 'mb-4');
      expect(content).toHaveClass('custom-content');
      expect(footer).toHaveClass('custom-footer', 'mt-4', 'pt-4', 'border-t');
    });
  });
});