-- Criação da tabela de relacionamento receita-ingrediente
CREATE TABLE IF NOT EXISTS tb_receita_ingrediente (
    receita_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL,
    unidademedida VARCHAR(255) NOT NULL,
    PRIMARY KEY (receita_id, produto_id)
);

-- Foreign Keys
ALTER TABLE tb_receita_ingrediente 
ADD CONSTRAINT fk_receita_ingrediente_produto 
FOREIGN KEY (produto_id) REFERENCES tb_produtos(produto_id) ON DELETE CASCADE;

ALTER TABLE tb_receita_ingrediente 
ADD CONSTRAINT fk_receita_ingrediente_receita 
FOREIGN KEY (receita_id) REFERENCES tb_receitas(receita_id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receita_ingrediente_receita_id ON tb_receita_ingrediente(receita_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingrediente_produto_id ON tb_receita_ingrediente(produto_id);