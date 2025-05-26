import express from 'express';
import productService from '../services/products.js';
import analyticsService from '../services/analytics.js';

const router = express.Router();

// Product CRUD operations
router.get('/', async (req, res) => {
    try {
        const products = await productService.searchProducts(req.query);
        res.json(products);
    } catch (error) {
        console.error('Error in products endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error in get product endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error in create product endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error in update product endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error in delete product endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analytics endpoints
router.get('/analytics/clustering', async (req, res) => {
    try {
        const clusters = await analyticsService.clientClustering();
        res.json(clusters);
    } catch (error) {
        console.error('Error in clustering endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/analytics/prediction', async (req, res) => {
    try {
        const prediction = await analyticsService.salesPrediction();
        res.json(prediction);
    } catch (error) {
        console.error('Error in prediction endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
