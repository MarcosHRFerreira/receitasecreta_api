package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDeleteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.response.ReceitaIngredienteResponse;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ReceitaIngredienteService {

    ReceitaIngredienteResponse save(ReceitaIngredienteDto receitaIngredienteDto);


    ReceitaIngredienteResponse update(ReceitaIngredienteDto receitaIngredienteDto);

    ReceitaIngredienteResponse delete(ReceitaIngredienteDeleteDto receitaIngredienteDeleteDto);

    Page<ReceitaIngredienteModel> findAll(Pageable pageable);
}
