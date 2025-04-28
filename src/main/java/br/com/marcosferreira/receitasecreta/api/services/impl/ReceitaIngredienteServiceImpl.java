package br.com.marcosferreira.receitasecreta.api.services.impl;



import br.com.marcosferreira.receitasecreta.api.dtos.*;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaIngredienteRepository;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaIngredienteService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


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


                ProdutoModel produto = produtoService.findByProdutoId(produtoRecordDto.produtoId());
                if (produto == null) {
                    throw new NotFoundException("Produto não encontrado para ID: "
                            + produtoRecordDto.produtoId());
                }

                ReceitaIngredienteModel ingredientereceita = receitaIngredienteRepository.findByIngredienteIdReceitaId(
                        receitaIngredienteDto.receitaId(), produtoRecordDto.produtoId());
                if (ingredientereceita != null) {
                    mensagensDeAviso.add("ReceitaId + ProdutoId já existe no cadastro: "
                            + produtoRecordDto.produtoId());
                    continue;
                }

                ReceitaIngredienteModel receitaIngrediente = new ReceitaIngredienteModel();
                receitaIngrediente.setReceita(receitaModel);
                receitaIngrediente.setProduto(produto);
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

        ReceitaModel receitaModel = receitaService.findByReceitaId(receitaIngredienteDto.receitaId());
        if (receitaModel == null) {
            throw new NotFoundException("Receita não encontrada");
        }

        List<ReceitaIngredienteModel> ingredientesSalvos = new ArrayList<>();
        List<String> mensagensDeAviso = new ArrayList<>();

        for (ReceitaIngredienteRecordDto produtoRecordDto : receitaIngredienteDto.ingredientes()) {
            try {

                if (produtoRecordDto.quantidade() != null && produtoRecordDto.quantidade() <= 0) {
                    throw new IllegalArgumentException("A quantidade deve ser maior que zero para o produto com ID: "
                            + produtoRecordDto.produtoId());
                }

                ProdutoModel produto = produtoService.findByProdutoId(produtoRecordDto.produtoId());
                if (produto == null) {
                    throw new NotFoundException("Produto não encontrado para ID: "
                            + produtoRecordDto.produtoId());
                }

                ReceitaIngredienteModel ingredientereceita = receitaIngredienteRepository.findByIngredienteIdReceitaId(
                        receitaIngredienteDto.receitaId(), produtoRecordDto.produtoId());
                if (ingredientereceita == null) {
                    mensagensDeAviso.add("ReceitaId + ProdutoId Não existe no cadastro: "
                            + produtoRecordDto.produtoId());
                    continue;
                }

                ingredientereceita.setReceita(receitaModel);
                ingredientereceita.setProduto(produto);
                if(produtoRecordDto.quantidade()!=null) {
                    ingredientereceita.setQuantidade(produtoRecordDto.quantidade());
                }
                if(produtoRecordDto.unidadeMedida()!=null) {
                    ingredientereceita.setUnidadeMedida(produtoRecordDto.unidadeMedida());
                }

                ingredientesSalvos.add(receitaIngredienteRepository.save(ingredientereceita));
            } catch (Exception e) {

                mensagensDeAviso.add("Erro ao processar produto com ID: " + produtoRecordDto.produtoId()
                        + ". Detalhes Update: " + e.getMessage());
            }
        }
        return new ReceitaIngredienteResponse(ingredientesSalvos,mensagensDeAviso);
    }

    @Override
    @Transactional
    public ReceitaIngredienteResponse delete(ReceitaIngredienteDeleteDto receitaIngredienteDeleteDto) {
        ReceitaModel receitaModel = receitaService.findByReceitaId(receitaIngredienteDeleteDto.receitaId());
        if (receitaModel == null) {
            throw new NotFoundException("Receita não encontrada");
        }

        List<String> mensagensDeAviso = new ArrayList<>();

        for (ReceitaIngredienteDeleteRecordDto produtoRecordDto : receitaIngredienteDeleteDto.ingredientes()) {
            try {

                ReceitaIngredienteModel ingredientereceita = receitaIngredienteRepository.findByIngredienteIdReceitaId(
                        receitaIngredienteDeleteDto.receitaId(), produtoRecordDto.produtoId());
                if (ingredientereceita == null) {
                    mensagensDeAviso.add("ReceitaId :" + receitaIngredienteDeleteDto.receitaId() + " ProdutoId : " + produtoRecordDto.produtoId() + "  Não existe no cadastro : ");
                    continue;
                }

                receitaIngredienteRepository.delete(ingredientereceita);
                mensagensDeAviso.add("Ingrediente com ProdutoId: " + produtoRecordDto.produtoId() + " excluído com sucesso.");
            } catch (Exception e) {

                mensagensDeAviso.add("Erro ao processar produto com ID: " + produtoRecordDto.produtoId()
                        + ". Detalhes Delete: " + e.getMessage());
            }
        }
        return new ReceitaIngredienteResponse(null,mensagensDeAviso);
    }

}
