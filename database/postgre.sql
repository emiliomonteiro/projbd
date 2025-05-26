-- Criação do banco
CREATE DATABASE locadora_dw;

\c locadora_dw

-- Schema
CREATE SCHEMA dw;

-- Tabelas Dimensão
CREATE TABLE dw.dim_tempo (
    id SERIAL PRIMARY KEY,
    data DATE,
    dia INT,
    mes INT,
    ano INT
);

CREATE TABLE dw.dim_cliente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    idade INT,
    cidade VARCHAR(100),
    estado VARCHAR(50)
);

CREATE TABLE dw.dim_filme (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100),
    genero VARCHAR(50),
    diretor VARCHAR(100)
);

CREATE TABLE dw.dim_loja (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50)
);

-- Tabela Fato
CREATE TABLE dw.fato_locacao (
    id SERIAL PRIMARY KEY,
    id_tempo INT REFERENCES dw.dim_tempo(id),
    id_cliente INT REFERENCES dw.dim_cliente(id),
    id_filme INT REFERENCES dw.dim_filme(id),
    id_loja INT REFERENCES dw.dim_loja(id),
    valor DECIMAL(10,2)
);

-- Inserção de Dados Mock

-- Dim_Tempo
INSERT INTO dw.dim_tempo (data, dia, mes, ano) VALUES
('2024-05-01', 1, 5, 2024),
('2024-05-02', 2, 5, 2024),
('2024-06-01', 1, 6, 2024);

-- Dim_Cliente
INSERT INTO dw.dim_cliente (nome, idade, cidade, estado) VALUES
('João Silva', 35, 'São Paulo', 'SP'),
('Ana Costa', 28, 'Rio de Janeiro', 'RJ');

-- Dim_Filme
INSERT INTO dw.dim_filme (titulo, genero, diretor) VALUES
('Matrix', 'Ficção Científica', 'Lana Wachowski'),
('O Poderoso Chefão', 'Drama', 'Francis Ford Coppola');

-- Dim_Loja
INSERT INTO dw.dim_loja (nome, cidade, estado) VALUES
('Loja Central', 'São Paulo', 'SP'),
('Loja Praia', 'Rio de Janeiro', 'RJ');

-- Fato_Locacao
INSERT INTO dw.fato_locacao (id_tempo, id_cliente, id_filme, id_loja, valor) VALUES
(1, 1, 1, 1, 9.90),
(2, 2, 2, 2, 12.90),
(3, 1, 2, 1, 10.90);
