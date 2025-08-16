package br.com.marcosferreira.receitasecreta.api.dtos.request;

import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


public record ReceitaRecordDto(
        @Schema(description = "Nome da receita", example = "Leite Integral")
        @NotBlank(message = "Nome da receitao Obrigatório ")
        String nomeReceita,

        @Schema(description = "Instruções detalhadas para preparar a receita", example = "Misture todos produtos secos")
        @NotBlank(message = "Instruções detalhadas para preparar a receita")
        String modoPreparo,

        @Schema(description = "Tempo necessário para preparar a receita (em minutos)", example = "45 mintutos a 180 graus")
        @NotBlank(message = "Tempo necessário para preparar a receita (em minutos)")
        String tempoPreparo,

        @Schema(description = "Quantidade de porções que a receita gera", example = "4 porções")
        @NotBlank(message = "Quantidade de porções que a receita gera")
        String rendimento,

        @Schema(description = "Categoria da receita", example = "Bolos")
        @NotNull(message = "Categoria da receita")
        CategoriaReceita categoria,

        @Schema(description = "Nível de dificuldade da receita", example = "FACIL")
        @NotNull(message = "Nível de dificuldade da receita")
        Dificuldade dificuldade,

        @Schema(description = "Notas ou ajustes personalizados", example = "Adicionar o leite morno")
        String notas,

        @Schema(description = "Tags para facilitar a busca", example = "bolo de chocolate")
        String tags,

        @Schema(description = "Indica se a receita está marcada como favorita", example = "True")
        @NotNull(message = "Indica se a receita está marcada como favorita")
        Boolean favorita

) {
}
