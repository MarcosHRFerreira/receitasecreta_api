package br.com.marcosferreira.receitasecreta.api.services.impl;



import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDeleteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDeleteRecordDto;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteDto;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaIngredienteRecordDto;
import br.com.marcosferreira.receitasecreta.api.dtos.response.ReceitaIngredienteResponse;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteId;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaIngredienteRepository;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaIngredienteService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Service
public class ReceitaIngredienteServiceImpl implements ReceitaIngredienteService {

    final ReceitaIngredienteRepository receitaIngredienteRepository;
    final ReceitaService receitaService;
    final ProdutoService produtoService;

    public ReceitaIngredienteServiceImpl(ReceitaIngredienteRepository receitaIngredienteRepository, ReceitaService receitaService, ProdutoService produtoService) {
        this.receitaIngredienteRepository = receitaIngredienteRepository;
        this.receitaService = receitaService;

        this.produtoService = produtoService;
    }

    @Override
    public ReceitaIngredienteResponse save(ReceitaIngredienteDto receitaIngredienteDto) {

        ReceitaModel receitaModel = receitaService.findByReceitaId(receitaIngredienteDto.receitaId());
        if (receitaModel == null) {
            throw new NotFoundException("Receita ID não encontrada");
        }

        List<ReceitaIngredienteModel> ingredientesSalvos = new ArrayList<>();
        List<String> mensagensDeAviso = new ArrayList<>();

        for (ReceitaIngredienteRecordDto produtoRecordDto : receitaIngredienteDto.ingredientes()) {
            try {

                if (produtoRecordDto.quantidade() == null || produtoRecordDto.quantidade() <= 0) {
                    throw new IllegalArgumentException("A quantidade deve ser maior que zero para o produto com ID: "
                            + produtoRecordDto.produtoId());
                }

                if (produtoRecordDto.unidadeMedida() == null) {
                    throw new IllegalArgumentException("A unidade de medida não pode ser nula para o produto com ID: "
                            + produtoRecordDto.produtoId());
                }

                ReceitaIngredienteId id = new ReceitaIngredienteId();
                id.setReceitaId(receitaIngredienteDto.receitaId());
                id.setIngredienteId(produtoRecordDto.produtoId());

                ReceitaIngredienteModel ingredientereceita = receitaIngredienteRepository.findById(id).orElse(null);
                if (ingredientereceita != null) {
                    mensagensDeAviso.add("ReceitaId + ProdutoId já existe no cadastro: " + produtoRecordDto.produtoId());
                    continue;
                }

                ReceitaIngredienteModel receitaIngrediente = new ReceitaIngredienteModel();
                receitaIngrediente.setId(id);
                receitaIngrediente.setQuantidade(produtoRecordDto.quantidade());
                receitaIngrediente.setUnidadeMedida(produtoRecordDto.unidadeMedida());

                ingredientesSalvos.add(receitaIngredienteRepository.save(receitaIngrediente));
            } catch (Exception e) {

                mensagensDeAviso.add("Erro com ID: " + produtoRecordDto.produtoId()
                        + ". Detalhes Save: " + e.getMessage());
            }
        }
        return new ReceitaIngredienteResponse(ingredientesSalvos,mensagensDeAviso);
    }

    @Override
    public ReceitaIngredienteResponse update(ReceitaIngredienteDto receitaIngredienteDto) {

        List<ReceitaIngredienteModel> ingredientesSalvos = new ArrayList<>();
        List<String> mensagensDeAviso = new ArrayList<>();

        for (ReceitaIngredienteRecordDto produtoRecordDto : receitaIngredienteDto.ingredientes()) {
            try {
                ReceitaIngredienteId id = new ReceitaIngredienteId();
                id.setReceitaId(receitaIngredienteDto.receitaId());
                id.setIngredienteId(produtoRecordDto.produtoId());

                ReceitaIngredienteModel ingredientereceita = receitaIngredienteRepository.findById(id).orElse(null);
                if (ingredientereceita == null) {
                    mensagensDeAviso.add("ReceitaId + ProdutoId Não existe no cadastro: " + produtoRecordDto.produtoId());
                    continue;
                }


                if (produtoRecordDto.quantidade() == null || produtoRecordDto.quantidade() <= 0) {
                    throw new IllegalArgumentException("A quantidade deve ser maior que zero para o produto com ID: "
                            + produtoRecordDto.produtoId());
                }else{
                    ingredientereceita.setQuantidade(produtoRecordDto.quantidade());
                }

                if (produtoRecordDto.unidadeMedida() == null) {
                    throw new IllegalArgumentException("A unidade de medida não pode ser nula para o produto com ID: "
                            + produtoRecordDto.produtoId());
                }else {
                    ingredientereceita.setUnidadeMedida(produtoRecordDto.unidadeMedida());
                }

                ingredientesSalvos.add(receitaIngredienteRepository.save(ingredientereceita));
            } catch (Exception e) {
                mensagensDeAviso.add("Erro ao processar produto com ID: " + produtoRecordDto.produtoId()
                        + ". Detalhes Update: " + e.getMessage());
            }
        }
        return new ReceitaIngredienteResponse(ingredientesSalvos, mensagensDeAviso);
    }

    @Override
    @Transactional
    public ReceitaIngredienteResponse delete(ReceitaIngredienteDeleteDto receitaIngredienteDeleteDto) {
        List<String> mensagensDeAviso = new ArrayList<>();

        for (ReceitaIngredienteDeleteRecordDto produtoRecordDto : receitaIngredienteDeleteDto.ingredientes()) {
            try {
                ReceitaIngredienteId id = new ReceitaIngredienteId();
                id.setReceitaId(receitaIngredienteDeleteDto.receitaId());
                id.setIngredienteId(produtoRecordDto.produtoId());

                if (receitaIngredienteRepository.existsById(id)) {
                    receitaIngredienteRepository.deleteById(id);
                    mensagensDeAviso.add("Ingrediente com ProdutoId: " + produtoRecordDto.produtoId() + " excluído com sucesso.");
                } else {
                    mensagensDeAviso.add("ReceitaId :" + receitaIngredienteDeleteDto.receitaId() +
                            " ProdutoId : " + produtoRecordDto.produtoId() +
                            "  Não existe no cadastro.");
                }
            } catch (Exception e) {
                mensagensDeAviso.add("Erro ao processar produto com ID: " + produtoRecordDto.produtoId()
                        + ". Detalhes Delete: " + e.getMessage());
            }
        }
        return new ReceitaIngredienteResponse(null, mensagensDeAviso);

    }

    @Override
    public Page<ReceitaIngredienteModel> findAll(Pageable pageable) {
        return receitaIngredienteRepository.findAll(pageable);
    }

}
