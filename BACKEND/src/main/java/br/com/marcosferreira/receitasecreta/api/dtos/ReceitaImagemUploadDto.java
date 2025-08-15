package br.com.marcosferreira.receitasecreta.api.dtos;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * DTO para upload de imagens de receitas.
 * 
 * Este DTO é usado para receber dados de upload de imagens, incluindo o arquivo
 * e metadados associados como descrição, se é imagem principal e ordem de exibição.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
public class ReceitaImagemUploadDto {

    @NotNull(message = "Receita é obrigatória")
    private UUID receitaId;

    @NotNull(message = "Arquivo de imagem é obrigatório")
    private MultipartFile arquivo;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    private String descricao;

    private Boolean ehPrincipal = false;

    @Min(value = 0, message = "Ordem de exibição deve ser maior ou igual a 0")
    private Integer ordemExibicao;

    // Construtores
    public ReceitaImagemUploadDto() {}

    public ReceitaImagemUploadDto(UUID receitaId, MultipartFile arquivo) {
        this.receitaId = receitaId;
        this.arquivo = arquivo;
    }

    public ReceitaImagemUploadDto(UUID receitaId, MultipartFile arquivo, String descricao, 
                                 Boolean ehPrincipal, Integer ordemExibicao) {
        this.receitaId = receitaId;
        this.arquivo = arquivo;
        this.descricao = descricao;
        this.ehPrincipal = ehPrincipal;
        this.ordemExibicao = ordemExibicao;
    }

    // Getters e Setters
    public UUID getReceitaId() {
        return receitaId;
    }

    public void setReceitaId(UUID receitaId) {
        this.receitaId = receitaId;
    }

    public MultipartFile getArquivo() {
        return arquivo;
    }

    public void setArquivo(MultipartFile arquivo) {
        this.arquivo = arquivo;
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
     * Verifica se o arquivo está presente e não está vazio.
     * @return true se o arquivo é válido, false caso contrário
     */
    public boolean isArquivoValido() {
        return arquivo != null && !arquivo.isEmpty();
    }

    /**
     * Retorna o nome original do arquivo.
     * @return Nome original do arquivo ou null se não disponível
     */
    public String getNomeOriginalArquivo() {
        return arquivo != null ? arquivo.getOriginalFilename() : null;
    }

    /**
     * Retorna o tipo de conteúdo do arquivo.
     * @return Tipo de conteúdo (MIME type) ou null se não disponível
     */
    public String getTipoConteudo() {
        return arquivo != null ? arquivo.getContentType() : null;
    }

    /**
     * Retorna o tamanho do arquivo em bytes.
     * @return Tamanho do arquivo ou 0 se não disponível
     */
    public long getTamanhoArquivo() {
        return arquivo != null ? arquivo.getSize() : 0;
    }

    /**
     * Verifica se o arquivo é uma imagem baseado no tipo de conteúdo.
     * @return true se é uma imagem, false caso contrário
     */
    public boolean isImagem() {
        String contentType = getTipoConteudo();
        return contentType != null && contentType.startsWith("image/");
    }

    /**
     * Verifica se o tipo de imagem é suportado.
     * @return true se o tipo é suportado, false caso contrário
     */
    public boolean isTipoImagemSuportado() {
        String contentType = getTipoConteudo();
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/webp") ||
            contentType.equals("image/gif")
        );
    }

    /**
     * Retorna o tamanho formatado do arquivo.
     * @return String com o tamanho formatado
     */
    public String getTamanhoFormatado() {
        long tamanho = getTamanhoArquivo();
        
        if (tamanho < 1024) {
            return tamanho + " B";
        } else if (tamanho < 1024 * 1024) {
            return String.format("%.1f KB", tamanho / 1024.0);
        } else {
            return String.format("%.1f MB", tamanho / (1024.0 * 1024.0));
        }
    }

    /**
     * Valida se todos os dados obrigatórios estão presentes.
     * @return true se válido, false caso contrário
     */
    public boolean isValido() {
        return receitaId != null && isArquivoValido() && isTipoImagemSuportado();
    }

    @Override
    public String toString() {
        return "ReceitaImagemUploadDto{" +
                "receitaId=" + receitaId +
                ", arquivo=" + (arquivo != null ? arquivo.getOriginalFilename() : "null") +
                ", descricao='" + descricao + '\'' +
                ", ehPrincipal=" + ehPrincipal +
                ", ordemExibicao=" + ordemExibicao +
                ", tamanho=" + getTamanhoFormatado() +
                ", tipoConteudo='" + getTipoConteudo() + '\'' +
                '}';
    }
}