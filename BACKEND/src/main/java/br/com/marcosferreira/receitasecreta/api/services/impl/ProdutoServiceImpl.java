package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.configs.AuthenticationUtils;
import br.com.marcosferreira.receitasecreta.api.configs.CustomBeanUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ProdutoRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NoValidException;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.exceptions.UnauthorizedException;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class ProdutoServiceImpl implements ProdutoService {

    final ProdutoRepository produtoRepository;
    
    @Autowired
    AuthenticationUtils authUtils;
    
    @Autowired
    AuditService auditService;

    public ProdutoServiceImpl(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }


    @Override
    public ProdutoModel save(ProdutoRecordDto produtoRecordDto) {
        User currentUser = authUtils.getCurrentUser();
        
        var produtoModel = new ProdutoModel();
        
        // Verificar se já existe um produto com esse nome
        ProdutoModel existingProduto = produtoRepository.findByNome(produtoRecordDto.nome());
        if (existingProduto != null) {
            throw new NoValidException("Erro: Já existe um produto com esse Nome : " + produtoRecordDto.nome());
        }
        
        CustomBeanUtils.copyProperties(produtoRecordDto, produtoModel);
        
        // Campos de auditoria
        produtoModel.setUserId(currentUser.getId());
        produtoModel.setCreatedBy(currentUser.getLogin());
        produtoModel.setCreatedAt(LocalDateTime.now(ZoneId.of("UTC")));
        
        // Campos existentes
        produtoModel.setDataCriacao(LocalDateTime.now(ZoneId.of("UTC")));
        produtoModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));
        
        ProdutoModel savedProduto = produtoRepository.save(produtoModel);
        
        // Auditoria
        if (savedProduto != null && savedProduto.getProdutoId() != null) {
            auditService.auditProdutoChange(savedProduto.getProdutoId().toString(), "CREATE", currentUser.getId());
        }
        
        return savedProduto;
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
        
        if (produtoModel == null) {
            throw new NotFoundException("Produto ID: " + produtoId + " não existe");
        }
        
        User currentUser = authUtils.getCurrentUser();
        
        // Verificar se o usuário é o proprietário
        if (!produtoModel.getUserId().equals(currentUser.getId())) {
            auditService.auditUnauthorizedAccess("PRODUTO_" + produtoId, currentUser.getId(), "UPDATE");
            throw new UnauthorizedException("Você não tem permissão para alterar este produto");
        }
        
        ProdutoModel produtoModel1 = produtoRepository.findByNome(produtoRecordDto.nome());
        
        if (produtoModel1 != null && produtoModel1.getProdutoId() != produtoModel.getProdutoId()) {
            throw new NoValidException("Nome do produto, já existe cadastrado para outro produto");
        }
        
        CustomBeanUtils.copyProperties(produtoRecordDto, produtoModel);
        
        // Campos de auditoria
        produtoModel.setUpdatedAt(LocalDateTime.now(ZoneId.of("UTC")));
        produtoModel.setUpdatedBy(currentUser.getLogin());
        
        // Campo existente
        produtoModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));
        
        ProdutoModel updatedProduto = produtoRepository.save(produtoModel);
        
        // Auditoria
        auditService.auditProdutoChange(produtoId.toString(), "UPDATE", currentUser.getId());
        
        return updatedProduto;
    }

    @Override
    public Page<ProdutoModel> findAll(Pageable pageable) {
        return produtoRepository.findAll(pageable);
    }
    
    @Override
    public void delete(UUID produtoId) {
        User currentUser = authUtils.getCurrentUser();
        
        // Verificar se o produto existe
        ProdutoModel produto = produtoRepository.findByProdutoId(produtoId);
        if (produto == null) {
            throw new NotFoundException("Produto não encontrado");
        }
        
        // Verificar se o usuário é o proprietário
        if (!produto.getUserId().equals(currentUser.getId())) {
            auditService.auditUnauthorizedAccess("PRODUTO_" + produtoId, currentUser.getId(), "DELETE");
            throw new UnauthorizedException("Você não tem permissão para deletar este produto");
        }
        
        // Deletar o produto
        produtoRepository.deleteById(produtoId);
        
        // Auditoria
        auditService.auditProdutoChange(produtoId.toString(), "DELETE", currentUser.getId());
    }
}
