package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReceitaService {


    ReceitaModel save(ReceitaRecordDto receitaRecordDto);


    ReceitaModel findByReceitaId(UUID receitaId);

    ReceitaModel update(ReceitaRecordDto receitaRecordDto, UUID receitaId);

    Page<ReceitaModel> findAll(Pageable pageable);
}
