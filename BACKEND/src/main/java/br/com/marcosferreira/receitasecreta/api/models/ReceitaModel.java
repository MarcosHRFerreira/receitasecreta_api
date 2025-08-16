package br.com.marcosferreira.receitasecreta.api.models;

import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "TB_RECEITAS")
@EntityListeners(br.com.marcosferreira.receitasecreta.api.configs.AuditInterceptor.class)
public class ReceitaModel implements Serializable {


    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "receitaId", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID receitaId;

    @Column(name = "nomereceita", nullable = false)
    private String nomeReceita;

    @Column(name = "modopreparo", nullable = false, columnDefinition = "TEXT")
    private String modoPreparo;

    @Column(name = "tempopreparo", nullable = false)
    private String tempoPreparo;

    @Column(name = "rendimento", nullable = false)
    private String rendimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private CategoriaReceita categoria;

    @Column(name = "dificuldade")
    @Enumerated(EnumType.STRING)
    private Dificuldade dificuldade;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "tags")
    private String tags;

    @Column(name = "favorita", nullable = false)
    private Boolean favorita = false;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;
    @Column(nullable = false)
    private LocalDateTime  dataAlteracao;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;



    @JsonProperty("receitaId")
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

    public String getModoPreparo() {
        return modoPreparo;
    }

    public void setModoPreparo(String modoPreparo) {
        this.modoPreparo = modoPreparo;
    }

    public String getTempoPreparo() {
        return tempoPreparo;
    }

    public void setTempoPreparo(String tempoPreparo) {
        this.tempoPreparo = tempoPreparo;
    }

    public String getRendimento() {
        return rendimento;
    }

    public void setRendimento(String rendimento) {
        this.rendimento = rendimento;
    }

    public CategoriaReceita getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaReceita categoria) {
        this.categoria = categoria;
    }

    public Dificuldade getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(Dificuldade dificuldade) {
        this.dificuldade = dificuldade;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Boolean getFavorita() {
        return favorita;
    }

    public void setFavorita(Boolean favorita) {
        this.favorita = favorita;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAlteracao() {
        return dataAlteracao;
    }

    public void setDataAlteracao(LocalDateTime dataAlteracao) {
        this.dataAlteracao = dataAlteracao;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
