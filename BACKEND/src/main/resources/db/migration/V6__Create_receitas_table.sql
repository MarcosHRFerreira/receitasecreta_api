-- Criação da tabela de receitas
CREATE TABLE IF NOT EXISTS tb_receitas (
    receita_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria VARCHAR(255) NOT NULL CHECK (categoria IN ('BOLO','TORTA','SALGADO','SOBREMESA')),
    dificuldade VARCHAR(255) CHECK (dificuldade IN ('FACIL','COMPLEXA')),
    modopreparo TEXT NOT NULL,
    nomereceita VARCHAR(255) NOT NULL,
    notas TEXT,
    rendimento VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    tempopreparo VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6),
    user_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receitas_nome ON tb_receitas(nomereceita);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON tb_receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_dificuldade ON tb_receitas(dificuldade);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON tb_receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_created_at ON tb_receitas(created_at);
CREATE INDEX IF NOT EXISTS idx_receitas_updated_at ON tb_receitas(updated_at);