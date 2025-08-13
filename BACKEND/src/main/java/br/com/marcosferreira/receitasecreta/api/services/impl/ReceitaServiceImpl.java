package br.com.marcosferreira.receitasecreta.api.services.impl;

import br.com.marcosferreira.receitasecreta.api.configs.AuthenticationUtils;
import br.com.marcosferreira.receitasecreta.api.configs.CustomBeanUtils;
import br.com.marcosferreira.receitasecreta.api.dtos.request.ReceitaRecordDto;
import br.com.marcosferreira.receitasecreta.api.exceptions.NotFoundException;
import br.com.marcosferreira.receitasecreta.api.exceptions.UnauthorizedException;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import br.com.marcosferreira.receitasecreta.api.services.AuditService;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class ReceitaServiceImpl implements ReceitaService {

    @Autowired
    ReceitaRepository receitaRepository;
    
    @Autowired
    AuthenticationUtils authUtils;
    
    @Autowired
    AuditService auditService;

    public ReceitaServiceImpl(ReceitaRepository receitaRepository) {
        this.receitaRepository = receitaRepository;
    }

    @Override
    public ReceitaModel save(ReceitaRecordDto receitaRecordDto) {
        User currentUser = authUtils.getCurrentUser();
        
        var receitaModel = new ReceitaModel();
        CustomBeanUtils.copyProperties(receitaRecordDto, receitaModel);
        
        // Campos de auditoria
        receitaModel.setUserId(currentUser.getId());
        receitaModel.setCreatedBy(currentUser.getLogin());
        receitaModel.setCreatedAt(LocalDateTime.now(ZoneId.of("UTC")));
        
        // Campos existentes
        receitaModel.setDataCriacao(LocalDateTime.now(ZoneId.of("UTC")));
        receitaModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));
        
        ReceitaModel savedReceita = receitaRepository.save(receitaModel);
        
        // Auditoria
        auditService.auditReceitaChange(savedReceita.getReceitaId().toString(), "CREATE", currentUser.getId());
        
        return savedReceita;
    }

    @Override
    public ReceitaModel findByReceitaId(UUID receitaId) {
        ReceitaModel receita = receitaRepository.findByReceitaId(receitaId);
        
        if (receita == null) {
            throw new NotFoundException("Receita não encontrada");
        }
        
        return receita;
    }

    @Override
    public ReceitaModel update(ReceitaRecordDto receitaRecordDto, UUID receitaId) {
        ReceitaModel receitaModel = receitaRepository.findByReceitaId(receitaId);
        
        if (receitaModel == null) {
            throw new NotFoundException("Erro: Receita não encontrada.");
        }
        
        User currentUser = authUtils.getCurrentUser();
        
        // Verificar se o usuário é o proprietário
        // Comentando temporariamente a validação de autorização para permitir edição de todas as receitas
        /*
        if (receitaModel.getUserId() != null && 
            !receitaModel.getUserId().isEmpty() && 
            !"system".equals(receitaModel.getUserId()) &&
            !receitaModel.getUserId().equals(currentUser.getId())) {
            auditService.auditUnauthorizedAccess("RECEITA_" + receitaId, currentUser.getId(), "UPDATE");
            throw new UnauthorizedException("Você não tem permissão para alterar esta receita");
        }
        */
        
        CustomBeanUtils.copyProperties(receitaRecordDto, receitaModel);
        
        // Se a receita não tem proprietário definido, atribuir ao usuário atual
        if (receitaModel.getUserId() == null || 
            receitaModel.getUserId().isEmpty() || 
            "system".equals(receitaModel.getUserId())) {
            receitaModel.setUserId(currentUser.getId());
            receitaModel.setCreatedBy(currentUser.getLogin());
        }
        
        // Campos de auditoria
        receitaModel.setUpdatedAt(LocalDateTime.now(ZoneId.of("UTC")));
        receitaModel.setUpdatedBy(currentUser.getLogin());
        
        // Campo existente
        receitaModel.setDataAlteracao(LocalDateTime.now(ZoneId.of("UTC")));
        
        ReceitaModel updatedReceita = receitaRepository.save(receitaModel);
        
        // Auditoria
        auditService.auditReceitaChange(receitaId.toString(), "UPDATE", currentUser.getId());
        
        return updatedReceita;
    }

    @Override
    public Page<ReceitaModel> findAll(Pageable pageable) {
        return receitaRepository.findAll(pageable);
    }
    
    @Override
    public void delete(UUID receitaId) {
        User currentUser = authUtils.getCurrentUser();
        
        // Verificar se a receita existe
        ReceitaModel receita = receitaRepository.findByReceitaId(receitaId);
        if (receita == null) {
            throw new NotFoundException("Receita não encontrada");
        }
        
        // Deletar a receita
        receitaRepository.deleteById(receitaId);
        
        // Auditoria
        auditService.auditReceitaChange(receitaId.toString(), "DELETE", currentUser.getId());
    }
}
