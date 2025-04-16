package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.configs.CustomBeanUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class ReceitaServiceImpl implements ReceitaService {

    final ReceitaRepository receitaRepository;

    public ReceitaServiceImpl(ReceitaRepository receitaRepository) {
        this.receitaRepository = receitaRepository;

    }

    @Override
    public ReceitaModel save(ReceitaRecordDto receitaRecordDto) {

      var receitaModel = new ReceitaModel();

        CustomBeanUtils.copyProperties(receitaRecordDto,receitaModel);

        receitaModel.setDataCriacao(LocalDateTime.now(ZoneId.of("UTC")));
        receitaModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));


        return receitaRepository.save(receitaModel);
    }

    @Override
    public ReceitaModel findByReceitaId(UUID receitaId) {

        ReceitaModel receitaModel=receitaRepository.findByReceitaId(receitaId);

        if(receitaModel == null){
            throw new NotFoundException("Erro: Receita não encontrada.");
        }

        return receitaModel;
    }

    @Override
    public ReceitaModel update(ReceitaRecordDto receitaRecordDto, UUID receitaId) {

        ReceitaModel receitaModel = receitaRepository.findByReceitaId(receitaId);

        if(receitaModel==null){
            throw  new NotFoundException("Receita ID: " + receitaId + " não existe");
        }

        CustomBeanUtils.copyProperties(receitaRecordDto,receitaModel);

        receitaModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));

        return receitaRepository.save(receitaModel);
    }
}
