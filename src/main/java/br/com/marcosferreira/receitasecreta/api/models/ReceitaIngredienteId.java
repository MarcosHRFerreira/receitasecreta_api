package br.com.marcosferreira.receitasecreta.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ReceitaIngredienteId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "receitaId", nullable = false)
    private UUID receitaId;

    @Column(name = "ingredienteId", nullable = false)
    private UUID ingredienteId;


    public UUID getReceitaId() {
        return receitaId;
    }

    public void setReceitaId(UUID receitaId) {
        this.receitaId = receitaId;
    }

    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    // hashCode e equals
    @Override
    public int hashCode() {
        return Objects.hash(receitaId, ingredienteId);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ReceitaIngredienteId that = (ReceitaIngredienteId) obj;
        return Objects.equals(receitaId, that.receitaId) &&
                Objects.equals(ingredienteId, that.ingredienteId);
    }
}