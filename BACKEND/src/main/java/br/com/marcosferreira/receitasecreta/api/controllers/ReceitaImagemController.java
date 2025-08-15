package br.com.marcosferreira.receitasecreta.api.controllers;

import br.com.marcosferreira.receitasecreta.api.dtos.*;
import br.com.marcosferreira.receitasecreta.api.services.ReceitaImagemService;
import br.com.marcosferreira.receitasecreta.api.services.FileStorageService;
import br.com.marcosferreira.receitasecreta.api.services.FileValidationService;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Controller para gerenciamento de imagens de receitas.
 * 
 * Este controller fornece endpoints REST para upload, listagem, atualização,
 * exclusão e servir arquivos de imagens associadas às receitas.
 * 
 * @author Sistema
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/receitas")
@Tag(name = "Receita Imagens", description = "Operações relacionadas às imagens das receitas")
public class ReceitaImagemController {

    private static final Logger logger = LoggerFactory.getLogger(ReceitaImagemController.class);
    
    @Autowired
    private ReceitaImagemService receitaImagemService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private FileValidationService fileValidationService;

    /**
     * Faz upload de uma nova imagem para uma receita.
     */
    @PostMapping(value = "/{receitaId}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de imagem", description = "Faz upload de uma nova imagem para uma receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Imagem enviada com sucesso",
            content = @Content(schema = @Schema(implementation = ReceitaImagemResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou arquivo inválido"),
        @ApiResponse(responseCode = "404", description = "Receita não encontrada"),
        @ApiResponse(responseCode = "413", description = "Arquivo muito grande"),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    public ResponseEntity<?> uploadImagem(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId,
            
            @Parameter(description = "Arquivo de imagem", required = true)
            @RequestParam("arquivo") MultipartFile arquivo,
            
            @Parameter(description = "Descrição da imagem")
            @RequestParam(value = "descricao", required = false) String descricao,
            
            @Parameter(description = "Se é imagem principal")
            @RequestParam(value = "ehPrincipal", required = false, defaultValue = "false") Boolean ehPrincipal,
            
            @Parameter(description = "Ordem de exibição")
            @RequestParam(value = "ordemExibicao", required = false) Integer ordemExibicao) {
        
        try {
            logger.info("Upload de imagem solicitado para receita ID: {}", receitaId);
            
            // Criar DTO de upload
            ReceitaImagemUploadDto uploadDto = new ReceitaImagemUploadDto();
            uploadDto.setReceitaId(receitaId);
            uploadDto.setArquivo(arquivo);
            uploadDto.setDescricao(descricao);
            uploadDto.setEhPrincipal(ehPrincipal);
            uploadDto.setOrdemExibicao(ordemExibicao);
            
            // Fazer upload
            ReceitaImagemResponseDto response = receitaImagemService.uploadImagem(uploadDto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Erro de validação no upload: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Erro interno no upload de imagem", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Lista todas as imagens de uma receita.
     */
    @GetMapping("/{receitaId}/imagens")
    @Operation(summary = "Listar imagens", description = "Lista todas as imagens de uma receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de imagens retornada com sucesso"),
        @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<?> listarImagens(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId,
            
            @Parameter(description = "Número da página (0-based)")
            @RequestParam(value = "page", defaultValue = "0") int page,
            
            @Parameter(description = "Tamanho da página")
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        try {
            logger.debug("Listagem de imagens solicitada para receita ID: {}", receitaId);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<ReceitaImagemResponseDto> imagens = receitaImagemService.listarImagensPorReceita(receitaId, pageable);
            
            return ResponseEntity.ok(imagens);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Receita não encontrada: {}", receitaId);
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            logger.error("Erro ao listar imagens da receita: {}", receitaId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Busca uma imagem específica por ID.
     */
    @GetMapping("/imagens/{imagemId}")
    @Operation(summary = "Buscar imagem", description = "Busca uma imagem específica por ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagem encontrada",
            content = @Content(schema = @Schema(implementation = ReceitaImagemResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Imagem não encontrada")
    })
    public ResponseEntity<?> buscarImagem(
            @Parameter(description = "ID da imagem", required = true)
            @PathVariable UUID imagemId) {
        
        try {
            logger.debug("Busca de imagem solicitada: ID {}", imagemId);
            
            ReceitaImagemResponseDto imagem = receitaImagemService.buscarImagemPorId(imagemId);
            return ResponseEntity.ok(imagem);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Imagem não encontrada: {}", imagemId);
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            logger.error("Erro ao buscar imagem: {}", imagemId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Atualiza os dados de uma imagem.
     */
    @PutMapping("/imagens/{imagemId}")
    @Operation(summary = "Atualizar imagem", description = "Atualiza os dados de uma imagem")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagem atualizada com sucesso",
            content = @Content(schema = @Schema(implementation = ReceitaImagemResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Imagem não encontrada")
    })
    public ResponseEntity<?> atualizarImagem(
            @Parameter(description = "ID da imagem", required = true)
            @PathVariable UUID imagemId,
            
            @Parameter(description = "Dados para atualização", required = true)
            @Valid @RequestBody ReceitaImagemUpdateDto updateDto) {
        
        try {
            logger.info("Atualização de imagem solicitada: ID {}", imagemId);
            
            // Definir ID da imagem no DTO
            updateDto.setImagemId(imagemId);
            
            ReceitaImagemResponseDto response = receitaImagemService.atualizarImagem(updateDto);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Erro de validação na atualização: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Erro ao atualizar imagem: {}", imagemId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Reordena as imagens de uma receita.
     */
    @PutMapping("/{receitaId}/imagens/reordenar")
    @Operation(summary = "Reordenar imagens", description = "Reordena as imagens de uma receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagens reordenadas com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<?> reordenarImagens(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId,
            
            @Parameter(description = "Dados de reordenação", required = true)
            @Valid @RequestBody ReceitaImagemReorderDto reorderDto) {
        
        try {
            logger.info("Reordenação de imagens solicitada para receita ID: {}", receitaId);
            
            receitaImagemService.reordenarImagens(receitaId, reorderDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Imagens reordenadas com sucesso");
            response.put("receitaId", receitaId);
            response.put("totalImagens", reorderDto.getOrdens().size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Erro de validação na reordenação: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Erro ao reordenar imagens da receita: {}", receitaId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Define uma imagem como principal.
     */
    @PutMapping("/{receitaId}/imagens/{imagemId}/principal")
    @Operation(summary = "Definir imagem principal", description = "Define uma imagem como principal da receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagem definida como principal"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Receita ou imagem não encontrada")
    })
    public ResponseEntity<?> definirImagemPrincipal(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId,
            
            @Parameter(description = "ID da imagem", required = true)
            @PathVariable UUID imagemId) {
        
        try {
            logger.info("Definição de imagem principal solicitada: Receita {}, Imagem {}", receitaId, imagemId);
            
            receitaImagemService.definirImagemPrincipal(imagemId, receitaId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Imagem definida como principal");
            response.put("receitaId", receitaId);
            response.put("imagemId", imagemId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Erro de validação: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Erro ao definir imagem principal: Receita {}, Imagem {}", receitaId, imagemId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Exclui uma imagem.
     */
    @DeleteMapping("/imagens/{imagemId}")
    @Operation(summary = "Excluir imagem", description = "Exclui uma imagem")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagem excluída com sucesso"),
        @ApiResponse(responseCode = "404", description = "Imagem não encontrada")
    })
    public ResponseEntity<?> excluirImagem(
            @Parameter(description = "ID da imagem", required = true)
            @PathVariable UUID imagemId) {
        
        try {
            logger.info("Exclusão de imagem solicitada: ID {}", imagemId);
            
            receitaImagemService.excluirImagem(imagemId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Imagem excluída com sucesso");
            response.put("imagemId", imagemId);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException ex) {
            logger.warn("Imagem não encontrada para exclusão: {}", imagemId);
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            logger.error("Erro ao excluir imagem: {}", imagemId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Busca a imagem principal de uma receita.
     */
    @GetMapping("/{receitaId}/imagens/principal")
    @Operation(summary = "Buscar imagem principal", description = "Busca a imagem principal de uma receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Imagem principal encontrada",
            content = @Content(schema = @Schema(implementation = ReceitaImagemResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Receita não encontrada ou sem imagem principal")
    })
    public ResponseEntity<?> buscarImagemPrincipal(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId) {
        
        try {
            logger.debug("Busca de imagem principal solicitada para receita ID: {}", receitaId);
            
            ReceitaImagemResponseDto imagemPrincipal = receitaImagemService.buscarImagemPrincipal(receitaId);
            
            if (imagemPrincipal != null) {
                return ResponseEntity.ok(imagemPrincipal);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception ex) {
            logger.error("Erro ao buscar imagem principal da receita: {}", receitaId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Obtém estatísticas de imagens de uma receita.
     */
    @GetMapping("/{receitaId}/imagens/estatisticas")
    @Operation(summary = "Estatísticas de imagens", description = "Obtém estatísticas de imagens de uma receita")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso"),
        @ApiResponse(responseCode = "404", description = "Receita não encontrada")
    })
    public ResponseEntity<?> obterEstatisticas(
            @Parameter(description = "ID da receita", required = true)
            @PathVariable UUID receitaId) {
        
        try {
            logger.debug("Estatísticas de imagens solicitadas para receita ID: {}", receitaId);
            
            ImagemEstatisticasDto estatisticas = receitaImagemService.calcularEstatisticas(receitaId);
            return ResponseEntity.ok(estatisticas);
            
        } catch (Exception ex) {
            logger.error("Erro ao obter estatísticas da receita: {}", receitaId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erro interno do servidor"));
        }
    }

    /**
     * Serve um arquivo de imagem.
     */
    @GetMapping("/imagens/arquivo/**")
    @Operation(summary = "Servir arquivo de imagem", description = "Serve um arquivo de imagem")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Arquivo servido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Arquivo não encontrado")
    })
    public ResponseEntity<Resource> servirArquivo(HttpServletRequest request) {
        try {
            // Extrair caminho do arquivo da URL
            String requestURL = request.getRequestURL().toString();
            String caminhoArquivo = requestURL.substring(requestURL.indexOf("/arquivo/") + 9);
            
            logger.debug("Servindo arquivo de imagem: {}", caminhoArquivo);
            
            // Carregar arquivo
            Resource resource = fileStorageService.loadFileAsResource("", caminhoArquivo);
            
            // Determinar tipo de conteúdo
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (Exception ex) {
                logger.debug("Não foi possível determinar o tipo de arquivo.");
            }
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
                
        } catch (Exception ex) {
            logger.warn("Arquivo não encontrado ou erro ao servir: {}", ex.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtém informações de configuração do sistema de imagens.
     */
    @GetMapping("/imagens/config")
    @Operation(summary = "Configurações do sistema", description = "Obtém configurações do sistema de imagens")
    @ApiResponse(responseCode = "200", description = "Configurações retornadas com sucesso")
    public ResponseEntity<Map<String, Object>> obterConfiguracoes() {
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("maxFileSize", fileValidationService.getMaxFileSize());
            config.put("allowedExtensions", fileStorageService.getAllowedExtensionsArray());
            config.put("maxImagensPerReceita", receitaImagemService.getMaxImagensPerReceita());
            
            return ResponseEntity.ok(config);
            
        } catch (Exception ex) {
            logger.error("Erro ao obter configurações", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Métodos privados de apoio
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", true);
        error.put("message", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}