const express = require('express');
const router = express.Router();
const connect = require('../services/mongo');

router.get('/', async (req, res) => {
    const db = await connect();
    const comentarios = await db.collection('comentarios_filmes') .find({ id_filme: req.params.id}).toArray();
    res.json(comentarios);
});

//Inserir comentario
router.post('/', async (req, res) => {
    const db = await connect();
    const comentario = await db.collection('comentarios_filmes').insertOne(req.body);
    res.json(comentario);
});

//Editar comentario
router.put('/:id', async (req, res) => {
    const db = await connect();
    const comentario = await db.collection('comentarios_filmes').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.json(comentario);
});

//Deletar comentario
router.delete('/:id', async (req, res) => {
    const db = await connect();
    const comentario = await db.collection('comentarios_filmes').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(comentario);
});

//Listar comentarios por filme
router.get('/filme/:id', async (req, res) => {
    const db = await connect();
    const comentarios = await db.collection('comentarios_filmes').find({ id_filme: req.params.id }).toArray();
    res.json(comentarios);
});

//Listar comentarios por cliente
router.get('/cliente/:id', async (req, res) => {
    const db = await connect();
    const comentarios = await db.collection('comentarios_filmes').find({ id_cliente: req.params.id }).toArray();
    res.json(comentarios);
});

//Listar comentarios por filme e cliente
router.get('/filme/:id/cliente/:id_cliente', async (req, res) => {
    const db = await connect();
    const comentarios = await db.collection('comentarios_filmes').find({ id_filme: req.params.id, id_cliente: req.params.id_cliente }).toArray();
    res.json(comentarios);
});

module.exports = router;