import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { UseFormRegister, FieldErrors, Control, FieldError } from 'react-hook-form';
import type { Produto, ReceitaFormData, ReceitaIngredienteFormData } from '../types';
import { UnidadeMedida } from '../types';

// Tipo específico para o formulário completo
type ReceitaCompleteFormData = ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] };

// Tipo para erros de ingredientes individuais
type IngredienteFieldError = {
  produtoId?: FieldError;
  quantidade?: FieldError;
  unidadeMedida?: FieldError;
  observacao?: FieldError;
};

interface ReceitaIngredientesProps {
  register: UseFormRegister<ReceitaCompleteFormData>;
  errors: FieldErrors<ReceitaCompleteFormData>;
  control: Control<ReceitaCompleteFormData>;
  produtos: Produto[];
}

const ReceitaIngredientes: React.FC<ReceitaIngredientesProps> = ({ 
  register, 
  errors, 
  control, 
  produtos 
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredientes'
  });

  const addIngrediente = () => {
    append({ produtoId: '', quantidade: 0, unidadeMedida: UnidadeMedida.GRAMA, observacao: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Ingredientes</h2>
        <button
          type="button"
          onClick={addIngrediente}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Adicionar Ingrediente
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-md">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto *
              </label>
              <select
                {...register(`ingredientes.${index}.produtoId` as const, {
                  required: 'Produto é obrigatório',
                  validate: (value) => value && value.trim().length > 0 || 'Selecione um produto'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"

              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                   <option key={produto.id} value={produto.id}>
                     {produto.nome}
                   </option>
                 ))}
              </select>
              {(errors.ingredientes as Record<number, IngredienteFieldError>)?.[index]?.produtoId && (
                   <p className="mt-1 text-sm text-red-600">
                     {(errors.ingredientes as Record<number, IngredienteFieldError>)[index]?.produtoId?.message}
                   </p>
                 )}
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                {...register(`ingredientes.${index}.quantidade` as const, {
                  required: 'Quantidade é obrigatória',
                  min: { value: 0.01, message: 'Quantidade deve ser maior que 0' }
                })}
                type="number"
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {(errors.ingredientes as Record<number, IngredienteFieldError>)?.[index]?.quantidade && (
                   <p className="mt-1 text-sm text-red-600">
                     {(errors.ingredientes as Record<number, IngredienteFieldError>)[index]?.quantidade?.message}
                   </p>
                 )}
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade *
              </label>
              <select
                {...register(`ingredientes.${index}.unidadeMedida` as const, {
                  required: 'Unidade de medida é obrigatória'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="GRAMA">Grama</option>
                <option value="KILO">Kilo</option>
                <option value="LITRO">Litro</option>
                <option value="UNIDADE">Unidade</option>
                <option value="COLHER">Colher</option>
                <option value="XICARA">Xícara</option>
              </select>
              {(errors.ingredientes as Record<number, IngredienteFieldError>)?.[index]?.unidadeMedida && (
                   <p className="mt-1 text-sm text-red-600">
                     {(errors.ingredientes as Record<number, IngredienteFieldError>)[index]?.unidadeMedida?.message}
                   </p>
                 )}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800 transition-colors p-2"
                title="Remover ingrediente"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum ingrediente adicionado.</p>
          <button
            type="button"
            onClick={addIngrediente}
            className="mt-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            Adicionar primeiro ingrediente
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceitaIngredientes;