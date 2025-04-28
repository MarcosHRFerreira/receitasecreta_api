package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteDeleteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteResponse;


public interface ReceitaIngredienteService {

    ReceitaIngredienteResponse save(ReceitaIngredienteDto receitaIngredienteDto);


    ReceitaIngredienteResponse update(ReceitaIngredienteDto receitaIngredienteDto);

    ReceitaIngredienteResponse delete(ReceitaIngredienteDeleteDto receitaIngredienteDeleteDto);
}
