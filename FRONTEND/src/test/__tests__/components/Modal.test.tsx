import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../../components/Modal';

// Mock para document.body.style
const originalBodyStyle = document.body.style.overflow;

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    document.body.style.overflow = originalBodyStyle;
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyStyle;
  });

  describe('Renderização básica', () => {
    it('deve renderizar quando isOpen=true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="modal-content">Conteúdo do modal</div>
        </Modal>
      );
      
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    });

    it('não deve renderizar quando isOpen=false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div data-testid="modal-content">Conteúdo do modal</div>
        </Modal>
      );
      
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('deve renderizar backdrop', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
    });

    it('deve renderizar container do modal', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modalContainer = screen.getByTestId('content').closest('.bg-white.rounded-lg.shadow-xl');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('Título e header', () => {
    it('deve renderizar título quando fornecido', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Título do Modal">
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Título do Modal')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Título do Modal');
    });

    it('não deve renderizar header quando não há título e showCloseButton=false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const header = document.querySelector('.border-b');
      expect(header).not.toBeInTheDocument();
    });

    it('deve renderizar header apenas com botão de fechar', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} showCloseButton={true}>
          <div>Content</div>
        </Modal>
      );
      
      const header = document.querySelector('.border-b');
      const closeButton = screen.getByRole('button');
      
      expect(header).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });

    it('deve renderizar header com título e botão de fechar', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Título" showCloseButton={true}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Botão de fechar', () => {
    it('deve mostrar botão de fechar por padrão', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('não deve mostrar botão de fechar quando showCloseButton=false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('deve chamar onClose quando botão de fechar é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('deve ter ícone X no botão de fechar', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button');
      const icon = closeButton.querySelector('svg');
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho md por padrão', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modal = screen.getByTestId('content').closest('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('deve aplicar tamanho sm', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm">
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modal = screen.getByTestId('content').closest('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('deve aplicar tamanho lg', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg">
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modal = screen.getByTestId('content').closest('.max-w-2xl');
      expect(modal).toBeInTheDocument();
    });

    it('deve aplicar tamanho xl', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="xl">
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modal = screen.getByTestId('content').closest('.max-w-4xl');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Interações com backdrop', () => {
    it('deve chamar onClose quando backdrop é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      await user.click(backdrop!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClose quando modal content é clicado', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      );
      
      const modalContent = screen.getByTestId('modal-content');
      await user.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Navegação por teclado', () => {
    it('deve chamar onClose quando ESC é pressionado', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClose quando outras teclas são pressionadas', async () => {
      const user = userEvent.setup();
      
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      await user.keyboard('{Tab}');
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('deve adicionar event listener apenas quando modal está aberto', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { rerender } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
      
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Gerenciamento de scroll do body', () => {
    it('deve desabilitar scroll do body quando modal abre', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('deve restaurar scroll do body quando modal fecha', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('unset');
    });

    it('deve restaurar scroll do body quando componente é desmontado', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Classes CSS e estilos', () => {
    it('deve aplicar classes corretas no backdrop', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).toHaveClass(
        'fixed',
        'inset-0',
        'bg-black',
        'bg-opacity-50',
        'transition-opacity'
      );
    });

    it('deve aplicar classes corretas no container do modal', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const modalContainer = screen.getByTestId('content').closest('div');
      expect(modalContainer).toHaveClass(
        'relative',
        'bg-white',
        'rounded-lg',
        'shadow-xl',
        'w-full',
        'transform',
        'transition-all'
      );
    });

    it('deve aplicar classes corretas no header', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Título">
          <div>Content</div>
        </Modal>
      );
      
      const header = document.querySelector('.border-b');
      expect(header).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'p-6',
        'border-b'
      );
    });

    it('deve aplicar classes corretas no conteúdo', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="content">Content</div>
        </Modal>
      );
      
      const contentContainer = screen.getByTestId('content').parentElement;
      expect(contentContainer).toHaveClass('p-6');
    });
  });

  describe('Z-index e posicionamento', () => {
    it('deve ter z-index alto para ficar acima de outros elementos', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const modalWrapper = document.querySelector('.fixed.inset-0.z-50');
      expect(modalWrapper).toBeInTheDocument();
      expect(modalWrapper).toHaveClass('z-50');
    });

    it('deve centralizar modal na tela', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const centeringContainer = document.querySelector('.flex.min-h-full.items-center.justify-center');
      expect(centeringContainer).toBeInTheDocument();
      expect(centeringContainer).toHaveClass(
        'flex',
        'min-h-full',
        'items-center',
        'justify-center',
        'p-4'
      );
    });
  });

  describe('Casos de uso específicos', () => {
    it('deve funcionar com conteúdo complexo', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Modal Complexo">
          <div>
            <p data-testid="paragraph">Parágrafo</p>
            <button data-testid="inner-button">Botão interno</button>
            <input data-testid="input" placeholder="Campo de texto" />
          </div>
        </Modal>
      );
      
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
      expect(screen.getByTestId('inner-button')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('deve permitir múltiplos modais (embora não recomendado)', () => {
      render(
        <div>
          <Modal isOpen={true} onClose={vi.fn()}>
            <div data-testid="modal-1">Modal 1</div>
          </Modal>
          <Modal isOpen={true} onClose={vi.fn()}>
            <div data-testid="modal-2">Modal 2</div>
          </Modal>
        </div>
      );
      
      expect(screen.getByTestId('modal-1')).toBeInTheDocument();
      expect(screen.getByTestId('modal-2')).toBeInTheDocument();
    });
  });

  describe('Cleanup e memory leaks', () => {
    it('deve remover event listeners ao desmontar', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('deve limpar estilos do body ao desmontar', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });
});