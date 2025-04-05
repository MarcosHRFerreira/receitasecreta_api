package br.com.marcosferreira.receitasecreta.api.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "TB_INGREDIENTES")
public class IngredienteModel implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "ingredienteId", nullable = false, unique = true)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID ingredienteId; // UUID como identificador único

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private ReceitaIngredienteModel receitaingrediente;


    @Column(name = "nome", nullable = false)
    private String nome; // Nome do ingrediente

    @Column(name = "unidademedida", nullable = false)
    private String unidadeMedida; // Tipo de unidade de medida (gramas, litros, etc.)

    @Column(name = "quantidadedisponivel", nullable = false)
    private BigDecimal quantidadeDisponivel; // Quantidade atual em estoque

    @Column(name = "custounidade")
    private BigDecimal custoPorUnidade; // Custo por unidade (opcional)

    @Column(name = "datavalidade")
    @Temporal(TemporalType.DATE)
    private Date dataValidade; // Data de validade (para perecíveis)

    @Column(name = "categoria")
    private String categoria; // Classificação do ingrediente

    @Column(name = "fornecedor")
    private String fornecedor; // Nome ou referência ao fornecedor

    @Column(name = "alertaestoque")
    private BigDecimal alertaEstoque; // Quantidade mínima para alertar sobre estoque baixo

    @Column(name = "descricao")
    private String descricao; // Informações extras ou observações

    @Column(name = "localizacaoarmazenagem")
    private String localizacaoArmazenagem; // Localização no armazém

    @Column(name = "codigobarras")
    private String codigoBarras; // Código de barras (opcional)

    public UUID getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(UUID ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public BigDecimal getQuantidadeDisponivel() {
        return quantidadeDisponivel;
    }

    public void setQuantidadeDisponivel(BigDecimal quantidadeDisponivel) {
        this.quantidadeDisponivel = quantidadeDisponivel;
    }

    public BigDecimal getCustoPorUnidade() {
        return custoPorUnidade;
    }

    public void setCustoPorUnidade(BigDecimal custoPorUnidade) {
        this.custoPorUnidade = custoPorUnidade;
    }

    public Date getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(Date dataValidade) {
        this.dataValidade = dataValidade;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(String fornecedor) {
        this.fornecedor = fornecedor;
    }

    public BigDecimal getAlertaEstoque() {
        return alertaEstoque;
    }

    public void setAlertaEstoque(BigDecimal alertaEstoque) {
        this.alertaEstoque = alertaEstoque;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getLocalizacaoArmazenagem() {
        return localizacaoArmazenagem;
    }

    public void setLocalizacaoArmazenagem(String localizacaoArmazenagem) {
        this.localizacaoArmazenagem = localizacaoArmazenagem;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }
}
