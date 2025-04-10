package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

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
