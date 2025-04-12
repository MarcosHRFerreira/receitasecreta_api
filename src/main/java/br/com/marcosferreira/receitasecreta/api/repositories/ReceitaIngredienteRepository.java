package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ReceitaIngredienteRepository extends JpaRepository<ReceitaIngredienteModel, UUID> {

    @Query(value="SELECT * FROM TB_RECEITA_INGREDIENTE WHERE ingrediente_id  = :ingredienteId and receita_id = :receitaId" , nativeQuery = true)
    ReceitaIngredienteModel findByIngredienteIdReceitaId(UUID receitaId, UUID ingredienteId);
}
