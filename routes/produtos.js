const express = require('express');
const router = express.Router();
const productService = require('../services/objectdb');
const dataMining = require('../services/dataMining');

// Product CRUD operations
router.get('/', async (req, res) => {
    try {
        const products = await productService.searchProducts(req.query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Data mining endpoints
router.get('/analytics/clustering', async (req, res) => {
    try {
        const clusters = await dataMining.clientClustering();
        res.json(clusters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics/prediction', async (req, res) => {
    try {
        const prediction = await dataMining.salesPrediction();
        res.json({ prediction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
