package br.com.marcosferreira.receitasecreta.api.services;


import br.com.marcosferreira.receitasecreta.api.dtos.IngredienteRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.IngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;


import java.util.UUID;

public interface IngredienteService {

    IngredienteModel save(IngredienteRecordDto ingredienteRecordDto, UUID produtoId);

    IngredienteModel findByIngredienteId(UUID ingredienteId);


}
