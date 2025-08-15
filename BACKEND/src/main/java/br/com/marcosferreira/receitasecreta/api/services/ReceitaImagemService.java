package br.com.marcosferreira.receitasecreta.api.services;

import br.com.marcosferreira.receitasecreta.api.dtos.*;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaImagemModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaImagemRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import br.com.marcosferreira.receitasecreta.api.services.FileStorageService.FileInfo;
import br.com.marcosferreira.receitasecreta.api.services.FileValidationService.ValidationResult;
import br.com.marcosferreira.receitasecreta.api.services.FileValidationService.ImageDimensions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço para gerenciamento de imagens de receitas.
 * 
 * Este serviço implementa a lógica de negócio para upload, listagem,
 * atualização e exclusão de imagens associadas às receitas.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@Service
@Transactional
public class ReceitaImagemService {

    private static final Logger logger = LoggerFactory.getLogger(ReceitaImagemService.class);
    
    @Autowired
    private ReceitaImagemRepository receitaImagemRepository;
    
    @Autowired
    private ReceitaRepository receitaRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private FileValidationService fileValidationService;
    
    @Value("${app.image.max-per-receita:10}")
    private int maxImagensPerReceita;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Faz upload de uma nova imagem para uma receita.
     * 
     * @param uploadDto Dados do upload
     * @return Dados da imagem criada
     * @throws IllegalArgumentException Se os dados forem inválidos
     * @throws RuntimeException Se ocorrer erro durante o upload
     */
    public ReceitaImagemResponseDto uploadImagem(ReceitaImagemUploadDto uploadDto) {
        logger.info("Iniciando upload de imagem para receita ID: {}", uploadDto.getReceitaId());
        
        // Validar dados de entrada
        validateUploadDto(uploadDto);
        
        // Verificar se a receita existe
        ReceitaModel receita = receitaRepository.findById(uploadDto.getReceitaId())
            .orElseThrow(() -> new IllegalArgumentException("Receita não encontrada"));
        
        // Verificar limite de imagens por receita
        long imagensExistentes = receitaImagemRepository.countByReceitaReceitaId(uploadDto.getReceitaId());
        if (imagensExistentes >= maxImagensPerReceita) {
            throw new IllegalArgumentException(
                String.format("Limite máximo de %d imagens por receita atingido", maxImagensPerReceita)
            );
        }
        
        // Validar arquivo
        ValidationResult validationResult = fileValidationService.validateImageFile(uploadDto.getArquivo());
        if (!validationResult.isValid()) {
            throw new IllegalArgumentException("Arquivo inválido: " + validationResult.getErrorMessage());
        }
        
        try {
            // Salvar arquivo
            FileInfo fileInfo = fileStorageService.saveImageFile(uploadDto.getArquivo(), uploadDto.getReceitaId());
            
            // Obter dimensões da imagem
            ImageDimensions dimensions = fileValidationService.getImageDimensions(uploadDto.getArquivo());
            
            // Determinar ordem de exibição
            Integer ordemExibicao = uploadDto.getOrdemExibicao();
            if (ordemExibicao == null) {
                Integer maxOrdem = receitaImagemRepository.findMaxOrdemExibicaoByReceitaId(uploadDto.getReceitaId());
                ordemExibicao = (maxOrdem != null && maxOrdem >= 0) ? maxOrdem + 1 : 1;
            }
            
            // Verificar se deve ser imagem principal
            boolean ehPrincipal = uploadDto.getEhPrincipal() != null && uploadDto.getEhPrincipal();
            if (ehPrincipal) {
                // Remover flag principal de outras imagens
                receitaImagemRepository.updateEhPrincipalByReceitaId(uploadDto.getReceitaId(), false);
            } else if (imagensExistentes == 0) {
                // Se é a primeira imagem, torná-la principal automaticamente
                ehPrincipal = true;
            }
            
            // Criar entidade
            ReceitaImagemModel imagemModel = new ReceitaImagemModel();
            imagemModel.setReceita(receita);
            imagemModel.setNomeArquivo(fileInfo.getFilename());
            imagemModel.setNomeOriginal(fileInfo.getOriginalFilename());
            imagemModel.setCaminhoArquivo(fileInfo.getRelativePath());
            imagemModel.setTipoMime(fileInfo.getContentType());
            imagemModel.setTamanhoBytes(fileInfo.getSize());
            imagemModel.setLargura(dimensions != null ? dimensions.getWidth() : null);
            imagemModel.setAltura(dimensions != null ? dimensions.getHeight() : null);
            imagemModel.setEhPrincipal(ehPrincipal);
            imagemModel.setDescricao(uploadDto.getDescricao());
            imagemModel.setOrdemExibicao(ordemExibicao);
            imagemModel.setCreatedAt(LocalDateTime.now());
            imagemModel.setUpdatedAt(LocalDateTime.now());
            // TODO: Definir createdBy e updatedBy com base no usuário autenticado
            
            // Salvar no banco
            imagemModel = receitaImagemRepository.save(imagemModel);
            
            logger.info("Imagem salva com sucesso: ID {}, Arquivo: {}", 
                imagemModel.getImagemId(), fileInfo.getFilename());
            
            return convertToResponseDto(imagemModel);
            
        } catch (IOException ex) {
            logger.error("Erro ao salvar arquivo de imagem", ex);
            throw new RuntimeException("Erro ao salvar arquivo de imagem", ex);
        }
    }

    /**
     * Lista todas as imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @param pageable Configuração de paginação
     * @return Lista paginada de imagens
     */
    @Transactional(readOnly = true)
    public Page<ReceitaImagemResponseDto> listarImagensPorReceita(UUID receitaId, Pageable pageable) {
        logger.debug("Listando imagens da receita ID: {}", receitaId);
        
        // Verificar se a receita existe
        if (!receitaRepository.existsById(receitaId)) {
            throw new IllegalArgumentException("Receita não encontrada");
        }
        
        // Buscar imagens ordenadas
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(Sort.Direction.ASC, "ordemExibicao", "createdAt")
        );
        
        Page<ReceitaImagemModel> imagensPage = receitaImagemRepository
            .findByReceitaReceitaId(receitaId, sortedPageable);
        
        return imagensPage.map(this::convertToResponseDto);
    }

    /**
     * Busca uma imagem específica por ID.
     * 
     * @param imagemId ID da imagem
     * @return Dados da imagem
     * @throws IllegalArgumentException Se a imagem não for encontrada
     */
    @Transactional(readOnly = true)
    public ReceitaImagemResponseDto buscarImagemPorId(UUID imagemId) {
        logger.debug("Buscando imagem ID: {}", imagemId);
        
        ReceitaImagemModel imagem = receitaImagemRepository.findById(imagemId)
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada"));
        
        return convertToResponseDto(imagem);
    }

    /**
     * Atualiza os dados de uma imagem.
     * 
     * @param updateDto Dados para atualização
     * @return Dados atualizados da imagem
     * @throws IllegalArgumentException Se os dados forem inválidos
     */
    public ReceitaImagemResponseDto atualizarImagem(ReceitaImagemUpdateDto updateDto) {
        logger.info("Atualizando imagem ID: {}", updateDto.getImagemId());
        
        // Validar dados
        validateUpdateDto(updateDto);
        
        // Buscar imagem
        ReceitaImagemModel imagem = receitaImagemRepository.findById(updateDto.getImagemId())
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada"));
        
        // Verificar se deve ser imagem principal
        if (updateDto.getEhPrincipal() != null && updateDto.getEhPrincipal() && !imagem.getEhPrincipal()) {
            // Remover flag principal de outras imagens da mesma receita
            receitaImagemRepository.updateEhPrincipalByReceitaId(
                imagem.getReceita().getReceitaId(), false
            );
        }
        
        // Atualizar campos
        if (updateDto.getDescricao() != null) {
            imagem.setDescricao(updateDto.getDescricao());
        }
        
        if (updateDto.getEhPrincipal() != null) {
            imagem.setEhPrincipal(updateDto.getEhPrincipal());
        }
        
        if (updateDto.getOrdemExibicao() != null) {
            imagem.setOrdemExibicao(updateDto.getOrdemExibicao());
        }
        
        imagem.setUpdatedAt(LocalDateTime.now());
        // TODO: Definir updatedBy com base no usuário autenticado
        
        imagem = receitaImagemRepository.save(imagem);
        
        logger.info("Imagem atualizada com sucesso: ID {}", imagem.getImagemId());
        
        return convertToResponseDto(imagem);
    }

    /**
     * Reordena as imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @param reorderDto Dados de reordenação
     */
    public void reordenarImagens(UUID receitaId, ReceitaImagemReorderDto reorderDto) {
        logger.info("Reordenando imagens da receita ID: {}", receitaId);
        
        // Verificar se a receita existe
        if (!receitaRepository.existsById(receitaId)) {
            throw new IllegalArgumentException("Receita não encontrada");
        }
        
        // Validar dados
        if (reorderDto.getOrdens() == null || reorderDto.getOrdens().isEmpty()) {
            throw new IllegalArgumentException("Lista de imagens não fornecida");
        }
        
        // Verificar se todas as imagens pertencem à receita
        List<UUID> imagemIds = reorderDto.getOrdens().stream()
            .map(ReceitaImagemReorderDto.ImagemOrdemDto::getImagemId)
            .collect(Collectors.toList());
        
        List<ReceitaImagemModel> imagens = receitaImagemRepository.findAllById(imagemIds);
        
        if (imagens.size() != imagemIds.size()) {
            throw new IllegalArgumentException("Uma ou mais imagens não foram encontradas");
        }
        
        boolean todasDaMesmaReceita = imagens.stream()
            .allMatch(img -> img.getReceita().getReceitaId().equals(receitaId));
        
        if (!todasDaMesmaReceita) {
            throw new IllegalArgumentException("Todas as imagens devem pertencer à mesma receita");
        }
        
        // Atualizar ordem
        for (ReceitaImagemReorderDto.ImagemOrdemDto imagemOrdem : reorderDto.getOrdens()) {
            receitaImagemRepository.updateOrdemExibicao(
                imagemOrdem.getImagemId(), 
                imagemOrdem.getOrdem()
            );
        }
        
        logger.info("Reordenação concluída para {} imagens da receita ID: {}", 
            reorderDto.getOrdens().size(), receitaId);
    }

    /**
     * Define uma imagem como principal.
     * 
     * @param imagemId ID da imagem
     * @param receitaId ID da receita (para validação)
     */
    public void definirImagemPrincipal(UUID imagemId, UUID receitaId) {
        logger.info("Definindo imagem principal: ID {}, Receita ID: {}", imagemId, receitaId);
        
        // Verificar se a imagem existe e pertence à receita
        ReceitaImagemModel imagem = receitaImagemRepository.findById(imagemId)
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada"));
        
        if (!imagem.getReceita().getReceitaId().equals(receitaId)) {
            throw new IllegalArgumentException("Imagem não pertence à receita especificada");
        }
        
        // Remover flag principal de outras imagens
        receitaImagemRepository.updateEhPrincipalByReceitaId(receitaId, false);
        
        // Definir como principal
        receitaImagemRepository.updateEhPrincipal(imagemId, true);
        
        logger.info("Imagem definida como principal: ID {}", imagemId);
    }

    /**
     * Exclui uma imagem.
     * 
     * @param imagemId ID da imagem
     * @throws IllegalArgumentException Se a imagem não for encontrada
     */
    @Transactional
    public void excluirImagem(UUID imagemId) {
        logger.info("Excluindo imagem ID: {}", imagemId);
        
        // Buscar imagem
        ReceitaImagemModel imagem = receitaImagemRepository.findById(imagemId)
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada"));
        
        UUID receitaId = imagem.getReceita().getReceitaId();
        boolean eraPrincipal = imagem.getEhPrincipal();
        String caminhoArquivo = imagem.getCaminhoArquivo();
        
        // Excluir do banco
        receitaImagemRepository.delete(imagem);
        
        // Excluir arquivo físico
        boolean arquivoExcluido = fileStorageService.deleteFile(caminhoArquivo);
        if (!arquivoExcluido) {
            logger.warn("Não foi possível excluir o arquivo físico: {}", caminhoArquivo);
        }
        
        // Se era a imagem principal, definir outra como principal
        if (eraPrincipal) {
            Optional<ReceitaImagemModel> proximaImagem = receitaImagemRepository
                .findFirstByReceitaReceitaIdOrderByOrdemExibicaoAscCreatedAtAsc(receitaId);
            
            if (proximaImagem.isPresent()) {
                receitaImagemRepository.updateEhPrincipal(proximaImagem.get().getImagemId(), true);
                logger.info("Nova imagem principal definida: ID {}", proximaImagem.get().getImagemId());
            }
        }
        
        logger.info("Imagem excluída com sucesso: ID {}", imagemId);
    }

    /**
     * Busca a imagem principal de uma receita.
     * 
     * @param receitaId ID da receita
     * @return Imagem principal ou null se não houver
     */
    @Transactional(readOnly = true)
    public ReceitaImagemResponseDto buscarImagemPrincipal(UUID receitaId) {
        logger.debug("Buscando imagem principal da receita ID: {}", receitaId);
        
        Optional<ReceitaImagemModel> imagemPrincipal = receitaImagemRepository
            .findByReceitaReceitaIdAndEhPrincipalTrue(receitaId);
        
        return imagemPrincipal.map(this::convertToResponseDto).orElse(null);
    }

    /**
     * Calcula estatísticas de imagens de uma receita.
     * 
     * @param receitaId ID da receita
     * @return Estatísticas
     */
    @Transactional(readOnly = true)
    public ImagemEstatisticasDto calcularEstatisticas(UUID receitaId) {
        logger.debug("Calculando estatísticas de imagens da receita ID: {}", receitaId);
        
        long totalImagens = receitaImagemRepository.countByReceitaReceitaId(receitaId);
        long tamanhoTotal = receitaImagemRepository.sumTamanhoBytesByReceitaId(receitaId);
        
        return new ImagemEstatisticasDto(totalImagens, tamanhoTotal, maxImagensPerReceita);
    }

    // Métodos privados de apoio
    
    private void validateUploadDto(ReceitaImagemUploadDto uploadDto) {
        if (uploadDto == null) {
            throw new IllegalArgumentException("Dados de upload não fornecidos");
        }
        
        if (uploadDto.getReceitaId() == null) {
            throw new IllegalArgumentException("ID da receita é obrigatório");
        }
        
        if (uploadDto.getArquivo() == null || uploadDto.getArquivo().isEmpty()) {
            throw new IllegalArgumentException("Arquivo é obrigatório");
        }
        
        if (uploadDto.getOrdemExibicao() != null && uploadDto.getOrdemExibicao() < 1) {
            throw new IllegalArgumentException("Ordem de exibição deve ser maior que zero");
        }
    }
    
    private void validateUpdateDto(ReceitaImagemUpdateDto updateDto) {
        if (updateDto == null) {
            throw new IllegalArgumentException("Dados de atualização não fornecidos");
        }
        
        if (updateDto.getImagemId() == null) {
            throw new IllegalArgumentException("ID da imagem é obrigatório");
        }
        
        if (updateDto.getOrdemExibicao() != null && updateDto.getOrdemExibicao() < 1) {
            throw new IllegalArgumentException("Ordem de exibição deve ser maior que zero");
        }
    }
    
    private ReceitaImagemResponseDto convertToResponseDto(ReceitaImagemModel imagem) {
        ReceitaImagemResponseDto dto = new ReceitaImagemResponseDto();
        
        dto.setImagemId(imagem.getImagemId());
        dto.setReceitaId(imagem.getReceita().getReceitaId());
        dto.setNomeReceita(imagem.getReceita().getNomeReceita());
        dto.setNomeArquivo(imagem.getNomeArquivo());
        dto.setUrlImagem(buildImageUrl(imagem.getCaminhoArquivo()));
        dto.setUrlThumbnail(buildThumbnailUrl(imagem.getCaminhoArquivo())); // TODO: Implementar thumbnails
        dto.setTipoMime(imagem.getTipoMime());
        dto.setTamanhoBytes(imagem.getTamanhoBytes());
        dto.setLargura(imagem.getLargura());
        dto.setAltura(imagem.getAltura());
        dto.setEhPrincipal(imagem.getEhPrincipal());
        dto.setDescricao(imagem.getDescricao());
        dto.setOrdemExibicao(imagem.getOrdemExibicao());
        dto.setCreatedAt(imagem.getCreatedAt());
        dto.setUpdatedAt(imagem.getUpdatedAt());
        dto.setCreatedBy(imagem.getCreatedBy());
        dto.setUpdatedBy(imagem.getUpdatedBy());
        
        return dto;
    }
    
    private String buildImageUrl(String caminhoArquivo) {
        return String.format("%s/api/receitas/imagens/arquivo/%s", 
            baseUrl.replaceAll("/+$", ""), 
            caminhoArquivo.replace("\\", "/")
        );
    }
    
    private String buildThumbnailUrl(String caminhoArquivo) {
        // TODO: Implementar geração de thumbnails
        return buildImageUrl(caminhoArquivo);
    }

    // Getters para configurações
    public int getMaxImagensPerReceita() {
        return maxImagensPerReceita;
    }


}