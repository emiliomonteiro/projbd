const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const ObjectDB = require('objectdb');
const config = require('./config');

const app = express();
const port = config.port;

// Database Connections
// PostgreSQL Connection
const pgPool = new Pool(config.postgres);

// MongoDB Connection
mongoose.connect(config.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: config.mongodb.database
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// ObjectDB Connection
const objectDb = new ObjectDB({
    path: path.join(__dirname, 'database', 'products.db')
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Movies (using ObjectDB for products)
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await objectDb.find('movies', {});
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/movies', async (req, res) => {
    try {
        const movie = await objectDb.insert('movies', req.body);
        res.status(201).json(movie);
    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Customers (using PostgreSQL)
app.get('/api/customers', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM clientes');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const { nome, email, telefone, cidade, estado } = req.body;
        const result = await pgPool.query(
            'INSERT INTO clientes (nome, email, telefone, cidade, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, email, telefone, cidade, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Comments (using MongoDB)
const CommentSchema = new mongoose.Schema({
    movie: { type: String, required: true },
    user: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', CommentSchema);

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ date: -1 });
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rentals (using PostgreSQL)
app.get('/api/rentals', async (req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT l.*, c.nome as cliente_nome, f.titulo as filme_titulo
            FROM locacoes l
            JOIN clientes c ON l.cliente_id = c.id
            JOIN filmes f ON l.filme_id = f.id
            ORDER BY l.data_locacao DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rentals:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/rentals', async (req, res) => {
    try {
        const { cliente_id, filme_id, data_devolucao } = req.body;
        const result = await pgPool.query(
            'INSERT INTO locacoes (cliente_id, filme_id, data_devolucao) VALUES ($1, $2, $3) RETURNING *',
            [cliente_id, filme_id, data_devolucao]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating rental:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Dashboard Data (using PostgreSQL Data Warehouse)
app.get('/api/dashboard', async (req, res) => {
    try {
        // Get total customers
        const customersResult = await pgPool.query('SELECT COUNT(*) FROM clientes');
        
        // Get available movies
        const moviesResult = await pgPool.query('SELECT COUNT(*) FROM filmes WHERE disponivel = true');
        
        // Get active rentals
        const rentalsResult = await pgPool.query('SELECT COUNT(*) FROM locacoes WHERE devolvido = false');
        
        // Get monthly revenue from data warehouse
        const revenueResult = await pgPool.query(`
            SELECT SUM(valor_locacao) as total
            FROM dw.fact_locacao
            WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        `);

        // Get monthly rentals trend
        const trendResult = await pgPool.query(`
            SELECT 
                EXTRACT(MONTH FROM created_at) as mes,
                COUNT(*) as total_locacoes
            FROM dw.fact_locacao
            WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY EXTRACT(MONTH FROM created_at)
            ORDER BY mes
        `);

        // Get top movies
        const topMoviesResult = await pgPool.query(`
            SELECT 
                p.titulo,
                COUNT(*) as total_locacoes,
                AVG(c.avaliacao) as media_avaliacao
            FROM dw.fact_locacao l
            JOIN dw.dim_produto p ON l.produto_id = p.produto_id
            LEFT JOIN comentarios c ON c.filme_id = p.produto_id
            GROUP BY p.titulo
            ORDER BY total_locacoes DESC
            LIMIT 5
        `);

        res.json({
            totalCustomers: parseInt(customersResult.rows[0].count),
            availableMovies: parseInt(moviesResult.rows[0].count),
            activeRentals: parseInt(rentalsResult.rows[0].count),
            monthlyRevenue: parseFloat(revenueResult.rows[0].total || 0),
            monthlyRentals: trendResult.rows.map(row => row.total_locacoes),
            topMovies: topMoviesResult.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Rota para servir o index.html
app.get('/', (req, res) => {
    console.log('Serving index.html...');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize ObjectDB with sample data if empty
async function initializeObjectDB() {
    try {
        const movies = await objectDb.find('movies', {});
        if (movies.length === 0) {
            await objectDb.insert('movies', [
                {
                    title: 'Interestelar',
                    genre: 'Ficção Científica',
                    poster: 'https://via.placeholder.com/300x450',
                    available: true
                },
                {
                    title: 'O Poderoso Chefão',
                    genre: 'Drama',
                    poster: 'https://via.placeholder.com/300x450',
                    available: false
                }
            ]);
            console.log('Sample movies added to ObjectDB');
        }
    } catch (error) {
        console.error('Error initializing ObjectDB:', error);
    }
}

// Iniciar servidor
app.listen(port, async () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Diretório público:', path.join(__dirname, 'public'));
    await initializeObjectDB();
});
