package br.com.marcosferreira.receitasecreta.api.models;

import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import jakarta.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "TB_RECEITA_INGREDIENTE")

public class ReceitaIngredienteModel implements Serializable {

    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private ReceitaIngredienteId id;


    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidademedida", nullable = false)
    private UnidadeMedida unidadeMedida;

    // Getters e Setters
    public ReceitaIngredienteId getId() {
        return id;
    }

    public void setId(ReceitaIngredienteId id) {
        this.id = id;
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
