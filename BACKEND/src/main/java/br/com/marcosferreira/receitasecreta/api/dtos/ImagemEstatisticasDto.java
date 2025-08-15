package br.com.marcosferreira.receitasecreta.api.dtos;

/**
 * DTO para estatísticas de imagens de receitas.
 */
public class ImagemEstatisticasDto {
    private final long totalImagens;
    private final long tamanhoTotalBytes;
    private final int limiteMaximo;

    public ImagemEstatisticasDto(long totalImagens, long tamanhoTotalBytes, int limiteMaximo) {
        this.totalImagens = totalImagens;
        this.tamanhoTotalBytes = tamanhoTotalBytes;
        this.limiteMaximo = limiteMaximo;
    }

    public long getTotalImagens() {
        return totalImagens;
    }

    public long getTamanhoTotalBytes() {
        return tamanhoTotalBytes;
    }

    public int getLimiteMaximo() {
        return limiteMaximo;
    }

    public String getTamanhoTotalFormatado() {
        if (tamanhoTotalBytes < 1024) {
            return tamanhoTotalBytes + " B";
        } else if (tamanhoTotalBytes < 1024 * 1024) {
            return String.format("%.1f KB", tamanhoTotalBytes / 1024.0);
        } else {
            return String.format("%.1f MB", tamanhoTotalBytes / (1024.0 * 1024.0));
        }
    }
}