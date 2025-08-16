import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReceita, useCreateReceita, useUpdateReceita, useProdutos, useIngredientesByReceita, useCreateReceitaIngrediente, useUpdateReceitaIngrediente, useDeleteReceitaIngrediente } from '../hooks/useApi';
import type { ReceitaFormData, ReceitaIngredienteFormData, ReceitaIngrediente } from '../types';

// Tipo específico para o formulário completo
type ReceitaCompleteFormData = ReceitaFormData & { ingredientes: ReceitaIngredienteFormData[] };

// Tipo para ingredientes válidos

import { UnidadeMedida } from '../types';
import { Loading, ReceitaBasicInfo, ReceitaIngredientes, ReceitaInstructions, ImageUpload } from '../components';

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
      tempoPreparo: '',
      rendimento: '',
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
        tempoPreparo: receita.tempoPreparo || '',
        rendimento: receita.rendimento || '',
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
        tempoPreparo: formData.tempoPreparo,
        rendimento: formData.rendimento,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-slide-down transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white animate-fade-in-delay">
            {isEditing ? 'Editar Receita' : 'Nova Receita'}
          </h1>
          <Link
            to={isEditing ? `/receitas/${id}` : '/receitas'}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 hover:scale-105 self-start sm:self-auto"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in-up">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md animate-shake-and-fade-in">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="animate-fade-in-delay">
          <ReceitaBasicInfo register={register} errors={errors} />
        </div>

        {/* Ingredientes */}
        <div className="animate-fade-in-up">
          <ReceitaIngredientes 
            register={register} 
            errors={errors} 
            control={control} 
            produtos={produtos} 
          />
        </div>

        {/* Instructions */}
        <div className="animate-fade-in-delay">
          <ReceitaInstructions register={register} errors={errors} />
        </div>

        {/* Upload de Imagens */}
        {(isEditing && id) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-fade-in-up transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 animate-fade-in-delay">Imagens da Receita</h3>
            <div className="animate-fade-in">
              <ImageUpload 
                receitaId={id}
                onImageDeleted={(imagemId) => {
                  console.log('Imagem removida:', imagemId);
                }}
                maxFiles={10}
                maxFileSize={5}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 animate-fade-in-up transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end animate-stagger-children">
            <Link
              to={isEditing ? `/receitas/${id}` : '/receitas'}
              className="w-full sm:w-auto px-6 py-2 text-center text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg"
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