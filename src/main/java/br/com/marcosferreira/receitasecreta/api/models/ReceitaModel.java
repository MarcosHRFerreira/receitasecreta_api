package br.com.marcosferreira.receitasecreta.api.models;

import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "TB_RECEITAS")

public class ReceitaModel implements Serializable {


    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "receitaId", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID receitaId; // UUID como identificador único

    @Column(name = "nomereceita", nullable = false)
    private String nomeReceita; // Nome da receita

    @Column(name = "modopreparo", nullable = false)
    private String modoPreparo; // Instruções detalhadas para preparar a receita

    @Column(name = "tempopreparo", nullable = false)
    private String tempoPreparo; // Tempo necessário para preparar a receita (em minutos)

    @Column(name = "rendimento", nullable = false)
    private String rendimento; // Quantidade de porções que a receita gera

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private CategoriaReceita categoria; // Classificação da receita

    @Column(name = "dificuldade")
    private String dificuldade; // Nível de dificuldade da receita

    @Column(name = "notas")
    private String notas; // Notas ou ajustes personalizados

    @Column(name = "tags")
    private String tags; // Tags para facilitar a busca

    @Column(name = "favorita", nullable = false)
    private Boolean favorita = false; // Indica se a receita está marcada como favorita

    @Column(nullable = false)
    private LocalDateTime dataCriacao;
    @Column(nullable = false)
    private LocalDateTime  dataAlteracao;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToMany(mappedBy = "receita", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Fetch(FetchMode.SUBSELECT)
    private Set<ReceitaIngredienteModel> receitaIngredientes;



    public UUID getReceitaId() {
        return receitaId;
    }

    public void setReceitaId(UUID receitaId) {
        this.receitaId = receitaId;
    }

    public String getNomeReceita() {
        return nomeReceita;
    }

    public void setNomeReceita(String nomeReceita) {
        this.nomeReceita = nomeReceita;
    }


    public String getModoPreparo() {
        return modoPreparo;
    }

    public void setModoPreparo(String modoPreparo) {
        this.modoPreparo = modoPreparo;
    }

    public String getTempoPreparo() {
        return tempoPreparo;
    }

    public void setTempoPreparo(String tempoPreparo) {
        this.tempoPreparo = tempoPreparo;
    }

    public String getRendimento() {
        return rendimento;
    }

    public void setRendimento(String rendimento) {
        this.rendimento = rendimento;
    }

    public CategoriaReceita getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaReceita categoria) {
        this.categoria = categoria;
    }

    public String getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(String dificuldade) {
        this.dificuldade = dificuldade;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Boolean getFavorita() {
        return favorita;
    }

    public void setFavorita(Boolean favorita) {
        this.favorita = favorita;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAlteracao() {
        return dataAlteracao;
    }

    public void setDataAlteracao(LocalDateTime dataAlteracao) {
        this.dataAlteracao = dataAlteracao;
    }
}
