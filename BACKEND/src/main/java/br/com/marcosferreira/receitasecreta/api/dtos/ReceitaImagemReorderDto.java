package br.com.marcosferreira.receitasecreta.api.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * DTO para reordenação de imagens de receitas.
 */
public class ReceitaImagemReorderDto {
    
    @NotNull(message = "ID da receita é obrigatório")
    private UUID receitaId;
    
    @NotEmpty(message = "Lista de ordens não pode estar vazia")
    @Valid
    private List<ImagemOrdemDto> ordens;
    
    public ReceitaImagemReorderDto() {}
    
    public ReceitaImagemReorderDto(UUID receitaId, List<ImagemOrdemDto> ordens) {
        this.receitaId = receitaId;
        this.ordens = ordens;
    }
    
    public UUID getReceitaId() {
        return receitaId;
    }
    
    public void setReceitaId(UUID receitaId) {
        this.receitaId = receitaId;
    }
    
    public List<ImagemOrdemDto> getOrdens() {
        return ordens;
    }
    
    public void setOrdens(List<ImagemOrdemDto> ordens) {
        this.ordens = ordens;
    }
    
    /**
     * DTO para ordem de uma imagem específica.
     */
    public static class ImagemOrdemDto {
        
        @NotNull(message = "ID da imagem é obrigatório")
        private UUID imagemId;
        
        @NotNull(message = "Ordem é obrigatória")
        private Integer ordem;
        
        public ImagemOrdemDto() {}
        
        public ImagemOrdemDto(UUID imagemId, Integer ordem) {
            this.imagemId = imagemId;
            this.ordem = ordem;
        }
        
        public UUID getImagemId() {
            return imagemId;
        }
        
        public void setImagemId(UUID imagemId) {
            this.imagemId = imagemId;
        }
        
        public Integer getOrdem() {
            return ordem;
        }
        
        public void setOrdem(Integer ordem) {
            this.ordem = ordem;
        }
    }
}