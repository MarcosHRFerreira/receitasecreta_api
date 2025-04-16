package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;



public record ProdutoRecordDto(
        @Schema(description = "Nome do Produto", example = "Leite Integral")
        @NotBlank(message = "Nome do Produto Obrigatório ")
        String nome,
        @NotNull(message = "Unidade de Medida Obrigatório")
        @Schema(description = "Unidade de Medida", example = "GRAMA")
        UnidadeMedida unidademedida,
        @Schema(description = "Custo do Produto por Unidade", example = "5,5")
        @NotNull(message = "Custo Obrigatório")
        BigDecimal custoporunidade,
        @Schema(description = "Categoria do Produto", example = "BEBIDA_LACTEA")
        @NotNull(message = "Categoria Obrigatório")
        CategoriaProduto categoriaproduto,
        @Schema(description = "Fornecedor do Produto", example = "Italac")
        @NotBlank(message = "Fornecedor Obrigatório")
        String fornecedor,
        @Schema(description = "Descrição do Produto", example = "Leite Integeral Italac")
        @NotBlank(message = "Descrição Obrigatório")
        String descricao,
        @Schema(description = "Codigo de Barras do Produto", example = "11122233344")
        @NotBlank(message = "Codigo de Barras Obrigatório")
        String codigobarras,
        @Schema(description = "Observação do Produto", example = "Após aberto utilizar em até 3 dias")
        String observacao
) {
}
