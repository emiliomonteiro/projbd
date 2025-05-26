const express = require('express');
const router = express.Router();
const mongoService = require('../services/mongodb');

// Listar comentários de um filme
router.get('/filme/:filmeId', async (req, res) => {
    try {
        const comentarios = await mongoService.getComentarios(req.params.filmeId);
        res.json(comentarios);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ error: 'Erro ao buscar comentários' });
    }
});

// Adicionar comentário
router.post('/', async (req, res) => {
    try {
        const { filmeId, clienteId, comentario, avaliacao, tags } = req.body;
        const novoComentario = {
            produto_id: filmeId,
            cliente_id: clienteId,
            comentario,
            avaliacao,
            tags: tags || [],
            metadata: {
                plataforma: req.headers['user-agent'],
                versao_app: '1.0',
                dispositivo: 'web'
            }
        };
        
        const result = await mongoService.addComentario(novoComentario);
        res.status(201).json(result);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ error: 'Erro ao adicionar comentário' });
    }
});

// Adicionar imagem ao filme
router.post('/filme/:filmeId/imagem', async (req, res) => {
    try {
        const { url, tipo, dimensoes } = req.body;
        const imagem = {
            url,
            tipo,
            dimensoes,
            metadata: {
                formato: url.split('.').pop(),
                tamanho: req.body.tamanho || 0,
                data_upload: new Date()
            }
        };
        
        const result = await mongoService.addProdutoImagem(req.params.filmeId, imagem);
        res.status(201).json(result);
    } catch (error) {
        console.error('Erro ao adicionar imagem:', error);
        res.status(500).json({ error: 'Erro ao adicionar imagem' });
    }
});

// Definir capa principal
router.put('/filme/:filmeId/capa', async (req, res) => {
    try {
        const { url } = req.body;
        const result = await mongoService.setCapaPrincipal(req.params.filmeId, url);
        res.json(result);
    } catch (error) {
        console.error('Erro ao definir capa principal:', error);
        res.status(500).json({ error: 'Erro ao definir capa principal' });
    }
});

// Buscar imagens do filme
router.get('/filme/:filmeId/imagens', async (req, res) => {
    try {
        const imagens = await mongoService.getProdutoImagens(req.params.filmeId);
        res.json(imagens);
    } catch (error) {
        console.error('Erro ao buscar imagens:', error);
        res.status(500).json({ error: 'Erro ao buscar imagens' });
    }
});

module.exports = router;