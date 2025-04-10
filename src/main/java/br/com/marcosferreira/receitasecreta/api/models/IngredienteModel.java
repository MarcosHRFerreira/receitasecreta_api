package br.com.marcosferreira.receitasecreta.api.models;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "TB_INGREDIENTES")
public class IngredienteModel implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "ingredienteId", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID ingredienteId; // UUID como identificador único

    @Column(name = "nome", nullable = false)
    private String nome; // Nome do ingrediente

    @Column(name = "unidademedida", nullable = false)
    private UnidadeMedida unidadeMedida; // Tipo de unidade de medida (gramas, litros, etc.)

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade; // Quantidade

    @Column(nullable = false)
    private LocalDateTime dataCriacao;
    @Column(nullable = false)
    private LocalDateTime  dataAlteracao;


    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private ProdutoModel produto;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToMany(mappedBy = "ingrediente", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Fetch(FetchMode.SUBSELECT)
    private Set<ReceitaIngredienteModel> receitaIngredientes;


    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public UnidadeMedida getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(UnidadeMedida unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
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



    public ProdutoModel getProduto() {
        return produto;
    }

    public void setProduto(ProdutoModel produto) {
        this.produto = produto;
    }



}
