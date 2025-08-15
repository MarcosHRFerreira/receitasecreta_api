package br.com.marcosferreira.receitasecreta.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Serviço para validação avançada de arquivos de imagem.
 * 
 * Este serviço fornece validações de segurança, tipo, tamanho, dimensões
 * e conteúdo de arquivos de imagem para garantir a integridade do sistema.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class FileValidationService {

    private static final Logger logger = LoggerFactory.getLogger(FileValidationService.class);
    
    // Configurações de validação
    @Value("${app.file.max-size:10485760}") // 10MB padrão
    private long maxFileSize;
    
    @Value("${app.file.min-size:1024}") // 1KB mínimo
    private long minFileSize;
    
    @Value("${app.image.max-width:4096}")
    private int maxImageWidth;
    
    @Value("${app.image.max-height:4096}")
    private int maxImageHeight;
    
    @Value("${app.image.min-width:50}")
    private int minImageWidth;
    
    @Value("${app.image.min-height:50}")
    private int minImageHeight;
    
    @Value("${app.file.allowed-mime-types:image/jpeg,image/png,image/webp,image/gif}")
    private String allowedMimeTypes;
    
    @Value("${app.file.allowed-extensions:jpg,jpeg,png,webp,gif}")
    private String allowedExtensions;
    
    // Assinaturas de arquivos (magic numbers) para validação de tipo
    private static final Map<String, byte[]> FILE_SIGNATURES = Map.of(
        "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF},
        "image/png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A},
        "image/gif", new byte[]{0x47, 0x49, 0x46, 0x38},
        "image/webp", new byte[]{0x52, 0x49, 0x46, 0x46}
    );
    
    // Padrões de nomes de arquivo perigosos
    private static final Pattern DANGEROUS_FILENAME_PATTERN = Pattern.compile(
        ".*[<>:\"/\\|?*].*|.*\\.\\..*|^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$",
        Pattern.CASE_INSENSITIVE
    );
    
    // Extensões duplas suspeitas
    private static final Set<String> SUSPICIOUS_EXTENSIONS = Set.of(
        "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jar", "php", "asp", "jsp"
    );

    /**
     * Valida completamente um arquivo de imagem.
     * 
     * @param file Arquivo a ser validado
     * @return Resultado da validação
     */
    public ValidationResult validateImageFile(MultipartFile file) {
        ValidationResult result = new ValidationResult();
        
        try {
            // Validações básicas
            validateBasicFile(file, result);
            if (!result.isValid()) {
                return result;
            }
            
            // Validações de nome de arquivo
            validateFilename(file.getOriginalFilename(), result);
            if (!result.isValid()) {
                return result;
            }
            
            // Validações de tipo MIME
            validateMimeType(file.getContentType(), result);
            if (!result.isValid()) {
                return result;
            }
            
            // Validações de extensão
            validateFileExtension(file.getOriginalFilename(), result);
            if (!result.isValid()) {
                return result;
            }
            
            // Validações de conteúdo (magic numbers)
            validateFileSignature(file, result);
            if (!result.isValid()) {
                return result;
            }
            
            // Validações de imagem (dimensões, formato)
            validateImageContent(file, result);
            if (!result.isValid()) {
                return result;
            }
            
            logger.debug("Arquivo validado com sucesso: {}", file.getOriginalFilename());
            
        } catch (Exception ex) {
            logger.error("Erro durante validação do arquivo: {}", file.getOriginalFilename(), ex);
            result.addError("Erro interno durante validação do arquivo");
        }
        
        return result;
    }

    /**
     * Valida apenas o tipo MIME de um arquivo.
     * 
     * @param mimeType Tipo MIME a ser validado
     * @return true se válido, false caso contrário
     */
    public boolean isValidMimeType(String mimeType) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            return false;
        }
        
        Set<String> allowed = getAllowedMimeTypesSet();
        return allowed.contains(mimeType.toLowerCase().trim());
    }

    /**
     * Valida apenas a extensão de um arquivo.
     * 
     * @param filename Nome do arquivo
     * @return true se válido, false caso contrário
     */
    public boolean isValidExtension(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return false;
        }
        
        String extension = getFileExtension(filename).toLowerCase();
        Set<String> allowed = getAllowedExtensionsSet();
        return allowed.contains(extension);
    }

    /**
     * Obtém as dimensões de uma imagem.
     * 
     * @param file Arquivo de imagem
     * @return Dimensões da imagem ou null se não for possível obter
     */
    public ImageDimensions getImageDimensions(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             ImageInputStream imageStream = ImageIO.createImageInputStream(inputStream)) {
            
            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageStream);
            if (readers.hasNext()) {
                ImageReader reader = readers.next();
                try {
                    reader.setInput(imageStream);
                    int width = reader.getWidth(0);
                    int height = reader.getHeight(0);
                    return new ImageDimensions(width, height);
                } finally {
                    reader.dispose();
                }
            }
        } catch (IOException ex) {
            logger.warn("Erro ao obter dimensões da imagem: {}", file.getOriginalFilename(), ex);
        }
        
        return null;
    }

    /**
     * Verifica se um arquivo é uma imagem válida.
     * 
     * @param file Arquivo a ser verificado
     * @return true se for uma imagem válida, false caso contrário
     */
    public boolean isValidImage(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage image = ImageIO.read(inputStream);
            return image != null;
        } catch (IOException ex) {
            logger.debug("Arquivo não é uma imagem válida: {}", file.getOriginalFilename());
            return false;
        }
    }

    /**
     * Calcula o hash MD5 de um arquivo para detecção de duplicatas.
     * 
     * @param file Arquivo
     * @return Hash MD5 ou null se erro
     */
    public String calculateFileHash(MultipartFile file) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(file.getBytes());
            
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            
            return sb.toString();
        } catch (Exception ex) {
            logger.error("Erro ao calcular hash do arquivo: {}", file.getOriginalFilename(), ex);
            return null;
        }
    }

    // Métodos privados de validação
    
    private void validateBasicFile(MultipartFile file, ValidationResult result) {
        if (file == null) {
            result.addError("Arquivo não fornecido");
            return;
        }
        
        if (file.isEmpty()) {
            result.addError("Arquivo está vazio");
            return;
        }
        
        long size = file.getSize();
        if (size < minFileSize) {
            result.addError(String.format("Arquivo muito pequeno. Tamanho mínimo: %d bytes", minFileSize));
        }
        
        if (size > maxFileSize) {
            result.addError(String.format("Arquivo muito grande. Tamanho máximo: %d bytes", maxFileSize));
        }
    }
    
    private void validateFilename(String filename, ValidationResult result) {
        if (filename == null || filename.trim().isEmpty()) {
            result.addError("Nome do arquivo não fornecido");
            return;
        }
        
        String cleanFilename = StringUtils.cleanPath(filename);
        
        // Verificar caracteres perigosos
        if (DANGEROUS_FILENAME_PATTERN.matcher(cleanFilename).matches()) {
            result.addError("Nome do arquivo contém caracteres não permitidos");
        }
        
        // Verificar sequências de caminho
        if (cleanFilename.contains("..")) {
            result.addError("Nome do arquivo contém sequência de caminho inválida");
        }
        
        // Verificar extensões duplas suspeitas
        String[] parts = cleanFilename.split("\\.");
        if (parts.length > 2) {
            for (int i = 1; i < parts.length - 1; i++) {
                if (SUSPICIOUS_EXTENSIONS.contains(parts[i].toLowerCase())) {
                    result.addError("Nome do arquivo contém extensão suspeita");
                    break;
                }
            }
        }
        
        // Verificar comprimento
        if (cleanFilename.length() > 255) {
            result.addError("Nome do arquivo muito longo (máximo 255 caracteres)");
        }
    }
    
    private void validateMimeType(String mimeType, ValidationResult result) {
        if (!isValidMimeType(mimeType)) {
            result.addError(String.format("Tipo MIME não permitido: %s. Tipos permitidos: %s", 
                mimeType, allowedMimeTypes));
        }
    }
    
    private void validateFileExtension(String filename, ValidationResult result) {
        if (!isValidExtension(filename)) {
            String extension = getFileExtension(filename);
            result.addError(String.format("Extensão não permitida: %s. Extensões permitidas: %s", 
                extension, allowedExtensions));
        }
    }
    
    private void validateFileSignature(MultipartFile file, ValidationResult result) {
        try {
            byte[] fileBytes = file.getBytes();
            if (fileBytes.length < 8) {
                result.addError("Arquivo muito pequeno para validação de assinatura");
                return;
            }
            
            String mimeType = file.getContentType();
            if (mimeType != null && FILE_SIGNATURES.containsKey(mimeType)) {
                byte[] expectedSignature = FILE_SIGNATURES.get(mimeType);
                
                if (!matchesSignature(fileBytes, expectedSignature)) {
                    result.addError("Assinatura do arquivo não corresponde ao tipo declarado");
                }
            }
        } catch (IOException ex) {
            logger.error("Erro ao validar assinatura do arquivo", ex);
            result.addError("Erro ao validar conteúdo do arquivo");
        }
    }
    
    private void validateImageContent(MultipartFile file, ValidationResult result) {
        ImageDimensions dimensions = getImageDimensions(file);
        
        if (dimensions == null) {
            result.addError("Não foi possível ler as dimensões da imagem");
            return;
        }
        
        if (dimensions.getWidth() < minImageWidth || dimensions.getHeight() < minImageHeight) {
            result.addError(String.format("Imagem muito pequena. Dimensões mínimas: %dx%d pixels", 
                minImageWidth, minImageHeight));
        }
        
        if (dimensions.getWidth() > maxImageWidth || dimensions.getHeight() > maxImageHeight) {
            result.addError(String.format("Imagem muito grande. Dimensões máximas: %dx%d pixels", 
                maxImageWidth, maxImageHeight));
        }
        
        // Verificar se é realmente uma imagem válida
        if (!isValidImage(file)) {
            result.addError("Arquivo não é uma imagem válida");
        }
    }
    
    private boolean matchesSignature(byte[] fileBytes, byte[] signature) {
        if (fileBytes.length < signature.length) {
            return false;
        }
        
        for (int i = 0; i < signature.length; i++) {
            if (fileBytes[i] != signature[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        
        return filename.substring(lastDotIndex + 1);
    }
    
    private Set<String> getAllowedMimeTypesSet() {
        if (allowedMimeTypes == null || allowedMimeTypes.isEmpty()) {
            return Set.of();
        }
        
        return Set.of(allowedMimeTypes.toLowerCase().split(","));
    }
    
    private Set<String> getAllowedExtensionsSet() {
        if (allowedExtensions == null || allowedExtensions.isEmpty()) {
            return Set.of();
        }
        
        return Set.of(allowedExtensions.toLowerCase().split(","));
    }

    // Getters para configurações
    public long getMaxFileSize() { return maxFileSize; }
    public long getMinFileSize() { return minFileSize; }
    public int getMaxImageWidth() { return maxImageWidth; }
    public int getMaxImageHeight() { return maxImageHeight; }
    public int getMinImageWidth() { return minImageWidth; }
    public int getMinImageHeight() { return minImageHeight; }
    public String getAllowedMimeTypes() { return allowedMimeTypes; }
    public String getAllowedExtensions() { return allowedExtensions; }

    /**
     * Classe para representar o resultado de uma validação.
     */
    public static class ValidationResult {
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public void addWarning(String warning) {
            warnings.add(warning);
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
        
        public List<String> getErrors() {
            return new ArrayList<>(errors);
        }
        
        public List<String> getWarnings() {
            return new ArrayList<>(warnings);
        }
        
        public String getErrorMessage() {
            return String.join("; ", errors);
        }
        
        public String getWarningMessage() {
            return String.join("; ", warnings);
        }
        
        @Override
        public String toString() {
            return "ValidationResult{" +
                    "valid=" + isValid() +
                    ", errors=" + errors +
                    ", warnings=" + warnings +
                    '}';
        }
    }

    /**
     * Classe para representar dimensões de uma imagem.
     */
    public static class ImageDimensions {
        private final int width;
        private final int height;
        
        public ImageDimensions(int width, int height) {
            this.width = width;
            this.height = height;
        }
        
        public int getWidth() { return width; }
        public int getHeight() { return height; }
        
        public double getAspectRatio() {
            return height == 0 ? 0 : (double) width / height;
        }
        
        public long getPixelCount() {
            return (long) width * height;
        }
        
        @Override
        public String toString() {
            return width + "x" + height;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ImageDimensions that = (ImageDimensions) o;
            return width == that.width && height == that.height;
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(width, height);
        }
    }
}