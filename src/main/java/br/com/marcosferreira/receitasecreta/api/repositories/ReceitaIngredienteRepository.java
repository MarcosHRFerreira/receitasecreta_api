package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReceitaIngredienteRepository extends JpaRepository<ReceitaIngredienteModel, UUID> {
}
