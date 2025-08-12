package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, UUID> {


    @Query(value="select * from TB_PRODUTOS where produto_id = :produtoId LIMIT 1", nativeQuery = true)
    ProdutoModel findByProdutoId(UUID produtoId);

    @Query(value="select * from TB_PRODUTOS where LOWER(nome) = LOWER(:nome) LIMIT 1", nativeQuery = true)
    ProdutoModel findByNome(String nome);
}
