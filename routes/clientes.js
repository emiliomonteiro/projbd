const express = require('express');
const router = express.Router();
const connect = require('../services/postgre');

//Listar clientes
router.get('/', async (req, res) => {
    const rows = await pool.query('SELECT * FROM dw.dim_cliente');
    res.json(rows);
});

//Listar cliente por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const rows = await pool.query('SELECT * FROM dw.dim_cliente WHERE id = $1', [id]);
    res.json(rows);
});

//Inserir cliente
router.post('/', async (req, res) => {
    const { nome, idade, cidade, estado } = req.body;
    const result = await pool.query('INSERT INTO dw.dim_cliente (nome, idade, cidade, estado) VALUES ($1, $2, $3, $4) RETURNING *', [nome, idade, cidade, estado]);
    res.json(result.rows[0]);
});

//Atualizar cliente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, idade, cidade, estado } = req.body;
    const result = await pool.query('UPDATE dw.dim_cliente SET nome = $1, idade = $2, cidade = $3, estado = $4 WHERE id = $5 RETURNING *', [nome, idade, cidade, estado, id]);
    res.json(result.rows[0]);
});

//Deletar cliente
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM dw.dim_cliente WHERE id = $1', [id]);
    res.json({ message: 'Cliente deletado com sucesso' });
});

module.exports = router;