package br.com.marcosferreira.receitasecreta.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Serviço para gerenciamento de armazenamento de arquivos.
 * 
 * Este serviço fornece funcionalidades para salvar, recuperar, excluir e gerenciar
 * arquivos no sistema de armazenamento local, com validações de segurança.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    
    private final Path fileStorageLocation;
    private final Path imageStorageLocation;
    
    // Configurações de armazenamento
    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${app.file.max-size:10485760}") // 10MB padrão
    private long maxFileSize;
    
    @Value("${app.file.allowed-extensions:jpg,jpeg,png,webp,gif}")
    private String allowedExtensions;
    
    public FileStorageService(@Value("${app.file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.imageStorageLocation = this.fileStorageLocation.resolve("receitas").resolve("imagens");
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.imageStorageLocation);
            logger.info("Diretórios de armazenamento criados: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            logger.error("Erro ao criar diretórios de armazenamento", ex);
            throw new RuntimeException("Não foi possível criar os diretórios de armazenamento", ex);
        }
    }

    /**
     * Salva um arquivo de imagem no sistema de armazenamento.
     * 
     * @param file Arquivo a ser salvo
     * @return Informações do arquivo salvo
     * @throws IOException Se ocorrer erro durante o salvamento
     */
    public FileInfo saveImageFile(MultipartFile file) throws IOException {
        logger.debug("Iniciando saveImageFile para arquivo: {}", file.getOriginalFilename());
        logger.debug("imageStorageLocation: {}", imageStorageLocation);
        
        validateFile(file);
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = generateUniqueFilename(fileExtension);
        
        logger.debug("Arquivo único gerado: {}", uniqueFilename);
        
        // Criar estrutura de diretórios por data
        LocalDateTime now = LocalDateTime.now();
        Path datePath = imageStorageLocation
            .resolve(String.valueOf(now.getYear()))
            .resolve(String.format("%02d", now.getMonthValue()))
            .resolve(String.format("%02d", now.getDayOfMonth()));
        
        logger.debug("Caminho da data: {}", datePath);
        
        try {
            Files.createDirectories(datePath);
            logger.debug("Diretórios criados com sucesso: {}", datePath);
        } catch (Exception e) {
            logger.error("Erro ao criar diretórios: {}", datePath, e);
            throw new RuntimeException("Erro ao criar diretórios de upload", e);
        }
        
        Path targetLocation = datePath.resolve(uniqueFilename);
        logger.debug("Local de destino: {}", targetLocation);
        
        // Verificar se o arquivo já existe (segurança adicional)
        if (Files.exists(targetLocation)) {
            logger.debug("Arquivo já existe, gerando novo nome único");
            uniqueFilename = generateUniqueFilename(fileExtension);
            targetLocation = datePath.resolve(uniqueFilename);
            logger.debug("Novo local de destino: {}", targetLocation);
        }
        
        // Salvar o arquivo
        try (InputStream inputStream = file.getInputStream()) {
            logger.debug("Iniciando cópia do arquivo para: {}", targetLocation);
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.debug("Arquivo copiado com sucesso");
        } catch (Exception e) {
            logger.error("Erro ao salvar arquivo em: {}", targetLocation, e);
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
        
        logger.info("Arquivo salvo: {} -> {}", originalFilename, targetLocation);
        
        return new FileInfo(
            uniqueFilename,
            originalFilename,
            targetLocation.toString(),
            getRelativePath(targetLocation),
            file.getContentType(),
            file.getSize()
        );
    }

    /**
     * Salva um arquivo de imagem no sistema de armazenamento.
     * 
     * @param file Arquivo a ser salvo
     * @param receitaId ID da receita associada
     * @return Informações do arquivo salvo
     * @throws IOException Se ocorrer erro durante o salvamento
     */
    public FileInfo saveImageFile(MultipartFile file, UUID receitaId) throws IOException {
        logger.debug("Iniciando saveImageFile para arquivo: {}", file.getOriginalFilename());
        logger.debug("imageStorageLocation: {}", imageStorageLocation);
        
        validateFile(file);
        
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = generateUniqueFilename(fileExtension);
        
        logger.debug("Arquivo único gerado: {}", uniqueFilename);
        
        // Criar estrutura de diretórios por data
        LocalDateTime now = LocalDateTime.now();
        Path datePath = imageStorageLocation
            .resolve(String.valueOf(now.getYear()))
            .resolve(String.format("%02d", now.getMonthValue()))
            .resolve(String.format("%02d", now.getDayOfMonth()));
        
        logger.debug("Caminho da data: {}", datePath);
        
        try {
            Files.createDirectories(datePath);
            logger.debug("Diretórios criados com sucesso: {}", datePath);
        } catch (Exception e) {
            logger.error("Erro ao criar diretórios: {}", datePath, e);
            throw new RuntimeException("Erro ao criar diretórios de upload", e);
        }
        
        Path targetLocation = datePath.resolve(uniqueFilename);
        logger.debug("Local de destino: {}", targetLocation);
        
        // Verificar se o arquivo já existe (segurança adicional)
        if (Files.exists(targetLocation)) {
            logger.debug("Arquivo já existe, gerando novo nome único");
            uniqueFilename = generateUniqueFilename(fileExtension);
            targetLocation = datePath.resolve(uniqueFilename);
            logger.debug("Novo local de destino: {}", targetLocation);
        }
        
        // Salvar o arquivo
        try (InputStream inputStream = file.getInputStream()) {
            logger.debug("Iniciando cópia do arquivo para: {}", targetLocation);
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.debug("Arquivo copiado com sucesso");
        } catch (Exception e) {
            logger.error("Erro ao salvar arquivo em: {}", targetLocation, e);
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
        
        logger.info("Arquivo salvo: {} -> {}", originalFilename, targetLocation);
        
        return new FileInfo(
            uniqueFilename,
            originalFilename,
            targetLocation.toString(),
            getRelativePath(targetLocation),
            file.getContentType(),
            file.getSize()
        );
    }

    /**
     * Carrega um arquivo como Resource.
     * 
     * @param filename Nome do arquivo
     * @param relativePath Caminho relativo do arquivo
     * @return Resource do arquivo
     * @throws RuntimeException Se o arquivo não for encontrado
     */
    public Resource loadFileAsResource(String filename, String relativePath) {
        try {
            Path filePath = imageStorageLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                logger.warn("Arquivo não encontrado ou não legível: {}", filePath);
                throw new RuntimeException("Arquivo não encontrado: " + filename);
            }
        } catch (MalformedURLException ex) {
            logger.error("Erro ao carregar arquivo: {}", filename, ex);
            throw new RuntimeException("Erro ao carregar arquivo: " + filename, ex);
        }
    }

    /**
     * Exclui um arquivo do sistema de armazenamento.
     * 
     * @param relativePath Caminho relativo do arquivo
     * @return true se o arquivo foi excluído, false caso contrário
     */
    public boolean deleteFile(String relativePath) {
        try {
            Path filePath = imageStorageLocation.resolve(relativePath).normalize();
            
            // Verificar se o caminho está dentro do diretório permitido (segurança)
            if (!filePath.startsWith(imageStorageLocation)) {
                logger.warn("Tentativa de exclusão de arquivo fora do diretório permitido: {}", filePath);
                return false;
            }
            
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                logger.info("Arquivo excluído: {}", filePath);
                // Tentar remover diretórios vazios
                cleanupEmptyDirectories(filePath.getParent());
            } else {
                logger.warn("Arquivo não encontrado para exclusão: {}", filePath);
            }
            
            return deleted;
        } catch (IOException ex) {
            logger.error("Erro ao excluir arquivo: {}", relativePath, ex);
            return false;
        }
    }

    /**
     * Verifica se um arquivo existe.
     * 
     * @param relativePath Caminho relativo do arquivo
     * @return true se o arquivo existe, false caso contrário
     */
    public boolean fileExists(String relativePath) {
        try {
            Path filePath = imageStorageLocation.resolve(relativePath).normalize();
            return Files.exists(filePath) && Files.isRegularFile(filePath);
        } catch (Exception ex) {
            logger.error("Erro ao verificar existência do arquivo: {}", relativePath, ex);
            return false;
        }
    }

    /**
     * Obtém informações de um arquivo.
     * 
     * @param relativePath Caminho relativo do arquivo
     * @return Informações do arquivo ou null se não encontrado
     */
    public FileInfo getFileInfo(String relativePath) {
        try {
            Path filePath = imageStorageLocation.resolve(relativePath).normalize();
            
            if (!Files.exists(filePath)) {
                return null;
            }
            
            String filename = filePath.getFileName().toString();
            long size = Files.size(filePath);
            String contentType = Files.probeContentType(filePath);
            
            return new FileInfo(
                filename,
                filename, // Nome original não disponível
                filePath.toString(),
                relativePath,
                contentType,
                size
            );
        } catch (IOException ex) {
            logger.error("Erro ao obter informações do arquivo: {}", relativePath, ex);
            return null;
        }
    }

    /**
     * Calcula o tamanho total ocupado pelos arquivos de imagem.
     * 
     * @return Tamanho total em bytes
     */
    public long calculateTotalStorageSize() {
        try {
            return Files.walk(imageStorageLocation)
                .filter(Files::isRegularFile)
                .mapToLong(path -> {
                    try {
                        return Files.size(path);
                    } catch (IOException e) {
                        return 0L;
                    }
                })
                .sum();
        } catch (IOException ex) {
            logger.error("Erro ao calcular tamanho total do armazenamento", ex);
            return 0L;
        }
    }

    /**
     * Conta o número total de arquivos de imagem.
     * 
     * @return Número total de arquivos
     */
    public long countTotalFiles() {
        try {
            return Files.walk(imageStorageLocation)
                .filter(Files::isRegularFile)
                .count();
        } catch (IOException ex) {
            logger.error("Erro ao contar arquivos", ex);
            return 0L;
        }
    }

    // Métodos privados de apoio
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo está vazio");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                String.format("Arquivo muito grande. Tamanho máximo permitido: %d bytes", maxFileSize)
            );
        }
        
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.contains("..")) {
            throw new IllegalArgumentException("Nome do arquivo contém sequência de caminho inválida: " + filename);
        }
        
        String extension = getFileExtension(filename).toLowerCase();
        if (!isAllowedExtension(extension)) {
            throw new IllegalArgumentException(
                String.format("Extensão de arquivo não permitida: %s. Extensões permitidas: %s", 
                    extension, allowedExtensions)
            );
        }
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
    
    private boolean isAllowedExtension(String extension) {
        if (allowedExtensions == null || allowedExtensions.isEmpty()) {
            return true;
        }
        
        String[] allowed = allowedExtensions.toLowerCase().split(",");
        for (String allowedExt : allowed) {
            if (allowedExt.trim().equals(extension)) {
                return true;
            }
        }
        
        return false;
    }
    
    private String generateUniqueFilename(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("%s_%s.%s", timestamp, uuid, extension);
    }
    
    private String getRelativePath(Path absolutePath) {
        return imageStorageLocation.relativize(absolutePath).toString().replace("\\", "/");
    }
    
    private void cleanupEmptyDirectories(Path directory) {
        try {
            if (directory != null && 
                !directory.equals(imageStorageLocation) && 
                directory.startsWith(imageStorageLocation)) {
                
                if (Files.isDirectory(directory) && isDirectoryEmpty(directory)) {
                    Files.delete(directory);
                    logger.debug("Diretório vazio removido: {}", directory);
                    
                    // Recursivamente tentar remover diretório pai se vazio
                    cleanupEmptyDirectories(directory.getParent());
                }
            }
        } catch (IOException ex) {
            logger.debug("Erro ao limpar diretório vazio: {}", directory, ex);
        }
    }
    
    private boolean isDirectoryEmpty(Path directory) throws IOException {
        try (var stream = Files.list(directory)) {
            return !stream.findAny().isPresent();
        }
    }

    // Getters para configurações
    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    public String getAllowedExtensions() {
        return allowedExtensions;
    }
    
    public String[] getAllowedExtensionsArray() {
        return allowedExtensions.split(",");
    }
    
    public Path getImageStorageLocation() {
        return imageStorageLocation;
    }

    /**
     * Classe para representar informações de um arquivo.
     */
    public static class FileInfo {
        private final String filename;
        private final String originalFilename;
        private final String absolutePath;
        private final String relativePath;
        private final String contentType;
        private final long size;
        
        public FileInfo(String filename, String originalFilename, String absolutePath, 
                       String relativePath, String contentType, long size) {
            this.filename = filename;
            this.originalFilename = originalFilename;
            this.absolutePath = absolutePath;
            this.relativePath = relativePath;
            this.contentType = contentType;
            this.size = size;
        }
        
        // Getters
        public String getFilename() { return filename; }
        public String getOriginalFilename() { return originalFilename; }
        public String getAbsolutePath() { return absolutePath; }
        public String getRelativePath() { return relativePath; }
        public String getContentType() { return contentType; }
        public long getSize() { return size; }
        
        @Override
        public String toString() {
            return "FileInfo{" +
                    "filename='" + filename + '\'' +
                    ", originalFilename='" + originalFilename + '\'' +
                    ", relativePath='" + relativePath + '\'' +
                    ", contentType='" + contentType + '\'' +
                    ", size=" + size +
                    '}';
        }
    }
}