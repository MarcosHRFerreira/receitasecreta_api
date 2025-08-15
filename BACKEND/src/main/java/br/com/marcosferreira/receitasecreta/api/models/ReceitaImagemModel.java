package br.com.marcosferreira.receitasecreta.api.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade JPA para representar imagens associadas às receitas.
 * 
 * Esta entidade mapeia a tabela 'receita_imagens' e gerencia todas as informações
 * relacionadas às imagens das receitas, incluindo metadados, relacionamentos e auditoria.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "receita_imagens", indexes = {
    @Index(name = "idx_receita_imagens_receita_id", columnList = "receita_id"),
    @Index(name = "idx_receita_imagens_principal", columnList = "receita_id, eh_principal"),
    @Index(name = "idx_receita_imagens_ordem", columnList = "receita_id, ordem_exibicao"),
    @Index(name = "idx_receita_imagens_created_at", columnList = "created_at"),
    @Index(name = "idx_receita_imagens_tipo_mime", columnList = "tipo_mime")
})
public class ReceitaImagemModel {

    @Id
    @UuidGenerator
    @Column(name = "imagem_id", updatable = false, nullable = false)
    private UUID imagemId;

    @NotNull(message = "Receita é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_id", nullable = false, foreignKey = @ForeignKey(name = "fk_receita_imagens_receita"))
    private ReceitaModel receita;

    @NotBlank(message = "Nome do arquivo é obrigatório")
    @Size(max = 255, message = "Nome do arquivo deve ter no máximo 255 caracteres")
    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;

    @NotBlank(message = "Nome original é obrigatório")
    @Size(max = 255, message = "Nome original deve ter no máximo 255 caracteres")
    @Column(name = "nome_original", nullable = false, length = 255)
    private String nomeOriginal;

    @NotBlank(message = "Caminho do arquivo é obrigatório")
    @Size(max = 500, message = "Caminho do arquivo deve ter no máximo 500 caracteres")
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;

    @NotBlank(message = "Tipo MIME é obrigatório")
    @Pattern(regexp = "^image/(jpeg|png|webp|gif)$", message = "Tipo MIME deve ser image/jpeg, image/png, image/webp ou image/gif")
    @Column(name = "tipo_mime", nullable = false, length = 100)
    private String tipoMime;

    @NotNull(message = "Tamanho em bytes é obrigatório")
    @Positive(message = "Tamanho deve ser positivo")
    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    @Positive(message = "Largura deve ser positiva")
    @Column(name = "largura")
    private Integer largura;

    @Positive(message = "Altura deve ser positiva")
    @Column(name = "altura")
    private Integer altura;

    @Column(name = "eh_principal", nullable = false)
    private Boolean ehPrincipal = false;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Min(value = 0, message = "Ordem de exibição deve ser maior ou igual a 0")
    @Column(name = "ordem_exibicao", nullable = false)
    private Integer ordemExibicao = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", foreignKey = @ForeignKey(name = "fk_receita_imagens_created_by"))
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", foreignKey = @ForeignKey(name = "fk_receita_imagens_updated_by"))
    private User updatedBy;

    // Construtores
    public ReceitaImagemModel() {}

    public ReceitaImagemModel(ReceitaModel receita, String nomeArquivo, String nomeOriginal, 
                             String caminhoArquivo, String tipoMime, Long tamanhoBytes) {
        this.receita = receita;
        this.nomeArquivo = nomeArquivo;
        this.nomeOriginal = nomeOriginal;
        this.caminhoArquivo = caminhoArquivo;
        this.tipoMime = tipoMime;
        this.tamanhoBytes = tamanhoBytes;
    }

    // Getters e Setters
    public UUID getImagemId() {
        return imagemId;
    }

    public void setImagemId(UUID imagemId) {
        this.imagemId = imagemId;
    }

    public ReceitaModel getReceita() {
        return receita;
    }

    public void setReceita(ReceitaModel receita) {
        this.receita = receita;
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

    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }

    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
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
     * Retorna o tamanho formatado em KB ou MB.
     * @return String com o tamanho formatado
     */
    public String getTamanhoFormatado() {
        if (tamanhoBytes == null) return "0 B";
        
        if (tamanhoBytes < 1024) {
            return tamanhoBytes + " B";
        } else if (tamanhoBytes < 1024 * 1024) {
            return String.format("%.1f KB", tamanhoBytes / 1024.0);
        } else {
            return String.format("%.1f MB", tamanhoBytes / (1024.0 * 1024.0));
        }
    }

    /**
     * Retorna a resolução da imagem formatada.
     * @return String com a resolução (ex: "800x600") ou null se não disponível
     */
    public String getResolucao() {
        if (largura != null && altura != null) {
            return largura + "x" + altura;
        }
        return null;
    }

    /**
     * Calcula a proporção (aspect ratio) da imagem.
     * @return Double com a proporção ou null se não disponível
     */
    public Double getProporcao() {
        if (largura != null && altura != null && altura > 0) {
            return (double) largura / altura;
        }
        return null;
    }

    // Métodos equals, hashCode e toString
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        ReceitaImagemModel that = (ReceitaImagemModel) obj;
        return imagemId != null && imagemId.equals(that.imagemId);
    }

    @Override
    public int hashCode() {
        return imagemId != null ? imagemId.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "ReceitaImagemModel{" +
                "imagemId=" + imagemId +
                ", nomeArquivo='" + nomeArquivo + '\'' +
                ", nomeOriginal='" + nomeOriginal + '\'' +
                ", tipoMime='" + tipoMime + '\'' +
                ", tamanhoBytes=" + tamanhoBytes +
                ", ehPrincipal=" + ehPrincipal +
                ", ordemExibicao=" + ordemExibicao +
                '}';
    }
}