package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteId;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ReceitaIngredienteRepository extends JpaRepository<ReceitaIngredienteModel, ReceitaIngredienteId> {

    @Query("SELECT ri FROM ReceitaIngredienteModel ri LEFT JOIN FETCH ri.produto WHERE ri.id.receitaId = :receitaId")
    List<ReceitaIngredienteModel> findByReceitaId(UUID receitaId);

//    @Query(value="SELECT * FROM TB_RECEITA_INGREDIENTE WHERE receita_id = :receitaId and produto_id  = :produtoId "  , nativeQuery = true)
//    ReceitaIngredienteModel findByIngredienteIdReceitaId(UUID receitaId, UUID produtoId);
}




