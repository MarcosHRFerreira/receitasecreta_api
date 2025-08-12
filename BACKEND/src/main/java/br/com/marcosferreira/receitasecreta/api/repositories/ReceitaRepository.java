package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ReceitaRepository extends JpaRepository<ReceitaModel, UUID> {


    @Query("SELECT r FROM ReceitaModel r WHERE r.receitaId = :receitaId")
    ReceitaModel findByReceitaId(UUID receitaId);
}
