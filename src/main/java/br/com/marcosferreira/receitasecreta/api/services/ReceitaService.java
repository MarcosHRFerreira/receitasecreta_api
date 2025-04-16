package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;

import java.util.UUID;

public interface ReceitaService {


    ReceitaModel save(ReceitaRecordDto receitaRecordDto);


    ReceitaModel findByReceitaId(UUID receitaId);

    ReceitaModel update(ReceitaRecordDto receitaRecordDto, UUID receitaId);
}
