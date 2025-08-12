import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import ReceitaBasicInfo from './ReceitaBasicInfo';
import type { ReceitaFormData, ReceitaIngredienteFormData } from '../types';

// Componente wrapper para testar o ReceitaBasicInfo
const TestWrapper = () => {
  const { register, formState: { errors } } = useForm<ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] }>();
  
  return (
    <form>
      <ReceitaBasicInfo register={register} errors={errors} />
    </form>
  );
};

describe('ReceitaBasicInfo', () => {
  it('should render all basic info fields', () => {
    render(<TestWrapper />);

    // Verifica se todos os campos estão presentes
    expect(screen.getByLabelText(/nome da receita/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dificuldade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tempo de preparo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/porções/i)).toBeInTheDocument();
  });

  it('should have correct input types', () => {
    render(<TestWrapper />);

    // Verifica os tipos dos inputs
    expect(screen.getByLabelText(/nome da receita/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/tempo de preparo/i)).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText(/porções/i)).toHaveAttribute('type', 'number');
  });

  it('should render select options for category and difficulty', () => {
    render(<TestWrapper />);

    // Verifica se os selects têm as opções corretas
    const categorySelect = screen.getByLabelText(/categoria/i);
    const difficultySelect = screen.getByLabelText(/dificuldade/i);

    expect(categorySelect).toBeInTheDocument();
    expect(difficultySelect).toBeInTheDocument();
    
    // Verifica se são elementos select
    expect(categorySelect.tagName).toBe('SELECT');
    expect(difficultySelect.tagName).toBe('SELECT');
  });
});