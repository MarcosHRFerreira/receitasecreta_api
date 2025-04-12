package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.configs.CustomBeanUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.IngredienteRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.IngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.repositories.IngredienteRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.services.IngredienteService;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class IngredienteServiceImpl implements IngredienteService {

    final IngredienteRepository ingredienteRepository;
    final ProdutoRepository produtoRepository;
    final ProdutoService produtoService;

    public IngredienteServiceImpl(IngredienteRepository ingredienteRepository, ProdutoRepository produtoRepository, ProdutoService produtoService) {
        this.ingredienteRepository = ingredienteRepository;
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
    }


    @Override
    public IngredienteModel save(IngredienteRecordDto ingredienteRecordDto, UUID produtoId) {

        var ingredienteModel = new IngredienteModel();

        ProdutoModel produtoModel = produtoService.findById(produtoId);


        CustomBeanUtils.copyProperties(ingredienteRecordDto, ingredienteModel);

        ingredienteModel.setDataCriacao(LocalDateTime.now(ZoneId.of("UTC")));
        ingredienteModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));

        ingredienteModel.setProduto(produtoModel);


        return ingredienteRepository.save(ingredienteModel);

    }

    @Override
    public IngredienteModel findByIngredienteId(UUID ingredienteId) {

        IngredienteModel ingredienteModel=ingredienteRepository.findByIngredienteId(ingredienteId);

        if(ingredienteModel == null){
            throw new NotFoundException("Erro: Ingrediente não encontrado.");
        }

        return ingredienteModel;
    }



}
