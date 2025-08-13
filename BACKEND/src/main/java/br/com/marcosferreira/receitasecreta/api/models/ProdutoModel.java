package br.com.marcosferreira.receitasecreta.api.models;


import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "TB_PRODUTOS")
@EntityListeners(br.com.marcosferreira.receitasecreta.api.configs.AuditInterceptor.class)
public class ProdutoModel implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "produtoId", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID produtoId;

    @Column(nullable = false, unique = true)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadeMedida unidademedida;


    @Column(name = "custounidade")
    private BigDecimal custoporunidade;

    @Column(name = "categoriaproduto")
    @Enumerated(EnumType.STRING)
    private CategoriaProduto categoriaproduto;

    @Column(name = "fornecedor")
    private String fornecedor;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "codigobarras")
    private String codigobarras;

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


    @JsonProperty("id")
    public UUID getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(UUID produtoId) {
        this.produtoId = produtoId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public UnidadeMedida getUnidademedida() {
        return unidademedida;
    }

    public void setUnidademedida(UnidadeMedida unidademedida) {
        this.unidademedida = unidademedida;
    }

    public BigDecimal getCustoporunidade() {
        return custoporunidade;
    }

    public void setCustoporunidade(BigDecimal custoporunidade) {
        this.custoporunidade = custoporunidade;
    }

    @JsonProperty("categoria")
    public CategoriaProduto getCategoriaproduto() {
        return categoriaproduto;
    }

    public void setCategoriaproduto(CategoriaProduto categoriaproduto) {
        this.categoriaproduto = categoriaproduto;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCodigobarras() {
        return codigobarras;
    }

    public void setCodigobarras(String codigobarras) {
        this.codigobarras = codigobarras;
    }

    @JsonProperty("createdAt")
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    @JsonProperty("updatedAt")
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