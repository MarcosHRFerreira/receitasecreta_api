import React from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ReceitaFormData, ReceitaIngredienteFormData } from '../types';

interface ReceitaBasicInfoProps {
  register: UseFormRegister<ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] }>;
  errors: FieldErrors<ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] }>;
}

const ReceitaBasicInfo: React.FC<ReceitaBasicInfoProps> = ({ register, errors }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Receita *
          </label>
          <input
            {...register('nomeReceita', { required: 'Nome é obrigatório' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Bolo de Chocolate"
          />
          {errors.nomeReceita && (
            <p className="mt-1 text-sm text-red-600">{errors.nomeReceita.message}</p>
          )}
        </div>

        {/* Notas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            {...register('notas')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Adicione notas ou observações sobre a receita..."
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            {...register('categoria', { required: 'Categoria é obrigatória' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="PRATO_PRINCIPAL">Prato Principal</option>
            <option value="SOBREMESA">Sobremesa</option>
            <option value="BEBIDA">Bebida</option>
            <option value="LANCHE">Lanche</option>
          </select>
          {errors.categoria && (
            <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
          )}
        </div>

        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificuldade *
          </label>
          <select
            {...register('dificuldade', { required: 'Dificuldade é obrigatória' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="FACIL">Fácil</option>
            <option value="COMPLEXA">Complexa</option>
          </select>
          {errors.dificuldade && (
            <p className="mt-1 text-sm text-red-600">{errors.dificuldade.message}</p>
          )}
        </div>

        {/* Tempo de Preparo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo de Preparo *
          </label>
          <input
            {...register('tempoPreparo', { 
              required: 'Tempo de preparo é obrigatório'
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 45 minutos a 180 graus"
          />
          {errors.tempoPreparo && (
            <p className="mt-1 text-sm text-red-600">{errors.tempoPreparo.message}</p>
          )}
        </div>

        {/* Rendimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rendimento *
          </label>
          <input
            {...register('rendimento', { 
              required: 'Rendimento é obrigatório'
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 4 porções"
          />
          {errors.rendimento && (
            <p className="mt-1 text-sm text-red-600">{errors.rendimento.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <input
            {...register('tags', { 
              required: 'Tags são obrigatórias'
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: bolo de chocolate, sobremesa, festa"
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
          )}
        </div>

        {/* Favorita */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              {...register('favorita')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Marcar como favorita</span>
          </label>
        </div>

      </div>
    </div>
  );
};

export default ReceitaBasicInfo;