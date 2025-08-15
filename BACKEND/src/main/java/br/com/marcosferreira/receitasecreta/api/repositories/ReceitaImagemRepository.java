package br.com.marcosferreira.receitasecreta.api.repositories;

import br.com.marcosferreira.receitasecreta.api.models.ReceitaImagemModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de banco de dados relacionadas às imagens das receitas.
 * 
 * Este repositório fornece métodos para buscar, inserir, atualizar e excluir imagens
 * associadas às receitas, incluindo queries customizadas para operações específicas.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public interface ReceitaImagemRepository extends JpaRepository<ReceitaImagemModel, UUID> {

    /**
     * Busca todas as imagens de uma receita específica ordenadas por ordem de exibição.
     * 
     * @param receitaId ID da receita
     * @return Lista de imagens ordenadas por ordem de exibição
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId ORDER BY ri.ordemExibicao ASC, ri.createdAt ASC")
    List<ReceitaImagemModel> findByReceitaIdOrderByOrdemExibicao(@Param("receitaId") UUID receitaId);

    /**
     * Busca todas as imagens de uma receita específica com paginação.
     * 
     * @param receitaId ID da receita
     * @param pageable Configuração de paginação
     * @return Página de imagens
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId ORDER BY ri.ordemExibicao ASC, ri.createdAt ASC")
    Page<ReceitaImagemModel> findByReceitaId(@Param("receitaId") UUID receitaId, Pageable pageable);

    /**
     * Busca a imagem principal de uma receita específica.
     * 
     * @param receitaId ID da receita
     * @return Optional com a imagem principal, se existir
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId AND ri.ehPrincipal = true")
    Optional<ReceitaImagemModel> findImagemPrincipalByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Busca imagens por tipo MIME.
     * 
     * @param tipoMime Tipo MIME da imagem
     * @param pageable Configuração de paginação
     * @return Página de imagens do tipo especificado
     */
    Page<ReceitaImagemModel> findByTipoMime(String tipoMime, Pageable pageable);

    /**
     * Busca imagens criadas em um período específico.
     * 
     * @param dataInicio Data de início do período
     * @param dataFim Data de fim do período
     * @param pageable Configuração de paginação
     * @return Página de imagens criadas no período
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.createdAt BETWEEN :dataInicio AND :dataFim ORDER BY ri.createdAt DESC")
    Page<ReceitaImagemModel> findByCreatedAtBetween(@Param("dataInicio") LocalDateTime dataInicio, 
                                                   @Param("dataFim") LocalDateTime dataFim, 
                                                   Pageable pageable);

    /**
     * Busca imagens por tamanho (em bytes) dentro de um intervalo.
     * 
     * @param tamanhoMin Tamanho mínimo em bytes
     * @param tamanhoMax Tamanho máximo em bytes
     * @param pageable Configuração de paginação
     * @return Página de imagens dentro do intervalo de tamanho
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.tamanhoBytes BETWEEN :tamanhoMin AND :tamanhoMax ORDER BY ri.tamanhoBytes DESC")
    Page<ReceitaImagemModel> findByTamanhoBetween(@Param("tamanhoMin") Long tamanhoMin, 
                                                 @Param("tamanhoMax") Long tamanhoMax, 
                                                 Pageable pageable);

    /**
     * Conta o número total de imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @return Número total de imagens da receita
     */
    @Query("SELECT COUNT(ri) FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Long countByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Verifica se uma receita possui imagem principal.
     * 
     * @param receitaId ID da receita
     * @return true se a receita possui imagem principal, false caso contrário
     */
    @Query("SELECT COUNT(ri) > 0 FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId AND ri.ehPrincipal = true")
    boolean existsImagemPrincipalByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Busca imagem por nome do arquivo.
     * 
     * @param nomeArquivo Nome do arquivo
     * @return Optional com a imagem, se encontrada
     */
    Optional<ReceitaImagemModel> findByNomeArquivo(String nomeArquivo);

    /**
     * Busca imagem por caminho do arquivo.
     * 
     * @param caminhoArquivo Caminho do arquivo
     * @return Optional com a imagem, se encontrada
     */
    Optional<ReceitaImagemModel> findByCaminhoArquivo(String caminhoArquivo);

    /**
     * Remove todas as imagens principais de uma receita (usado antes de definir uma nova principal).
     * 
     * @param receitaId ID da receita
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ehPrincipal = false WHERE ri.receita.receitaId = :receitaId AND ri.ehPrincipal = true")
    int removeImagemPrincipalByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Define uma imagem como principal para uma receita.
     * 
     * @param imagemId ID da imagem
     * @param receitaId ID da receita
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ehPrincipal = true WHERE ri.imagemId = :imagemId AND ri.receita.receitaId = :receitaId")
    int setImagemPrincipal(@Param("imagemId") UUID imagemId, @Param("receitaId") UUID receitaId);

    /**
     * Atualiza a ordem de exibição de uma imagem.
     * 
     * @param imagemId ID da imagem
     * @param novaOrdem Nova ordem de exibição
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ordemExibicao = :novaOrdem WHERE ri.imagemId = :imagemId")
    int updateOrdemExibicao(@Param("imagemId") UUID imagemId, @Param("novaOrdem") Integer novaOrdem);

    /**
     * Atualiza a descrição de uma imagem.
     * 
     * @param imagemId ID da imagem
     * @param descricao Nova descrição
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.descricao = :descricao WHERE ri.imagemId = :imagemId")
    int updateDescricao(@Param("imagemId") UUID imagemId, @Param("descricao") String descricao);

    /**
     * Remove todas as imagens de uma receita específica.
     * 
     * @param receitaId ID da receita
     * @return Número de registros removidos
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    int deleteByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Busca imagens órfãs (sem receita associada) - para limpeza de dados.
     * 
     * @param pageable Configuração de paginação
     * @return Página de imagens órfãs
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita IS NULL")
    Page<ReceitaImagemModel> findImagensOrfas(Pageable pageable);

    /**
     * Busca imagens antigas para possível limpeza.
     * 
     * @param dataLimite Data limite (imagens mais antigas que esta data)
     * @param pageable Configuração de paginação
     * @return Página de imagens antigas
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.createdAt < :dataLimite ORDER BY ri.createdAt ASC")
    Page<ReceitaImagemModel> findImagensAntigas(@Param("dataLimite") LocalDateTime dataLimite, Pageable pageable);

    /**
     * Calcula o tamanho total ocupado pelas imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @return Tamanho total em bytes
     */
    @Query("SELECT COALESCE(SUM(ri.tamanhoBytes), 0) FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Long calcularTamanhoTotalByReceitaId(@Param("receitaId") UUID receitaId);

    /**
     * Calcula o tamanho total ocupado por todas as imagens no sistema.
     * 
     * @return Tamanho total em bytes
     */
    @Query("SELECT COALESCE(SUM(ri.tamanhoBytes), 0) FROM ReceitaImagemModel ri")
    Long calcularTamanhoTotalSistema();

    /**
     * Busca estatísticas de imagens por tipo MIME.
     * 
     * @return Lista de arrays com [tipoMime, quantidade, tamanhoTotal]
     */
    @Query("SELECT ri.tipoMime, COUNT(ri), COALESCE(SUM(ri.tamanhoBytes), 0) FROM ReceitaImagemModel ri GROUP BY ri.tipoMime ORDER BY COUNT(ri) DESC")
    List<Object[]> getEstatisticasPorTipoMime();

    /**
     * Busca as receitas com mais imagens.
     * 
     * @param pageable Configuração de paginação
     * @return Lista de arrays com [receitaId, nomeReceita, quantidadeImagens]
     */
    @Query("SELECT ri.receita.receitaId, ri.receita.nomeReceita, COUNT(ri) FROM ReceitaImagemModel ri GROUP BY ri.receita.receitaId, ri.receita.nomeReceita ORDER BY COUNT(ri) DESC")
    Page<Object[]> getReceitasComMaisImagens(Pageable pageable);

    /**
     * Verifica se existe uma imagem com o nome de arquivo especificado.
     * 
     * @param nomeArquivo Nome do arquivo
     * @return true se existe, false caso contrário
     */
    boolean existsByNomeArquivo(String nomeArquivo);

    /**
     * Verifica se existe uma imagem com o caminho de arquivo especificado.
     * 
     * @param caminhoArquivo Caminho do arquivo
     * @return true se existe, false caso contrário
     */
    boolean existsByCaminhoArquivo(String caminhoArquivo);

    /**
     * Busca a próxima ordem de exibição disponível para uma receita.
     * 
     * @param receitaId ID da receita
     * @return Próxima ordem de exibição disponível
     */
    @Query("SELECT COALESCE(MAX(ri.ordemExibicao), -1) + 1 FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Integer getProximaOrdemExibicao(@Param("receitaId") UUID receitaId);

    /**
     * Busca imagens de uma receita com ordem de exibição maior que a especificada.
     * 
     * @param receitaId ID da receita
     * @param ordemAtual Ordem atual
     * @return Lista de imagens com ordem maior
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId AND ri.ordemExibicao > :ordemAtual ORDER BY ri.ordemExibicao ASC")
    List<ReceitaImagemModel> findImagensComOrdemMaior(@Param("receitaId") UUID receitaId, @Param("ordemAtual") Integer ordemAtual);

    /**
     * Reordena as imagens de uma receita após a remoção de uma imagem.
     * 
     * @param receitaId ID da receita
     * @param ordemRemovida Ordem da imagem removida
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ordemExibicao = ri.ordemExibicao - 1 WHERE ri.receita.receitaId = :receitaId AND ri.ordemExibicao > :ordemRemovida")
    int reordenarAposRemocao(@Param("receitaId") UUID receitaId, @Param("ordemRemovida") Integer ordemRemovida);
    
    /**
     * Busca a imagem principal de uma receita específica.
     * 
     * @param receitaId ID da receita
     * @return Imagem principal da receita, se existir
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId AND ri.ehPrincipal = true")
    Optional<ReceitaImagemModel> findByReceitaReceitaIdAndEhPrincipalTrue(@Param("receitaId") UUID receitaId);
    
    /**
     * Conta o número de imagens de uma receita específica.
     * 
     * @param receitaId ID da receita
     * @return Número de imagens da receita
     */
    @Query("SELECT COUNT(ri) FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Long countByReceitaReceitaId(@Param("receitaId") UUID receitaId);
    
    /**
     * Calcula o tamanho total em bytes das imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @return Tamanho total em bytes
     */
    @Query("SELECT COALESCE(SUM(ri.tamanhoBytes), 0) FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Long sumTamanhoBytesByReceitaId(@Param("receitaId") UUID receitaId);
    
    /**
     * Atualiza o status de imagem principal.
     * 
     * @param imagemId ID da imagem
     * @param ehPrincipal Se é imagem principal
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ehPrincipal = :ehPrincipal WHERE ri.imagemId = :imagemId")
    int updateEhPrincipal(@Param("imagemId") UUID imagemId, @Param("ehPrincipal") boolean ehPrincipal);
    
    /**
     * Busca a primeira imagem de uma receita ordenada por ordem de exibição e data de criação.
     * 
     * @param receitaId ID da receita
     * @return Primeira imagem da receita, se existir
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId ORDER BY ri.ordemExibicao ASC, ri.createdAt ASC")
    Optional<ReceitaImagemModel> findFirstByReceitaReceitaIdOrderByOrdemExibicaoAscCreatedAtAsc(@Param("receitaId") UUID receitaId);
    
    /**
     * Atualiza o status de imagem principal para todas as imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @param ehPrincipal Se é imagem principal
     * @return Número de registros atualizados
     */
    @Modifying
    @Transactional
    @Query("UPDATE ReceitaImagemModel ri SET ri.ehPrincipal = :ehPrincipal WHERE ri.receita.receitaId = :receitaId")
    int updateEhPrincipalByReceitaId(@Param("receitaId") UUID receitaId, @Param("ehPrincipal") boolean ehPrincipal);
    
    /**
     * Busca a ordem máxima de exibição para uma receita.
     * 
     * @param receitaId ID da receita
     * @return Ordem máxima de exibição
     */
    @Query("SELECT COALESCE(MAX(ri.ordemExibicao), -1) FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId")
    Integer findMaxOrdemExibicaoByReceitaId(@Param("receitaId") UUID receitaId);
    
    /**
     * Busca imagens por receita com paginação (método alternativo).
     * 
     * @param receitaId ID da receita
     * @param pageable Configuração de paginação
     * @return Página de imagens
     */
    @Query("SELECT ri FROM ReceitaImagemModel ri WHERE ri.receita.receitaId = :receitaId ORDER BY ri.ordemExibicao ASC, ri.createdAt ASC")
    Page<ReceitaImagemModel> findByReceitaReceitaId(@Param("receitaId") UUID receitaId, Pageable pageable);
}