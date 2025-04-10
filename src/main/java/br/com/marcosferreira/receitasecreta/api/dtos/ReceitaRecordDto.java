package br.com.marcosferreira.receitasecreta.api.dtos;



import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;

import java.util.UUID;

public record ReceitaRecordDto(

        String nomeReceita, // Nome da receita
        UUID ingredienteId,
        String modoPreparo, // Instruções detalhadas para preparar a receita
        String tempoPreparo, // Tempo necessário para preparar a receita (em minutos)
        String rendimento, // Quantidade de porções que a receita gera
        CategoriaReceita categoria, // Classificação da receita
        Dificuldade dificuldade, // Nível de dificuldade da receita
        String notas, // Notas ou ajustes personalizados
        String tags, // Tags para facilitar a busca
        Boolean favorita // Indica se a receita está marcada como favorita

) {
}
