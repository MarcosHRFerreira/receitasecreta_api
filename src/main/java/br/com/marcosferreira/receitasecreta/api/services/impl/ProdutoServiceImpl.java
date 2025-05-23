package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.configs.CustomBeanUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;

import br.com.marcosferreira.receitasecreta.api.exceptions.NoValidException;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class ProdutoServiceImpl implements ProdutoService {

    final ProdutoRepository produtoRepository;

    public ProdutoServiceImpl(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }


    @Override
    public ProdutoModel save(ProdutoRecordDto produtoRecordDto) {

       var produtoModel= new ProdutoModel();

       findByNome(produtoRecordDto.nome());

        CustomBeanUtils.copyProperties(produtoRecordDto,produtoModel);

        produtoModel.setDataCriacao(LocalDateTime.now(ZoneId.of("UTC")));
        produtoModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));

        return produtoRepository.save(produtoModel);
    }

    @Override
    public ProdutoModel findByProdutoId(UUID produtoId) {

        ProdutoModel produtoModel = produtoRepository.findByProdutoId(produtoId);

        if(produtoModel==null){
            throw  new NotFoundException("Erro: Produto não existe.");
        }

        return produtoModel;
    }

    @Override
    public ProdutoModel findByNome(String nome) {
        ProdutoModel produtoModel = produtoRepository.findByNome(nome);

        if(produtoModel!=null){
            throw  new NoValidException("Erro: Já existe um produto com esse Nome : " + nome);
        }
        return produtoModel;
    }

    @Override
    public ProdutoModel update(ProdutoRecordDto produtoRecordDto, UUID produtoId) {

        ProdutoModel produtoModel = produtoRepository.findByProdutoId(produtoId);
        ProdutoModel produtoModel1 = produtoRepository.findByNome(produtoRecordDto.nome());

        if(produtoModel ==null){
            throw new NotFoundException("Produto ID: " + produtoId + " não existe");
        }

        if (produtoModel1 != null && produtoModel1.getProdutoId() != produtoModel.getProdutoId()) {
            throw new NoValidException("Nome do produto, já existe cadastrado para outro produto");
        }

        CustomBeanUtils.copyProperties(produtoRecordDto,produtoModel);

        produtoModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));

        return produtoRepository.save(produtoModel);
    }

    @Override
    public Page<ProdutoModel> findAll(Pageable pageable) {
        return produtoRepository.findAll(pageable);
    }
}
