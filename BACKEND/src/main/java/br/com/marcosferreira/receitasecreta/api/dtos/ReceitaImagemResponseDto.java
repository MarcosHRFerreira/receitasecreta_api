package br.com.marcosferreira.receitasecreta.api.dtos;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaImagemModel;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para resposta de dados de imagens de receitas.
 * 
 * Este DTO é usado para retornar informações das imagens nas respostas da API,
 * incluindo metadados, URLs de acesso e informações de auditoria.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReceitaImagemResponseDto {

    private UUID imagemId;
    private UUID receitaId;
    private String nomeReceita;
    private String nomeArquivo;
    private String nomeOriginal;
    private String urlImagem;
    private String urlThumbnail;
    private String tipoMime;
    private Long tamanhoBytes;
    private String tamanhoFormatado;
    private Integer largura;
    private Integer altura;
    private String resolucao;
    private Double proporcao;
    private Boolean ehPrincipal;
    private String descricao;
    private Integer ordemExibicao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String createdByName;
    private String updatedByName;

    // Construtores
    public ReceitaImagemResponseDto() {}

    public ReceitaImagemResponseDto(ReceitaImagemModel model) {
        this.imagemId = model.getImagemId();
        this.receitaId = model.getReceita() != null ? model.getReceita().getReceitaId() : null;
        this.nomeReceita = model.getReceita() != null ? model.getReceita().getNomeReceita() : null;
        this.nomeArquivo = model.getNomeArquivo();
        this.nomeOriginal = model.getNomeOriginal();
        this.tipoMime = model.getTipoMime();
        this.tamanhoBytes = model.getTamanhoBytes();
        this.tamanhoFormatado = model.getTamanhoFormatado();
        this.largura = model.getLargura();
        this.altura = model.getAltura();
        this.resolucao = model.getResolucao();
        this.proporcao = model.getProporcao();
        this.ehPrincipal = model.getEhPrincipal();
        this.descricao = model.getDescricao();
        this.ordemExibicao = model.getOrdemExibicao();
        this.createdAt = model.getCreatedAt();
        this.updatedAt = model.getUpdatedAt();
        this.createdByName = model.getCreatedBy() != null ? model.getCreatedBy().getName() : null;
        this.updatedByName = model.getUpdatedBy() != null ? model.getUpdatedBy().getName() : null;
    }

    // Método estático para conversão
    public static ReceitaImagemResponseDto fromModel(ReceitaImagemModel model) {
        return new ReceitaImagemResponseDto(model);
    }

    public static ReceitaImagemResponseDto fromModel(ReceitaImagemModel model, String baseUrl) {
        ReceitaImagemResponseDto dto = new ReceitaImagemResponseDto(model);
        dto.setUrlImagem(baseUrl + "/api/receitas/" + model.getReceita().getReceitaId() + "/imagens/" + model.getImagemId());
        dto.setUrlThumbnail(baseUrl + "/api/receitas/" + model.getReceita().getReceitaId() + "/imagens/" + model.getImagemId() + "/thumbnail");
        return dto;
    }

    // Getters e Setters
    public UUID getImagemId() {
        return imagemId;
    }

    public void setImagemId(UUID imagemId) {
        this.imagemId = imagemId;
    }

    public UUID getReceitaId() {
        return receitaId;
    }

    public void setReceitaId(UUID receitaId) {
        this.receitaId = receitaId;
    }

    public String getNomeReceita() {
        return nomeReceita;
    }

    public void setNomeReceita(String nomeReceita) {
        this.nomeReceita = nomeReceita;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public String getNomeOriginal() {
        return nomeOriginal;
    }

    public void setNomeOriginal(String nomeOriginal) {
        this.nomeOriginal = nomeOriginal;
    }

    public String getUrlImagem() {
        return urlImagem;
    }

    public void setUrlImagem(String urlImagem) {
        this.urlImagem = urlImagem;
    }

    public String getUrlThumbnail() {
        return urlThumbnail;
    }

    public void setUrlThumbnail(String urlThumbnail) {
        this.urlThumbnail = urlThumbnail;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public Long getTamanhoBytes() {
        return tamanhoBytes;
    }

    public void setTamanhoBytes(Long tamanhoBytes) {
        this.tamanhoBytes = tamanhoBytes;
    }

    public String getTamanhoFormatado() {
        return tamanhoFormatado;
    }

    public void setTamanhoFormatado(String tamanhoFormatado) {
        this.tamanhoFormatado = tamanhoFormatado;
    }

    public Integer getLargura() {
        return largura;
    }

    public void setLargura(Integer largura) {
        this.largura = largura;
    }

    public Integer getAltura() {
        return altura;
    }

    public void setAltura(Integer altura) {
        this.altura = altura;
    }

    public String getResolucao() {
        return resolucao;
    }

    public void setResolucao(String resolucao) {
        this.resolucao = resolucao;
    }

    public Double getProporcao() {
        return proporcao;
    }

    public void setProporcao(Double proporcao) {
        this.proporcao = proporcao;
    }

    public Boolean getEhPrincipal() {
        return ehPrincipal;
    }

    public void setEhPrincipal(Boolean ehPrincipal) {
        this.ehPrincipal = ehPrincipal;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
    }
    
    public void setUpdatedBy(br.com.marcosferreira.receitasecreta.api.models.User updatedBy) {
        this.updatedByName = updatedBy != null ? updatedBy.getName() : null;
    }
    
    public void setCreatedBy(br.com.marcosferreira.receitasecreta.api.models.User createdBy) {
        this.createdByName = createdBy != null ? createdBy.getName() : null;
    }

    // Métodos utilitários
    
    /**
     * Verifica se a imagem é do tipo JPEG.
     * @return true se for JPEG, false caso contrário
     */
    public boolean isJpeg() {
        return "image/jpeg".equals(this.tipoMime);
    }

    /**
     * Verifica se a imagem é do tipo PNG.
     * @return true se for PNG, false caso contrário
     */
    public boolean isPng() {
        return "image/png".equals(this.tipoMime);
    }

    /**
     * Verifica se a imagem é do tipo WebP.
     * @return true se for WebP, false caso contrário
     */
    public boolean isWebp() {
        return "image/webp".equals(this.tipoMime);
    }

    /**
     * Verifica se a imagem é do tipo GIF.
     * @return true se for GIF, false caso contrário
     */
    public boolean isGif() {
        return "image/gif".equals(this.tipoMime);
    }

    /**
     * Verifica se a imagem está em formato paisagem.
     * @return true se for paisagem, false caso contrário
     */
    public boolean isPaisagem() {
        return largura != null && altura != null && largura > altura;
    }

    /**
     * Verifica se a imagem está em formato retrato.
     * @return true se for retrato, false caso contrário
     */
    public boolean isRetrato() {
        return largura != null && altura != null && altura > largura;
    }

    /**
     * Verifica se a imagem é quadrada.
     * @return true se for quadrada, false caso contrário
     */
    public boolean isQuadrada() {
        return largura != null && altura != null && largura.equals(altura);
    }

    /**
     * Retorna a extensão do arquivo baseada no tipo MIME.
     * @return Extensão do arquivo
     */
    public String getExtensao() {
        if (tipoMime == null) return "";
        
        switch (tipoMime) {
            case "image/jpeg": return "jpg";
            case "image/png": return "png";
            case "image/webp": return "webp";
            case "image/gif": return "gif";
            default: return "";
        }
    }

    /**
     * Verifica se a imagem é considerada grande (> 2MB).
     * @return true se for grande, false caso contrário
     */
    public boolean isImagemGrande() {
        return tamanhoBytes != null && tamanhoBytes > 2 * 1024 * 1024;
    }

    /**
     * Verifica se a imagem tem alta resolução (> 1920x1080).
     * @return true se for alta resolução, false caso contrário
     */
    public boolean isAltaResolucao() {
        return largura != null && altura != null && 
               (largura > 1920 || altura > 1080);
    }

    @Override
    public String toString() {
        return "ReceitaImagemResponseDto{" +
                "imagemId=" + imagemId +
                ", receitaId=" + receitaId +
                ", nomeArquivo='" + nomeArquivo + '\'' +
                ", nomeOriginal='" + nomeOriginal + '\'' +
                ", tipoMime='" + tipoMime + '\'' +
                ", tamanhoFormatado='" + tamanhoFormatado + '\'' +
                ", resolucao='" + resolucao + '\'' +
                ", ehPrincipal=" + ehPrincipal +
                ", ordemExibicao=" + ordemExibicao +
                '}';
    }
}