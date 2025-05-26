const express = require('express');
const router = express.Router();
const { dw: dwPool } = require('../services/postgre');

// Listar locações por mês
router.get('/locacoes-por-mes', async (req, res) => {
    try {
        const { rows } = await dwPool.query(`
            SELECT 
                dt.mes, 
                dt.ano, 
                COUNT(f.locacao_id) AS total
            FROM dw.fact_locacao f
            JOIN dw.dim_tempo dt ON f.tempo_id = dt.tempo_id
            GROUP BY dt.mes, dt.ano
            ORDER BY dt.ano, dt.mes
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar locações por mês:', error);
        res.status(500).json({ error: 'Erro ao buscar locações por mês' });
    }
});

// Listar locações por filme
router.get('/locacoes-por-filme', async (req, res) => {
    try {
        const { rows } = await dwPool.query(`
            SELECT 
                dp.titulo, 
                COUNT(f.locacao_id) AS total
            FROM dw.fact_locacao f
            JOIN dw.dim_produto dp ON f.produto_id = dp.produto_id
            GROUP BY dp.titulo
            ORDER BY total DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar locações por filme:', error);
        res.status(500).json({ error: 'Erro ao buscar locações por filme' });
    }
});

// Listar locações por cliente
router.get('/locacoes-por-cliente', async (req, res) => {
    try {
        const { rows } = await dwPool.query(`
            SELECT 
                dc.nome, 
                COUNT(f.locacao_id) AS total
            FROM dw.fact_locacao f
            JOIN dw.dim_cliente dc ON f.cliente_id = dc.cliente_id
            GROUP BY dc.nome
            ORDER BY total DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar locações por cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar locações por cliente' });
    }
});

// Listar locações por Gênero
router.get('/locacoes-por-genero', async (req, res) => {
    try {
        const { rows } = await dwPool.query(`
            SELECT 
                dg.nome as genero, 
                COUNT(f.locacao_id) AS total
            FROM dw.fact_locacao f
            JOIN dw.dim_produto dp ON f.produto_id = dp.produto_id
            JOIN dw.dim_genero dg ON dp.genero_id = dg.genero_id
            GROUP BY dg.nome
            ORDER BY total DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar locações por gênero:', error);
        res.status(500).json({ error: 'Erro ao buscar locações por gênero' });
    }
});

module.exports = router;