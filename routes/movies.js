import express from 'express';
import { validateMovie } from '../middleware/validation.js';
import dbManager from '../database/connection.js';

const router = express.Router();

// Get all movies with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, genre, available } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM movies';
        const params = [];
        
        if (genre || available !== undefined) {
            query += ' WHERE';
            if (genre) {
                query += ' genre = ?';
                params.push(genre);
            }
            if (available !== undefined) {
                if (genre) query += ' AND';
                query += ' available = ?';
                params.push(available === 'true' ? 1 : 0);
            }
        }
        
        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const totalCount = dbManager.getSQLiteDB().prepare(countQuery).get(...params).count;
        
        // Get paginated results
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const movies = dbManager.getSQLiteDB().prepare(query).all(...params);
        
        res.json({
            movies,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalMovies: totalCount
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// Create a new movie
router.post('/', validateMovie, async (req, res) => {
    try {
        const { title, genre, poster, available, description, releaseYear, director } = req.body;
        
        const stmt = dbManager.getSQLiteDB().prepare(`
            INSERT INTO movies (title, genre, poster, available, description, releaseYear, director)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(title, genre, poster, available ? 1 : 0, description, releaseYear, director);
        
        const movie = dbManager.getSQLiteDB().prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(movie);
    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({ error: 'Failed to create movie' });
    }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
    try {
        const movie = dbManager.getSQLiteDB().prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
});

// Update movie
router.put('/:id', validateMovie, async (req, res) => {
    try {
        const { title, genre, poster, available, description, releaseYear, director } = req.body;
        
        const stmt = dbManager.getSQLiteDB().prepare(`
            UPDATE movies 
            SET title = ?, genre = ?, poster = ?, available = ?, 
                description = ?, releaseYear = ?, director = ?
            WHERE id = ?
        `);
        
        const result = stmt.run(title, genre, poster, available ? 1 : 0, 
            description, releaseYear, director, req.params.id);
            
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        
        const movie = dbManager.getSQLiteDB().prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        res.json(movie);
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ error: 'Failed to update movie' });
    }
});

// Delete movie
router.delete('/:id', async (req, res) => {
    try {
        const result = dbManager.getSQLiteDB().prepare('DELETE FROM movies WHERE id = ?').run(req.params.id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ error: 'Failed to delete movie' });
    }
});

export default router; 