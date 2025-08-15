# Estudo: Sistema de Imagens para Receitas

## 1. Análise da Estrutura Atual

### Backend (Java/Spring Boot)
- **Entidade Principal**: `ReceitaModel` com campos básicos de receita
- **Arquitetura**: Repository Pattern com JPA/Hibernate
- **Banco de Dados**: PostgreSQL com migrações Flyway
- **Estrutura de Pastas**:
  - `models/`: Entidades JPA
  - `repositories/`: Interfaces de repositório
  - `services/`: Lógica de negócio
  - `controllers/`: Endpoints REST
  - `dto/`: Data Transfer Objects

### Frontend (React/TypeScript)
- **Componentes Principais**: 
  - `ReceitasList.tsx`: Listagem de receitas
  - `ReceitaForm.tsx`: Formulário de criação/edição
  - `ReceitaDetail.tsx`: Visualização detalhada
- **Tecnologias**: React 18+, TypeScript, Tailwind CSS, React Query
- **Padrões**: Componentes funcionais, hooks customizados

## 2. Esquema do Banco de Dados

### Tabela: `receita_imagens`

```sql
CREATE TABLE receita_imagens (
    imagem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receita_id UUID NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    largura INTEGER,
    altura INTEGER,
    eh_principal BOOLEAN DEFAULT FALSE,
    descricao TEXT,
    ordem_exibicao INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_receita_imagens_receita 
        FOREIGN KEY (receita_id) REFERENCES receitas(receita_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_receita_imagens_created_by 
        FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    CONSTRAINT fk_receita_imagens_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(user_id),
        
    CONSTRAINT chk_tamanho_positivo 
        CHECK (tamanho_bytes > 0),
        
    CONSTRAINT chk_dimensoes_positivas 
        CHECK (largura IS NULL OR largura > 0),
        
    CONSTRAINT chk_altura_positiva 
        CHECK (altura IS NULL OR altura > 0)
);

-- Índices para performance
CREATE INDEX idx_receita_imagens_receita_id ON receita_imagens(receita_id);
CREATE INDEX idx_receita_imagens_principal ON receita_imagens(receita_id, eh_principal);
CREATE INDEX idx_receita_imagens_ordem ON receita_imagens(receita_id, ordem_exibicao);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_receita_imagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_receita_imagens_updated_at
    BEFORE UPDATE ON receita_imagens
    FOR EACH ROW
    EXECUTE FUNCTION update_receita_imagens_updated_at();
```

### Script de Migração: `V8__Create_receita_imagens_table.sql`

## 3. Arquitetura Backend

### 3.1 Entidade JPA

```java
@Entity
@Table(name = "receita_imagens")
public class ReceitaImagemModel {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "imagem_id")
    private UUID imagemId;
    
    @Column(name = "receita_id", nullable = false)
    private UUID receitaId;
    
    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;
    
    @Column(name = "nome_original", nullable = false, length = 255)
    private String nomeOriginal;
    
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;
    
    @Column(name = "tipo_mime", nullable = false, length = 100)
    private String tipoMime;
    
    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;
    
    @Column(name = "largura")
    private Integer largura;
    
    @Column(name = "altura")
    private Integer altura;
    
    @Column(name = "eh_principal")
    private Boolean ehPrincipal = false;
    
    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;
    
    @Column(name = "ordem_exibicao")
    private Integer ordemExibicao = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private UUID createdBy;
    
    @Column(name = "updated_by")
    private UUID updatedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_id", insertable = false, updatable = false)
    private ReceitaModel receita;
    
    // Getters e Setters
}
```

### 3.2 Repository

```java
@Repository
public interface ReceitaImagemRepository extends JpaRepository<ReceitaImagemModel, UUID> {
    List<ReceitaImagemModel> findByReceitaIdOrderByOrdemExibicaoAsc(UUID receitaId);
    
    Optional<ReceitaImagemModel> findByReceitaIdAndEhPrincipalTrue(UUID receitaId);
    
    List<ReceitaImagemModel> findByReceitaIdAndEhPrincipalFalseOrderByOrdemExibicaoAsc(UUID receitaId);
    
    @Modifying
    @Query("UPDATE ReceitaImagemModel r SET r.ehPrincipal = false WHERE r.receitaId = :receitaId")
    void resetImagensPrincipais(@Param("receitaId") UUID receitaId);
    
    void deleteByReceitaId(UUID receitaId);
    
    long countByReceitaId(UUID receitaId);
}
```

### 3.3 DTOs

```java
// DTO para upload
public record ReceitaImagemUploadDto(
    @NotNull UUID receitaId,
    @NotNull MultipartFile arquivo,
    String descricao,
    Boolean ehPrincipal,
    Integer ordemExibicao
) {}

// DTO para resposta
public record ReceitaImagemResponseDto(
    UUID imagemId,
    UUID receitaId,
    String nomeArquivo,
    String nomeOriginal,
    String urlImagem,
    String tipoMime,
    Long tamanhoBytes,
    Integer largura,
    Integer altura,
    Boolean ehPrincipal,
    String descricao,
    Integer ordemExibicao,
    LocalDateTime createdAt
) {}

// DTO para atualização
public record ReceitaImagemUpdateDto(
    String descricao,
    Boolean ehPrincipal,
    Integer ordemExibicao
) {}
```

### 3.4 Service

```java
@Service
@Transactional
public class ReceitaImagemServiceImpl implements ReceitaImagemService {
    
    private final ReceitaImagemRepository repository;
    private final FileStorageService fileStorageService;
    private final ImageProcessingService imageProcessingService;
    
    @Override
    public ReceitaImagemResponseDto uploadImagem(ReceitaImagemUploadDto dto, UUID userId) {
        // Validações
        validateFile(dto.arquivo());
        validateReceitaExists(dto.receitaId());
        validateImageLimit(dto.receitaId());
        
        // Processar arquivo
        String nomeArquivo = generateUniqueFileName(dto.arquivo());
        String caminhoArquivo = fileStorageService.store(dto.arquivo(), nomeArquivo);
        
        // Extrair metadados da imagem
        ImageMetadata metadata = imageProcessingService.extractMetadata(dto.arquivo());
        
        // Definir como principal se for a primeira imagem
        boolean ehPrincipal = dto.ehPrincipal() != null ? dto.ehPrincipal() : 
            repository.countByReceitaId(dto.receitaId()) == 0;
        
        // Se definida como principal, resetar outras
        if (ehPrincipal) {
            repository.resetImagensPrincipais(dto.receitaId());
        }
        
        // Criar entidade
        ReceitaImagemModel imagem = new ReceitaImagemModel();
        imagem.setReceitaId(dto.receitaId());
        imagem.setNomeArquivo(nomeArquivo);
        imagem.setNomeOriginal(dto.arquivo().getOriginalFilename());
        imagem.setCaminhoArquivo(caminhoArquivo);
        imagem.setTipoMime(dto.arquivo().getContentType());
        imagem.setTamanhoBytes(dto.arquivo().getSize());
        imagem.setLargura(metadata.getWidth());
        imagem.setAltura(metadata.getHeight());
        imagem.setEhPrincipal(ehPrincipal);
        imagem.setDescricao(dto.descricao());
        imagem.setOrdemExibicao(dto.ordemExibicao() != null ? dto.ordemExibicao() : getNextOrder(dto.receitaId()));
        imagem.setCreatedBy(userId);
        
        ReceitaImagemModel saved = repository.save(imagem);
        return mapToResponseDto(saved);
    }
    
    @Override
    public List<ReceitaImagemResponseDto> getImagensByReceita(UUID receitaId) {
        return repository.findByReceitaIdOrderByOrdemExibicaoAsc(receitaId)
            .stream()
            .map(this::mapToResponseDto)
            .toList();
    }
    
    @Override
    public void deleteImagem(UUID imagemId, UUID userId) {
        ReceitaImagemModel imagem = repository.findById(imagemId)
            .orElseThrow(() -> new EntityNotFoundException("Imagem não encontrada"));
        
        // Deletar arquivo físico
        fileStorageService.delete(imagem.getCaminhoArquivo());
        
        // Deletar do banco
        repository.delete(imagem);
        
        // Se era principal, definir próxima como principal
        if (imagem.getEhPrincipal()) {
            setNextAsPrincipal(imagem.getReceitaId());
        }
    }
    
    // Métodos auxiliares...
}
```

### 3.5 Controller

```java
@RestController
@RequestMapping("/api/receitas/{receitaId}/imagens")
@Validated
public class ReceitaImagemController {
    
    private final ReceitaImagemService service;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReceitaImagemResponseDto> uploadImagem(
            @PathVariable UUID receitaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestParam(value = "ehPrincipal", required = false) Boolean ehPrincipal,
            @RequestParam(value = "ordemExibicao", required = false) Integer ordemExibicao,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        
        ReceitaImagemUploadDto dto = new ReceitaImagemUploadDto(
            receitaId, arquivo, descricao, ehPrincipal, ordemExibicao
        );
        
        ReceitaImagemResponseDto response = service.uploadImagem(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<ReceitaImagemResponseDto>> getImagens(
            @PathVariable UUID receitaId) {
        
        List<ReceitaImagemResponseDto> imagens = service.getImagensByReceita(receitaId);
        return ResponseEntity.ok(imagens);
    }
    
    @DeleteMapping("/{imagemId}")
    public ResponseEntity<Void> deleteImagem(
            @PathVariable UUID receitaId,
            @PathVariable UUID imagemId,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        service.deleteImagem(imagemId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{imagemId}")
    public ResponseEntity<ReceitaImagemResponseDto> updateImagem(
            @PathVariable UUID receitaId,
            @PathVariable UUID imagemId,
            @RequestBody @Valid ReceitaImagemUpdateDto dto,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        ReceitaImagemResponseDto response = service.updateImagem(imagemId, dto, userId);
        return ResponseEntity.ok(response);
    }
}
```

## 4. Componentes Frontend

### 4.1 Hook para Upload de Imagens

```typescript
interface UseImageUploadProps {
  receitaId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useImageUpload = ({ receitaId, onSuccess, onError }: UseImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploadImage = async (file: File, options?: {
    descricao?: string;
    ehPrincipal?: boolean;
    ordemExibicao?: number;
  }) => {
    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('arquivo', file);
      
      if (options?.descricao) {
        formData.append('descricao', options.descricao);
      }
      
      if (options?.ehPrincipal !== undefined) {
        formData.append('ehPrincipal', String(options.ehPrincipal));
      }
      
      if (options?.ordemExibicao !== undefined) {
        formData.append('ordemExibicao', String(options.ordemExibicao));
      }
      
      const response = await fetch(`/api/receitas/${receitaId}/imagens`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const result = await response.json();
      onSuccess?.();
      return result;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      onError?.(message);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return {
    uploadImage,
    uploading,
    progress
  };
};
```

### 4.2 Componente de Upload

```typescript
interface ImageUploadProps {
  receitaId: string;
  onImageUploaded: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  receitaId,
  onImageUploaded,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, uploading } = useImageUpload({
    receitaId,
    onSuccess: () => {
      setSelectedFiles([]);
      onImageUploaded();
      toast.success('Imagem enviada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao enviar imagem: ${error}`);
    }
  });
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);
  
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`Arquivo muito grande: ${file.name}`);
        return false;
      }
      
      return true;
    });
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} imagens permitidas`);
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };
  
  const handleUpload = async () => {
    for (const file of selectedFiles) {
      await uploadImage(file);
    }
  };
  
  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arraste imagens aqui ou clique para selecionar
        </p>
        <p className="text-sm text-gray-500">
          Suporta JPEG, PNG e WebP até 5MB cada
        </p>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Arquivos selecionados:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : `Enviar ${selectedFiles.length} imagem(ns)`}
          </button>
        </div>
      )}
    </div>
  );
};
```

### 4.3 Galeria de Imagens

```typescript
interface ReceitaImageGalleryProps {
  receitaId: string;
  editable?: boolean;
}

export const ReceitaImageGallery: React.FC<ReceitaImageGalleryProps> = ({
  receitaId,
  editable = false
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: imagens, isLoading, refetch } = useQuery({
    queryKey: ['receita-imagens', receitaId],
    queryFn: () => fetchReceitaImagens(receitaId)
  });
  
  const deleteMutation = useMutation({
    mutationFn: (imagemId: string) => deleteReceitaImagem(receitaId, imagemId),
    onSuccess: () => {
      refetch();
      toast.success('Imagem removida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover imagem');
    }
  });
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded"></div>;
  }
  
  if (!imagens || imagens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ImageIcon className="mx-auto h-12 w-12 mb-2" />
        <p>Nenhuma imagem adicionada</p>
      </div>
    );
  }
  
  const imagemPrincipal = imagens.find(img => img.ehPrincipal);
  const outrasImagens = imagens.filter(img => !img.ehPrincipal);
  
  return (
    <div className="space-y-4">
      {/* Imagem Principal */}
      {imagemPrincipal && (
        <div className="relative">
          <img
            src={imagemPrincipal.urlImagem}
            alt={imagemPrincipal.descricao || 'Imagem principal da receita'}
            className="w-full h-64 object-cover rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(imagemPrincipal.urlImagem)}
          />
          
          {editable && (
            <div className="absolute top-2 right-2 space-x-2">
              <button
                onClick={() => deleteMutation.mutate(imagemPrincipal.imagemId)}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            Principal
          </div>
        </div>
      )}
      
      {/* Outras Imagens */}
      {outrasImagens.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {outrasImagens.map((imagem) => (
            <div key={imagem.imagemId} className="relative group">
              <img
                src={imagem.urlImagem}
                alt={imagem.descricao || 'Imagem da receita'}
                className="w-full h-32 object-cover rounded cursor-pointer"
                onClick={() => setSelectedImage(imagem.urlImagem)}
              />
              
              {editable && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteMutation.mutate(imagem.imagemId)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de Visualização */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={selectedImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white text-black p-2 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 5. Estratégia de Armazenamento

### 5.1 Armazenamento Local

```java
@Service
public class LocalFileStorageService implements FileStorageService {
    
    @Value("${app.upload.dir:uploads/receitas}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar diretório de upload", e);
        }
    }
    
    @Override
    public String store(MultipartFile file, String fileName) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Arquivo vazio");
            }
            
            // Criar subdiretório baseado na data
            String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path targetDir = Paths.get(uploadDir, dateDir);
            Files.createDirectories(targetDir);
            
            // Caminho completo do arquivo
            Path targetPath = targetDir.resolve(fileName);
            
            // Verificar se arquivo já existe
            if (Files.exists(targetPath)) {
                throw new IllegalStateException("Arquivo já existe: " + fileName);
            }
            
            // Copiar arquivo
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            return targetPath.toString();
            
        } catch (IOException e) {
            throw new RuntimeException("Erro ao armazenar arquivo", e);
        }
    }
    
    @Override
    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            log.error("Erro ao deletar arquivo: {}", filePath, e);
        }
    }
    
    @Override
    public String getPublicUrl(String filePath) {
        // Retorna URL relativa para servir via Spring Boot
        return "/api/files/" + Paths.get(filePath).getFileName().toString();
    }
}
```

### 5.2 Validações de Segurança

```java
@Component
public class FileValidationService {
    
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "jpg", "jpeg", "png", "webp", "gif"
    );
    
    public void validateImageFile(MultipartFile file) {
        // Validar se arquivo não está vazio
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode estar vazio");
        }
        
        // Validar tamanho
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Máximo: 5MB");
        }
        
        // Validar tipo MIME
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido: " + mimeType);
        }
        
        // Validar extensão
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Nome do arquivo é obrigatório");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Extensão não permitida: " + extension);
        }
        
        // Validar conteúdo do arquivo (verificar se é realmente uma imagem)
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("Arquivo não é uma imagem válida");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Erro ao processar imagem", e);
        }
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }
}
```

## 6. Configurações e Propriedades

### 6.1 Application Properties

```properties
# Configurações de Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=25MB
app.upload.dir=uploads/receitas
app.upload.max-images-per-receita=10

# Configurações de Imagem
app.image.allowed-types=image/jpeg,image/png,image/webp
app.image.max-width=2048
app.image.max-height=2048
app.image.thumbnail-size=300
```

### 6.2 Configuração de Segurança

```java
@Configuration
public class FileSecurityConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/api/files/**")
                    .addResourceLocations("file:uploads/receitas/")
                    .setCachePeriod(3600); // Cache por 1 hora
            }
        };
    }
}
```

## 7. Testes

### 7.1 Testes de Integração

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ReceitaImagemIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private ReceitaImagemRepository repository;
    
    @Test
    void deveUploadImagemComSucesso() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "arquivo",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
        
        // Act
        ResponseEntity<ReceitaImagemResponseDto> response = restTemplate.postForEntity(
            "/api/receitas/{receitaId}/imagens",
            createMultipartRequest(file),
            ReceitaImagemResponseDto.class,
            UUID.randomUUID()
        );
        
        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().nomeOriginal()).isEqualTo("test.jpg");
    }
}
```

## 8. Considerações de Performance

### 8.1 Otimizações

1. **Compressão de Imagens**: Implementar redimensionamento automático
2. **Thumbnails**: Gerar miniaturas para listagens
3. **CDN**: Considerar uso de CDN para servir imagens
4. **Cache**: Implementar cache de metadados
5. **Lazy Loading**: Carregar imagens sob demanda no frontend

### 8.2 Monitoramento

1. **Métricas de Upload**: Tempo, tamanho, taxa de sucesso
2. **Uso de Armazenamento**: Monitorar espaço em disco
3. **Performance de Queries**: Índices otimizados

## 9. Roadmap de Implementação

### Fase 1: Backend Base
1. Criar migração da tabela
2. Implementar entidade JPA
3. Criar repository e service básicos
4. Implementar endpoints de upload e listagem

### Fase 2: Frontend Base
1. Criar componente de upload
2. Implementar galeria básica
3. Integrar com formulário de receitas

### Fase 3: Melhorias
1. Implementar redimensionamento
2. Adicionar validações avançadas
3. Melhorar UX com preview e progress
4. Implementar reordenação de imagens

### Fase 4: Otimizações
1. Implementar thumbnails
2. Adicionar cache
3. Otimizar performance
4. Implementar CDN (se necessário)

## 10. Conclusão

Este estudo apresenta uma solução completa para implementação de um sistema de imagens para receitas, seguindo as melhores práticas de desenvolvimento e as regras estabelecidas no projeto. A implementação proposta é escalável, segura e mantém a consistência com a arquitetura existente.

A solução contempla desde o armazenamento seguro de arquivos até a apresentação otimizada no frontend, passando por validações rigorosas e uma API REST bem estruturada.