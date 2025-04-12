package br.com.marcosferreira.receitasecreta.api.models;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "TB_RECEITA_INGREDIENTE")

public class ReceitaIngredienteModel implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "receitaingredienteId", nullable = false, unique = true)
    private UUID receitaingredienteId = UUID.randomUUID();

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receitaId", nullable = false)
    private ReceitaModel receita;


    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredienteId", nullable = false)
    private IngredienteModel ingrediente;


    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidademedida", nullable = false)
    private UnidadeMedida unidadeMedida;

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

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public UnidadeMedida getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(UnidadeMedida unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

}
