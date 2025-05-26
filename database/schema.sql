-- Operational Database (OLTP)
CREATE DATABASE locadora;

\c locadora

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Filmes
CREATE TABLE IF NOT EXISTS filmes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    genero VARCHAR(50),
    ano_lancamento INTEGER,
    disponivel BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Locações
CREATE TABLE IF NOT EXISTS locacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    filme_id INTEGER REFERENCES filmes(id),
    data_locacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP,
    devolvido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    filme_id INTEGER REFERENCES filmes(id),
    comentario TEXT NOT NULL,
    avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Warehouse Database
CREATE DATABASE locadora_dw;

\c locadora_dw

-- Schema
CREATE SCHEMA IF NOT EXISTS dw;

-- Dimension Tables
CREATE TABLE IF NOT EXISTS dw.dim_cliente (
    cliente_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cidade_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_cidade (
    cidade_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_estado (
    estado_id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_produto (
    produto_id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    genero_id INTEGER,
    ano_lancamento INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_genero (
    genero_id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_tempo (
    tempo_id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    dia INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dw.dim_loja (
    loja_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fact Table
CREATE TABLE IF NOT EXISTS dw.fact_locacao (
    locacao_id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES dw.dim_cliente(cliente_id),
    produto_id INTEGER REFERENCES dw.dim_produto(produto_id),
    tempo_id INTEGER REFERENCES dw.dim_tempo(tempo_id),
    loja_id INTEGER REFERENCES dw.dim_loja(loja_id),
    valor_locacao DECIMAL(10,2) NOT NULL,
    dias_locacao INTEGER NOT NULL,
    devolvido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Constraints
ALTER TABLE dw.dim_cliente
ADD CONSTRAINT fk_cliente_cidade
FOREIGN KEY (cidade_id) REFERENCES dw.dim_cidade(cidade_id);

ALTER TABLE dw.dim_cidade
ADD CONSTRAINT fk_cidade_estado
FOREIGN KEY (estado_id) REFERENCES dw.dim_estado(estado_id);

ALTER TABLE dw.dim_produto
ADD CONSTRAINT fk_produto_genero
FOREIGN KEY (genero_id) REFERENCES dw.dim_genero(genero_id);

ALTER TABLE dw.dim_loja
ADD CONSTRAINT fk_loja_cidade
FOREIGN KEY (cidade_id) REFERENCES dw.dim_cidade(cidade_id);

-- Mock Data for Testing
\c locadora_dw

-- Insert mock data for dimension tables
INSERT INTO dw.dim_estado (nome, uf) VALUES
('São Paulo', 'SP'),
('Rio de Janeiro', 'RJ');

INSERT INTO dw.dim_cidade (nome, estado_id) VALUES
('São Paulo', 1),
('Rio de Janeiro', 2);

INSERT INTO dw.dim_cliente (nome, email, telefone, cidade_id) VALUES
('João Silva', 'joao@email.com', '11999999999', 1),
('Ana Costa', 'ana@email.com', '21988888888', 2);

INSERT INTO dw.dim_genero (nome) VALUES
('Ficção Científica'),
('Drama'),
('Ação');

INSERT INTO dw.dim_produto (titulo, genero_id, ano_lancamento) VALUES
('Matrix', 1, 1999),
('O Poderoso Chefão', 2, 1972);

INSERT INTO dw.dim_loja (nome, cidade_id) VALUES
('Loja Central', 1),
('Loja Praia', 2);

INSERT INTO dw.dim_tempo (data, dia, mes, ano, trimestre) VALUES
('2024-05-01', 1, 5, 2024, 2),
('2024-05-02', 2, 5, 2024, 2),
('2024-06-01', 1, 6, 2024, 2);

-- Insert mock data for fact table
INSERT INTO dw.fact_locacao (cliente_id, produto_id, tempo_id, loja_id, valor_locacao, dias_locacao) VALUES
(1, 1, 1, 1, 9.90, 3),
(2, 2, 2, 2, 12.90, 5),
(1, 2, 3, 1, 10.90, 2); 