-- Migração V8: Criação da tabela de imagens para receitas
-- Autor: Sistema
-- Data: 2025-01-15
-- Descrição: Implementa sistema de upload e gerenciamento de imagens para receitas

-- Criação da tabela receita_imagens
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
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    -- Constraints de chave estrangeira
    CONSTRAINT fk_receita_imagens_receita 
        FOREIGN KEY (receita_id) REFERENCES tb_receitas(receita_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_receita_imagens_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id),
    
    CONSTRAINT fk_receita_imagens_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id),
        
    -- Constraints de validação
    CONSTRAINT chk_tamanho_positivo 
        CHECK (tamanho_bytes > 0),
        
    CONSTRAINT chk_dimensoes_positivas 
        CHECK (largura IS NULL OR largura > 0),
        
    CONSTRAINT chk_altura_positiva 
        CHECK (altura IS NULL OR altura > 0),
        
    CONSTRAINT chk_ordem_exibicao_positiva 
        CHECK (ordem_exibicao >= 0),
        
    CONSTRAINT chk_nome_arquivo_nao_vazio 
        CHECK (LENGTH(TRIM(nome_arquivo)) > 0),
        
    CONSTRAINT chk_nome_original_nao_vazio 
        CHECK (LENGTH(TRIM(nome_original)) > 0),
        
    CONSTRAINT chk_caminho_arquivo_nao_vazio 
        CHECK (LENGTH(TRIM(caminho_arquivo)) > 0),
        
    CONSTRAINT chk_tipo_mime_valido 
        CHECK (tipo_mime IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
);

-- Índices para otimização de performance
CREATE INDEX idx_receita_imagens_receita_id ON receita_imagens(receita_id);
CREATE INDEX idx_receita_imagens_principal ON receita_imagens(receita_id, eh_principal);
CREATE INDEX idx_receita_imagens_ordem ON receita_imagens(receita_id, ordem_exibicao);
CREATE INDEX idx_receita_imagens_created_at ON receita_imagens(created_at);
CREATE INDEX idx_receita_imagens_tipo_mime ON receita_imagens(tipo_mime);

-- Índice único para garantir apenas uma imagem principal por receita
CREATE UNIQUE INDEX idx_receita_imagens_principal_unica 
    ON receita_imagens(receita_id) 
    WHERE eh_principal = TRUE;

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_receita_imagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função de atualização do updated_at
CREATE TRIGGER trigger_receita_imagens_updated_at
    BEFORE UPDATE ON receita_imagens
    FOR EACH ROW
    EXECUTE FUNCTION update_receita_imagens_updated_at();

-- Função para validar que apenas uma imagem pode ser principal por receita
CREATE OR REPLACE FUNCTION validate_imagem_principal()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está definindo como principal, remover principal de outras imagens da mesma receita
    IF NEW.eh_principal = TRUE THEN
        UPDATE receita_imagens 
        SET eh_principal = FALSE 
        WHERE receita_id = NEW.receita_id 
          AND imagem_id != COALESCE(NEW.imagem_id, '00000000-0000-0000-0000-000000000000'::UUID);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar imagem principal
CREATE TRIGGER trigger_validate_imagem_principal
    BEFORE INSERT OR UPDATE ON receita_imagens
    FOR EACH ROW
    WHEN (NEW.eh_principal = TRUE)
    EXECUTE FUNCTION validate_imagem_principal();

-- Comentários na tabela e colunas para documentação
COMMENT ON TABLE receita_imagens IS 'Tabela para armazenar imagens associadas às receitas';
COMMENT ON COLUMN receita_imagens.imagem_id IS 'Identificador único da imagem';
COMMENT ON COLUMN receita_imagens.receita_id IS 'Referência para a receita proprietária da imagem';
COMMENT ON COLUMN receita_imagens.nome_arquivo IS 'Nome do arquivo gerado pelo sistema (único)';
COMMENT ON COLUMN receita_imagens.nome_original IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN receita_imagens.caminho_arquivo IS 'Caminho completo do arquivo no sistema de armazenamento';
COMMENT ON COLUMN receita_imagens.tipo_mime IS 'Tipo MIME do arquivo (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN receita_imagens.tamanho_bytes IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN receita_imagens.largura IS 'Largura da imagem em pixels';
COMMENT ON COLUMN receita_imagens.altura IS 'Altura da imagem em pixels';
COMMENT ON COLUMN receita_imagens.eh_principal IS 'Indica se esta é a imagem principal da receita (apenas uma por receita)';
COMMENT ON COLUMN receita_imagens.descricao IS 'Descrição opcional da imagem';
COMMENT ON COLUMN receita_imagens.ordem_exibicao IS 'Ordem de exibição da imagem na galeria (0 = primeira)';
COMMENT ON COLUMN receita_imagens.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN receita_imagens.updated_at IS 'Data e hora da última atualização do registro';
COMMENT ON COLUMN receita_imagens.created_by IS 'Usuário que criou o registro';
COMMENT ON COLUMN receita_imagens.updated_by IS 'Usuário que fez a última atualização do registro';

-- Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO receita_imagens (receita_id, nome_arquivo, nome_original, caminho_arquivo, tipo_mime, tamanho_bytes, largura, altura, eh_principal, descricao, ordem_exibicao, created_by)
-- VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'receita_001_principal.jpg', 'bolo_chocolate.jpg', '/uploads/receitas/2025/01/15/receita_001_principal.jpg', 'image/jpeg', 245760, 800, 600, TRUE, 'Imagem principal do bolo de chocolate', 0, '550e8400-e29b-41d4-a716-446655440001');