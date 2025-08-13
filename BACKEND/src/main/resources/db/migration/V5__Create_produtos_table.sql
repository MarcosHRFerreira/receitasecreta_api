-- Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS tb_produtos (
    produto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    unidademedida VARCHAR(255) NOT NULL,
    custounidade DECIMAL,
    categoriaproduto VARCHAR(255),
    fornecedor VARCHAR(255),
    descricao VARCHAR(255),
    codigobarras VARCHAR(255),
    data_criacao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_alteracao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(255)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON tb_produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_user_id ON tb_produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON tb_produtos(created_at);
CREATE INDEX IF NOT EXISTS idx_produtos_updated_at ON tb_produtos(updated_at);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON tb_produtos(categoriaproduto);