import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReceita, useCreateReceita, useUpdateReceita, useProdutos, useIngredientesByReceita, useCreateReceitaIngrediente, useUpdateReceitaIngrediente, useDeleteReceitaIngrediente } from '../hooks/useApi';
import type { ReceitaFormData, ReceitaIngredienteFormData, ReceitaIngrediente } from '../types';

// Tipo específico para o formulário completo
type ReceitaCompleteFormData = ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] };

// Tipo para ingredientes válidos

import { UnidadeMedida } from '../types';
import { Loading, ReceitaBasicInfo, ReceitaIngredientes, ReceitaInstructions } from '../components';

const ReceitaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: receita, isLoading: loadingReceita } = useReceita(id || '');
  const { data: produtosData } = useProdutos();
  const { data: ingredientesExistentes = [] } = useIngredientesByReceita(id || '');
  
  const createReceitaMutation = useCreateReceita();
  const updateReceitaMutation = useUpdateReceita();
  const createIngredienteMutation = useCreateReceitaIngrediente();
  const updateIngredienteMutation = useUpdateReceitaIngrediente();
  const deleteIngredienteMutation = useDeleteReceitaIngrediente();

  const produtos = useMemo(() => produtosData?.content || [], [produtosData?.content]);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ReceitaCompleteFormData>({
    defaultValues: {
      nomeReceita: '',
      categoria: 'BOLO' as const,
      dificuldade: 'FACIL',
      tempoPreparo: 0,
      rendimento: 0,
      modoPreparo: '',
      notas: '',
      tags: '',
      favorita: false,
      ingredientes: [{ produtoId: '', quantidade: 0, unidadeMedida: UnidadeMedida.GRAMA }]
    }
  });

  // Carregar dados da receita para edição
  useEffect(() => {
    if (isEditing && receita && ingredientesExistentes) {

      reset({
        nomeReceita: receita.nomeReceita,
        categoria: receita.categoria,
        dificuldade: receita.dificuldade,
        tempoPreparo: parseInt(receita.tempoPreparo) || 0,
        rendimento: parseInt(receita.rendimento) || 0,
        modoPreparo: receita.modoPreparo || '',
        notas: receita.notas || '',
        tags: receita.tags || '',
        favorita: receita.favorita || false,
        ingredientes: ingredientesExistentes && ingredientesExistentes.length > 0
          ? ingredientesExistentes.map((ing: ReceitaIngrediente) => ({
              produtoId: ing.produtoId,
              quantidade: ing.quantidade,
              unidadeMedida: ing.unidadeMedida,
              observacao: ing.observacao || ''
            }))
          : [{ produtoId: '', quantidade: 0, unidadeMedida: UnidadeMedida.GRAMA, observacao: '' }]
      });
    }
  }, [receita, ingredientesExistentes, reset, isEditing]);

  const onSubmit = async (data: ReceitaCompleteFormData) => {
    setIsLoading(true);
    setError('');

    console.log('🔄 [ReceitaForm] Iniciando submissão:', { data, isEditing });

    try {
      const { ingredientes, ...formData } = data;
      
      // Converter dados do formulário para o formato da API
      const receitaData = {
        nomeReceita: formData.nomeReceita,
        categoria: formData.categoria,
        dificuldade: formData.dificuldade,
        tempoPreparo: formData.tempoPreparo.toString(),
        rendimento: formData.rendimento.toString(),
        modoPreparo: formData.modoPreparo,
        notas: formData.notas,
        tags: formData.tags,
        favorita: formData.favorita
      };
      
      let receitaId: string;

      console.log('📝 [ReceitaForm] Dados da receita:', receitaData);
      console.log('🥄 [ReceitaForm] Ingredientes recebidos:', ingredientes);

      if (isEditing) {
        console.log('✏️ [ReceitaForm] Atualizando receita existente...');
        const receita = await updateReceitaMutation.mutateAsync({ id: id!, data: receitaData });
        receitaId = receita.receitaId;
        console.log('✅ [ReceitaForm] Receita atualizada:', receita);
      } else {
        console.log('➕ [ReceitaForm] Criando nova receita...');
        const novaReceita = await createReceitaMutation.mutateAsync(receitaData);
        receitaId = novaReceita.receitaId;
        console.log('✅ [ReceitaForm] Nova receita criada:', novaReceita);
      }

      // Processar ingredientes
      const ingredientesValidos = ingredientes.filter((ing: ReceitaIngredienteFormData) => ing.produtoId && ing.produtoId.trim().length > 0 && ing.quantidade > 0);
      console.log('✅ [ReceitaForm] Ingredientes válidos:', ingredientesValidos.length);
      
      if (isEditing && ingredientesExistentes) {
        // Atualizar/deletar ingredientes existentes

        for (const ingredienteExistente of ingredientesExistentes || []) {
          const ingredienteAtualizado = ingredientesValidos.find((ing: ReceitaIngredienteFormData) => ing.produtoId === ingredienteExistente.produtoId);
          
          if (ingredienteAtualizado) {
            // Atualizar se mudou
            if (ingredienteAtualizado.produtoId !== ingredienteExistente.produtoId || 
                ingredienteAtualizado.quantidade !== ingredienteExistente.quantidade) {
              console.log('🔄 [ReceitaForm] Atualizando ingrediente:', { ingredienteAtualizado, ingredienteExistente });
              try {
                await updateIngredienteMutation.mutateAsync({
                  receitaId: receitaId,
                  ingredientes: [{
                    produtoId: ingredienteAtualizado.produtoId,
                    quantidade: ingredienteAtualizado.quantidade,
                    unidadeMedida: ingredienteAtualizado.unidadeMedida
                  }]
                });
                console.log('✅ [ReceitaForm] Ingrediente atualizado com sucesso');
              } catch (updateError) {
                console.error('❌ [ReceitaForm] Erro ao atualizar ingrediente:', updateError);
                throw updateError;
              }
            }
          } else {
            // Deletar se não existe mais
            console.log('🗑️ [ReceitaForm] Deletando ingrediente:', ingredienteExistente);
            try {
              await deleteIngredienteMutation.mutateAsync({
                receitaId: receitaId,
                ingredientes: [{
                  produtoId: ingredienteExistente.produtoId
                }]
              });
              console.log('✅ [ReceitaForm] Ingrediente deletado com sucesso');
            } catch (deleteError) {
              console.error('❌ [ReceitaForm] Erro ao deletar ingrediente:', deleteError);
              throw deleteError;
            }
          }
        }

        // Criar novos ingredientes (apenas os que não existem)
        const novosIngredientes = ingredientesValidos.filter((ingredienteAtualizado: ReceitaIngredienteFormData) => {
          return !ingredientesExistentes.some(ingredienteExistente => 
            ingredienteAtualizado.produtoId === ingredienteExistente.produtoId
          );
        });
  
        if (novosIngredientes.length > 0) {
          const payload = {
            receitaId: receitaId,
            ingredientes: novosIngredientes.map((ing: ReceitaIngredienteFormData) => ({
              produtoId: ing.produtoId.trim(),
              quantidade: ing.quantidade,
              unidadeMedida: ing.unidadeMedida
            }))
          };
          console.log('🔍 [ReceitaForm] Payload completo sendo enviado:', JSON.stringify(payload, null, 2));
          console.log('📤 [ReceitaForm] Criando', novosIngredientes.length, 'novos ingredientes');
          try {
            await createIngredienteMutation.mutateAsync(payload);
            console.log('✅ [ReceitaForm] Novos ingredientes criados com sucesso');
          } catch (createError) {
            console.error('❌ [ReceitaForm] Erro ao criar novos ingredientes:', createError);
            throw createError;
          }
        }
      } else {
        // Criar todos os ingredientes (receita nova)
        console.log('➕ [ReceitaForm] Criando todos os ingredientes para receita nova...');
        if (ingredientesValidos.length > 0) {
          const payload = {
            receitaId: receitaId,
            ingredientes: ingredientesValidos.map((ing: ReceitaIngredienteFormData) => ({
              produtoId: ing.produtoId.trim(),
              quantidade: ing.quantidade,
              unidadeMedida: ing.unidadeMedida
            }))
          };
          console.log('📤 [ReceitaForm] Criando', ingredientesValidos.length, 'ingredientes para receita nova');
          console.log('🔍 [ReceitaForm] Payload completo:', JSON.stringify(payload, null, 2));
          try {
            await createIngredienteMutation.mutateAsync(payload);
            console.log('✅ [ReceitaForm] Ingredientes criados com sucesso');
          } catch (createError) {
            console.error('❌ [ReceitaForm] Erro ao criar ingredientes:', createError);
            throw createError;
          }
        }
      }

      console.log('🎉 [ReceitaForm] Receita e ingredientes salvos com sucesso! Redirecionando...');
      navigate(`/receitas/${receitaId}`);
    } catch (err: unknown) {
      console.error('❌ [ReceitaForm] Erro durante a submissão:', err);
      
      let errorMessage = 'Erro ao salvar receita. Tente novamente.';
      
      if (err instanceof Error) {
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as {
            status?: number;
            statusText?: string;
            data?: unknown;
          };
          console.error('❌ [ReceitaForm] Detalhes da resposta de erro:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
          });
          
          if (response.data && typeof response.data === 'object') {
            if ('message' in response.data) {
              errorMessage = String(response.data.message);
            } else if ('mensagensDeAviso' in response.data && Array.isArray(response.data.mensagensDeAviso)) {
              errorMessage = `Erro nos ingredientes: ${response.data.mensagensDeAviso.join(', ')}`;
            }
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('❌ [ReceitaForm] Mensagem de erro final:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing && loadingReceita) {
    return <Loading fullScreen text="Carregando receita..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Receita' : 'Nova Receita'}
          </h1>
          <Link
            to={isEditing ? `/receitas/${id}` : '/receitas'}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <ReceitaBasicInfo register={register} errors={errors} />

        {/* Ingredientes */}
        <ReceitaIngredientes 
          register={register} 
          errors={errors} 
          control={control} 
          produtos={produtos} 
        />

        {/* Instructions */}
        <ReceitaInstructions register={register} errors={errors} />

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex space-x-4 justify-end">
            <Link
              to={isEditing ? `/receitas/${id}` : '/receitas'}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loading size="sm" text="" />
              ) : (
                isEditing ? 'Atualizar Receita' : 'Criar Receita'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReceitaForm;