package br.com.marcosferreira.receitasecreta.api.services;


import br.com.marcosferreira.receitasecreta.api.dtos.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;

import java.util.UUID;

public interface ProdutoService {

    ProdutoModel save(ProdutoRecordDto produtoRecordDto);
    ProdutoModel findByProdutoId(UUID produtoId);

    ProdutoModel update(ProdutoRecordDto produtoRecordDto, UUID produtoId);
}
