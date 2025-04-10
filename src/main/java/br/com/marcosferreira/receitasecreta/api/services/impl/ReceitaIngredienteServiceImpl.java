package br.com.marcosferreira.receitasecreta.api.services.impl;


import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.ReceitaIngredienteRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.IngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaIngredienteRepository;
import br.com.marcosferreira.receitasecreta.api.services.IngredienteService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaIngredienteService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class ReceitaIngredienteServiceImpl implements ReceitaIngredienteService {

    final ReceitaIngredienteRepository receitaIngredienteRepository;
    final ReceitaService receitaService;
    final IngredienteService ingredienteService;

    public ReceitaIngredienteServiceImpl(ReceitaIngredienteRepository receitaIngredienteRepository, ReceitaService receitaService, IngredienteService ingredienteService) {
        this.receitaIngredienteRepository = receitaIngredienteRepository;
        this.receitaService = receitaService;
        this.ingredienteService = ingredienteService;
    }

    @Override
    public List<ReceitaIngredienteModel> save(ReceitaIngredienteDto receitaIngredienteDto) {

        // Buscar a receita pelo ID
        ReceitaModel receitaModel = receitaService.findByReceitaId(receitaIngredienteDto.receitaId());
          if (receitaModel == null){
              throw new NotFoundException("Receita não encontrada");
          }

        List<ReceitaIngredienteModel> ingredientesSalvos = new ArrayList<>();

        // Processar cada ingrediente no DTO
        for (ReceitaIngredienteRecordDto ingredienteRecordDto : receitaIngredienteDto.ingredientes()) {
            // Validar quantidade
            if (ingredienteRecordDto.quantidade() == null || ingredienteRecordDto.quantidade() <= 0) {
                throw new IllegalArgumentException("A quantidade deve ser maior que zero para o ingrediente com ID: "
                        + ingredienteRecordDto.ingredienteId());
            }

            // Validar unidade de medida
            if (ingredienteRecordDto.unidadeMedida() == null) {
                throw new IllegalArgumentException("A unidade de medida não pode ser nula para o ingrediente com ID: "
                        + ingredienteRecordDto.ingredienteId());
            }

            // Buscar o ingrediente pelo ID
            IngredienteModel ingrediente = ingredienteService.findByIngredienteId(ingredienteRecordDto.ingredienteId());
            if(ingrediente==null) {
                throw new NotFoundException("Ingrediente não encontrado para ID: "
                        + ingredienteRecordDto.ingredienteId());
            }

            // Criar o relacionamento entre receita e ingrediente
            ReceitaIngredienteModel receitaIngrediente = new ReceitaIngredienteModel();
            receitaIngrediente.setReceita(receitaModel);
            receitaIngrediente.setIngrediente(ingrediente);
            receitaIngrediente.setQuantidade(ingredienteRecordDto.quantidade());
            receitaIngrediente.setUnidadeMedida(ingredienteRecordDto.unidadeMedida());


            // Salvar no banco e adicionar à lista de retorno
            ingredientesSalvos.add(receitaIngredienteRepository.save(receitaIngrediente));
        }

        return ingredientesSalvos;
    }

}
