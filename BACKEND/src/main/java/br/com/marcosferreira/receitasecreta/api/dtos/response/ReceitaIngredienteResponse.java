package br.com.marcosferreira.receitasecreta.api.dtos.response;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;

import java.util.List;

public record ReceitaIngredienteResponse(
        List<ReceitaIngredienteModel> ingredientesSalvos,
        List<String> mensagensDeAviso

) {
}

