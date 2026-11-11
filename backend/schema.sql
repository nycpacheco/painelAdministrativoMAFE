-- =========================================================================
-- BANCO DE DADOS: mafe_db (MySQL 8.0+ / MariaDB)
-- Painel Administrativo e Site Público MAFE
-- =========================================================================

CREATE DATABASE IF NOT EXISTS mafe_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE mafe_db;

-- 1. Tabela de Categorias da Galeria (Alimentam o filtro de tipos no site público)
CREATE TABLE IF NOT EXISTS categorias_galeria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. Tabela de Mídias (Galeria e Homepage, vinculada diretamente às categorias)
CREATE TABLE IF NOT EXISTS midias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url_midia VARCHAR(500) NOT NULL,
    tipo_midia ENUM('foto', 'video') NOT NULL,  -- 'foto' ou 'video'
    ano INT NOT NULL,
    visualizacoes INT NOT NULL DEFAULT 0,        -- Contador de cliques/visualizações
    ativo BOOLEAN NOT NULL DEFAULT TRUE,         -- Soft delete (true/false)
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamento direto com a tabela de categorias
    CONSTRAINT fk_midia_categoria 
        FOREIGN KEY (categoria_id) 
        REFERENCES categorias_galeria(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
        
    INDEX idx_criado_em (criado_em),
    INDEX idx_titulo (titulo),
    INDEX idx_filtro_ano_cat (ano, categoria_id, ativo)
) ENGINE=InnoDB;

-- 3. Tabela de Apoiadores (Com o campo de visualizações integrado)
CREATE TABLE IF NOT EXISTS apoiadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    descricao TEXT,
    logo_url VARCHAR(500) NOT NULL,
    site_url VARCHAR(500) NULL,
    visualizacoes INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 4. Tabela de Estatísticas do Grupo
CREATE TABLE IF NOT EXISTS estatisticas_grupo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quantidade_participantes INT NOT NULL,
    quantidade_torneios INT NOT NULL,
    ano_fundacao INT NOT NULL DEFAULT 2019
) ENGINE=InnoDB;

-- =========================================================================
-- Dados Iniciais (Opcional - para testes locais no MySQL)
-- =========================================================================
INSERT IGNORE INTO categorias_galeria (id, nome) VALUES
(1, 'Competições e Torneios'),
(2, 'Treinos Semanais'),
(3, 'Eventos e Confraternizações');

INSERT IGNORE INTO estatisticas_grupo (id, quantidade_participantes, quantidade_torneios, ano_fundacao) VALUES
(1, 48, 14, 2019);
