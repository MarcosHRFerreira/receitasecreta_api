package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ReceitaRepository extends JpaRepository<ReceitaModel, UUID> {


    @Query(value="SELECT * FROM TB_RECEITAS WHERE receita_id  = :receitaId", nativeQuery = true)
    ReceitaModel findByReceitaId(UUID receitaId);
}
