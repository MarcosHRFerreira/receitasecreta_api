-- Migration inicial para estabelecer baseline
-- Executada apenas se o banco estiver vazio

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentário de controle de versão
-- Flyway Baseline Migration
-- Data: 2025-01-13
-- Descrição: Schema inicial do sistema