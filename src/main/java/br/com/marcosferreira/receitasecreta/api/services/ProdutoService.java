package br.com.marcosferreira.receitasecreta.api.services;


import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProdutoService {

    ProdutoModel save(ProdutoRecordDto produtoRecordDto);
    ProdutoModel findByProdutoId(UUID produtoId);

    ProdutoModel findByNome(String nome);


    ProdutoModel update(ProdutoRecordDto produtoRecordDto, UUID produtoId);

    Page<ProdutoModel> findAll(Pageable pageable);


}
