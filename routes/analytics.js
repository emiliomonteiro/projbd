import express from 'express';
import analyticsService from '../services/analytics.js';

const router = express.Router();

// Client clustering analysis
router.get('/clustering', async (req, res) => {
    try {
        const clusters = await analyticsService.clientClustering();
        res.json(clusters);
    } catch (error) {
        console.error('Error in clustering endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to perform clustering analysis',
            details: error.message 
        });
    }
});

// Sales prediction
router.get('/prediction', async (req, res) => {
    try {
        const prediction = await analyticsService.salesPrediction();
        res.json(prediction);
    } catch (error) {
        console.error('Error in prediction endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to generate sales prediction',
            details: error.message 
        });
    }
});

export default router; 