import React from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ReceitaFormData, ReceitaIngredienteFormData } from '../types';

interface ReceitaInstructionsProps {
  register: UseFormRegister<ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] }>;
  errors: FieldErrors<ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] }>;
}

const ReceitaInstructions: React.FC<ReceitaInstructionsProps> = ({ register, errors }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Instruções</h2>
      
      <div className="space-y-6">
        {/* Modo de Preparo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de Preparo *
          </label>
          <textarea
            {...register('modoPreparo', { required: 'Modo de preparo é obrigatório' })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva passo a passo como preparar a receita..."
          />
          {errors.modoPreparo && (
            <p className="mt-1 text-sm text-red-600">{errors.modoPreparo.message}</p>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            {...register('notas')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Dicas extras, substituições possíveis, etc..."
          />
        </div>
      </div>
    </div>
  );
};

export default ReceitaInstructions;