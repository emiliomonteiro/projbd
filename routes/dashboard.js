const express = require('express');
const router = express.Router();
const pool = require(../services/postgres);

router.get('/locacoes-por-mes', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT dt.mes, dt.ano, COUNT(f.id) AS total
        FROM dw.fato_locacao f
        JOIN dt.dim_tempo dt ON f.id_tempo = dt.id
        GROUP BY dt.mes. dt.ano
        ORDER BY dt.ano, dt.mes;`)
    res.json(rows);
});

//Listar locações por filme
router.get('/locacoes-por-filme', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT df.titulo, COUNT(f.id) AS total
        FROM dw.fato_locacao f
        JOIN dw.dim_filme df ON f.id_filme = df.id
        GROUP BY df.titulo
        ORDER BY total DESC
        LIMIT 5;`)
    res.json(rows);
});

//Listar locações por cliente
router.get('/locacoes-por-cliente', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT dc.nome, COUNT(f.id) AS total
        FROM dw.fato_locacao f  
        JOIN dw.dim_cliente dc ON f.id_cliente = dc.id
        GROUP BY dc.nome
        ORDER BY total DESC
        LIMIT 5;`)
    res.json(rows);
});

module.exports = router;