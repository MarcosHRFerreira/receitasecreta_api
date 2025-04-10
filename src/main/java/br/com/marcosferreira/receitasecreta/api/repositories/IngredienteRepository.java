package br.com.marcosferreira.receitasecreta.api.repositories;


import br.com.marcosferreira.receitasecreta.api.models.IngredienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface IngredienteRepository extends JpaRepository<IngredienteModel, UUID> {


    @Query(value="SELECT * FROM TB_INGREDIENTES WHERE ingrediente_id  = :ingredienteId", nativeQuery = true)
    IngredienteModel findByIngredienteId(UUID ingredienteId);

}
