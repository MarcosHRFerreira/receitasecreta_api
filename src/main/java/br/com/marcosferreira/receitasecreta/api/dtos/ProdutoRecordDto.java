package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.util.Date;


public record ProdutoRecordDto(
        String nome,
        UnidadeMedida unidademedida,
        BigDecimal custoporunidade,
        Date datavalidade,
        CategoriaProduto categoriaproduto,
        String fornecedor,
        BigDecimal alertaestoque,
        String descricao,
        String codigobarras,
        String observacao
) {
}
