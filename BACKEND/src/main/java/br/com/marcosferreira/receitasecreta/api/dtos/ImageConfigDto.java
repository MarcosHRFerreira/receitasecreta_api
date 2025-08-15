package br.com.marcosferreira.receitasecreta.api.dtos;

import java.util.List;

/**
 * DTO para configurações do sistema de imagens.
 */
public class ImageConfigDto {
    
    private final int maxImagensPerReceita;
    private final long maxTamanhoArquivo;
    private final List<String> tiposPermitidos;
    private final int qualidadeThumbnail;
    private final int larguraMaxima;
    private final int alturaMaxima;
    
    public ImageConfigDto(int maxImagensPerReceita, long maxTamanhoArquivo, 
                         List<String> tiposPermitidos, int qualidadeThumbnail,
                         int larguraMaxima, int alturaMaxima) {
        this.maxImagensPerReceita = maxImagensPerReceita;
        this.maxTamanhoArquivo = maxTamanhoArquivo;
        this.tiposPermitidos = tiposPermitidos;
        this.qualidadeThumbnail = qualidadeThumbnail;
        this.larguraMaxima = larguraMaxima;
        this.alturaMaxima = alturaMaxima;
    }
    
    public int getMaxImagensPerReceita() {
        return maxImagensPerReceita;
    }
    
    public long getMaxTamanhoArquivo() {
        return maxTamanhoArquivo;
    }
    
    public List<String> getTiposPermitidos() {
        return tiposPermitidos;
    }
    
    public int getQualidadeThumbnail() {
        return qualidadeThumbnail;
    }
    
    public int getLarguraMaxima() {
        return larguraMaxima;
    }
    
    public int getAlturaMaxima() {
        return alturaMaxima;
    }
    
    public String getMaxTamanhoFormatado() {
        if (maxTamanhoArquivo < 1024) {
            return maxTamanhoArquivo + " B";
        } else if (maxTamanhoArquivo < 1024 * 1024) {
            return String.format("%.1f KB", maxTamanhoArquivo / 1024.0);
        } else {
            return String.format("%.1f MB", maxTamanhoArquivo / (1024.0 * 1024.0));
        }
    }
}