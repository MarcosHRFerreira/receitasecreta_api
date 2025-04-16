package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteResponse;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;

import java.util.List;
import java.util.UUID;


public interface ReceitaIngredienteService {

    ReceitaIngredienteResponse save(ReceitaIngredienteDto receitaIngredienteDto);


    ReceitaIngredienteResponse update(ReceitaIngredienteDto receitaIngredienteDto, UUID receitaId);
}
