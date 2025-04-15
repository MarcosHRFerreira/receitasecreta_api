package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;

import java.math.BigDecimal;
import java.util.Date;

public record EstoqueRecordDto(

        UnidadeMedida unidademedida,
        BigDecimal quantidadedisponivel,
        BigDecimal custoporunidade,
        Date datavalidade,
        String categoria,
        String fornecedor,
        BigDecimal alertaestoque,
        String descricao,
        String codigoBarras
) {


}
