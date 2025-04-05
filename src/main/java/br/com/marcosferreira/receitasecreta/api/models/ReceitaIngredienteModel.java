package br.com.marcosferreira.receitasecreta.api.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "TB_RECEITA_INGREDIENTE")

public class ReceitaIngredienteModel implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "receitaingredienteId", nullable = false, unique = true)
    private UUID receitaingredienteId = UUID.randomUUID();


    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "receitaId")
    private ReceitaModel receita;

    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ingredienteId")
    private IngredienteModel ingrediente;

    @Column(name = "quantidade", nullable = false)
    private BigDecimal quantidade;

    @Column(name = "unidademedida", nullable = false)
    private String unidadeMedida;

    public UUID getReceitaingredienteId() {
        return receitaingredienteId;
    }

    public void setReceitaingredienteId(UUID receitaingredienteId) {
        this.receitaingredienteId = receitaingredienteId;
    }

    public ReceitaModel getReceita() {
        return receita;
    }

    public void setReceita(ReceitaModel receita) {
        this.receita = receita;
    }

    public IngredienteModel getIngrediente() {
        return ingrediente;
    }

    public void setIngrediente(IngredienteModel ingrediente) {
        this.ingrediente = ingrediente;
    }

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }
}
