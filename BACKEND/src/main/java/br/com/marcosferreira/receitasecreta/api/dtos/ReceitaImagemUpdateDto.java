package br.com.marcosferreira.receitasecreta.api.dtos;

import jakarta.validation.constraints.*;

import java.util.UUID;

/**
 * DTO para atualização de dados de imagens de receitas.
 * 
 * Este DTO é usado para receber dados de atualização de imagens existentes,
 * permitindo modificar descrição, status de imagem principal e ordem de exibição.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
public class ReceitaImagemUpdateDto {

    @NotNull(message = "ID da imagem é obrigatório")
    private UUID imagemId;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    private String descricao;

    private Boolean ehPrincipal;

    @Min(value = 0, message = "Ordem de exibição deve ser maior ou igual a 0")
    private Integer ordemExibicao;

    // Construtores
    public ReceitaImagemUpdateDto() {}

    public ReceitaImagemUpdateDto(UUID imagemId) {
        this.imagemId = imagemId;
    }

    public ReceitaImagemUpdateDto(UUID imagemId, String descricao) {
        this.imagemId = imagemId;
        this.descricao = descricao;
    }

    public ReceitaImagemUpdateDto(UUID imagemId, String descricao, Boolean ehPrincipal, Integer ordemExibicao) {
        this.imagemId = imagemId;
        this.descricao = descricao;
        this.ehPrincipal = ehPrincipal;
        this.ordemExibicao = ordemExibicao;
    }

    // Getters e Setters
    public UUID getImagemId() {
        return imagemId;
    }

    public void setImagemId(UUID imagemId) {
        this.imagemId = imagemId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Boolean getEhPrincipal() {
        return ehPrincipal;
    }

    public void setEhPrincipal(Boolean ehPrincipal) {
        this.ehPrincipal = ehPrincipal;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }

    // Métodos utilitários
    
    /**
     * Verifica se há algum campo para atualizar.
     * @return true se há campos para atualizar, false caso contrário
     */
    public boolean hasUpdates() {
        return descricao != null || ehPrincipal != null || ordemExibicao != null;
    }

    /**
     * Verifica se apenas a descrição será atualizada.
     * @return true se apenas a descrição será atualizada, false caso contrário
     */
    public boolean isOnlyDescricaoUpdate() {
        return descricao != null && ehPrincipal == null && ordemExibicao == null;
    }

    /**
     * Verifica se o status de imagem principal será atualizado.
     * @return true se o status será atualizado, false caso contrário
     */
    public boolean isUpdatingPrincipal() {
        return ehPrincipal != null;
    }

    /**
     * Verifica se a ordem de exibição será atualizada.
     * @return true se a ordem será atualizada, false caso contrário
     */
    public boolean isUpdatingOrdem() {
        return ordemExibicao != null;
    }

    /**
     * Verifica se está definindo a imagem como principal.
     * @return true se está definindo como principal, false caso contrário
     */
    public boolean isSettingAsPrincipal() {
        return ehPrincipal != null && ehPrincipal;
    }

    /**
     * Verifica se está removendo o status de imagem principal.
     * @return true se está removendo o status, false caso contrário
     */
    public boolean isRemovingPrincipal() {
        return ehPrincipal != null && !ehPrincipal;
    }

    /**
     * Verifica se a descrição está sendo removida (definida como null ou vazia).
     * @return true se a descrição está sendo removida, false caso contrário
     */
    public boolean isRemovingDescricao() {
        return descricao != null && descricao.trim().isEmpty();
    }

    /**
     * Retorna a descrição limpa (sem espaços extras) ou null se vazia.
     * @return Descrição limpa ou null
     */
    public String getDescricaoLimpa() {
        if (descricao == null) return null;
        String trimmed = descricao.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Valida se os dados de atualização são válidos.
     * @return true se válidos, false caso contrário
     */
    public boolean isValido() {
        return imagemId != null && hasUpdates();
    }

    /**
     * Cria uma cópia do DTO com apenas os campos não nulos.
     * @return Nova instância com apenas campos não nulos
     */
    public ReceitaImagemUpdateDto copyNonNullFields() {
        ReceitaImagemUpdateDto copy = new ReceitaImagemUpdateDto(this.imagemId);
        
        if (this.descricao != null) {
            copy.setDescricao(this.descricao);
        }
        
        if (this.ehPrincipal != null) {
            copy.setEhPrincipal(this.ehPrincipal);
        }
        
        if (this.ordemExibicao != null) {
            copy.setOrdemExibicao(this.ordemExibicao);
        }
        
        return copy;
    }

    /**
     * Aplica apenas as atualizações de metadados (descrição), ignorando ordem e principal.
     * @return DTO com apenas metadados
     */
    public ReceitaImagemUpdateDto onlyMetadataUpdates() {
        return new ReceitaImagemUpdateDto(this.imagemId, this.descricao);
    }

    /**
     * Aplica apenas as atualizações de ordem e principal, ignorando metadados.
     * @return DTO com apenas ordem e principal
     */
    public ReceitaImagemUpdateDto onlyStructuralUpdates() {
        ReceitaImagemUpdateDto dto = new ReceitaImagemUpdateDto(this.imagemId);
        dto.setEhPrincipal(this.ehPrincipal);
        dto.setOrdemExibicao(this.ordemExibicao);
        return dto;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ReceitaImagemUpdateDto that = (ReceitaImagemUpdateDto) obj;
        return imagemId != null && imagemId.equals(that.imagemId);
    }

    @Override
    public int hashCode() {
        return imagemId != null ? imagemId.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "ReceitaImagemUpdateDto{" +
                "imagemId=" + imagemId +
                ", descricao='" + descricao + '\'' +
                ", ehPrincipal=" + ehPrincipal +
                ", ordemExibicao=" + ordemExibicao +
                ", hasUpdates=" + hasUpdates() +
                '}';
    }
}