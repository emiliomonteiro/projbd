import express from 'express';
import { dwPool } from '../services/postgre.js';

const router = express.Router();

// Get dashboard KPIs
router.get('/', async (req, res) => {
    try {
        // Get total customers and previous month comparison
        const customersResult = await dwPool.query(`
            WITH current_month AS (
                SELECT COUNT(*) as total 
                FROM dw.dim_cliente
            ),
            previous_month AS (
                SELECT COUNT(*) as total 
                FROM dw.dim_cliente 
                WHERE data_cadastro < DATE_TRUNC('month', CURRENT_DATE)
            )
            SELECT 
                current_month.total,
                CASE 
                    WHEN previous_month.total = 0 THEN 0
                    ELSE ((current_month.total - previous_month.total)::float / previous_month.total * 100)
                END as change
            FROM current_month, previous_month
        `);
        const { total: totalCustomers, change: customersChange } = customersResult.rows[0];

        // Get available movies and previous month comparison
        const moviesResult = await dwPool.query(`
            WITH current_month AS (
                SELECT COUNT(*) as total 
                FROM dw.dim_produto 
                WHERE disponivel = true
            ),
            previous_month AS (
                SELECT COUNT(*) as total 
                FROM dw.dim_produto 
                WHERE disponivel = true 
                AND data_cadastro < DATE_TRUNC('month', CURRENT_DATE)
            )
            SELECT 
                current_month.total,
                CASE 
                    WHEN previous_month.total = 0 THEN 0
                    ELSE ((current_month.total - previous_month.total)::float / previous_month.total * 100)
                END as change
            FROM current_month, previous_month
        `);
        const { total: availableMovies, change: moviesChange } = moviesResult.rows[0];

        // Get active rentals and previous month comparison
        const rentalsResult = await dwPool.query(`
            WITH current_month AS (
                SELECT COUNT(*) as total 
                FROM dw.fact_locacao 
                WHERE data_devolucao > CURRENT_DATE
            ),
            previous_month AS (
                SELECT COUNT(*) as total 
                FROM dw.fact_locacao 
                WHERE data_devolucao > DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                AND data_devolucao <= DATE_TRUNC('month', CURRENT_DATE)
            )
            SELECT 
                current_month.total,
                CASE 
                    WHEN previous_month.total = 0 THEN 0
                    ELSE ((current_month.total - previous_month.total)::float / previous_month.total * 100)
                END as change
            FROM current_month, previous_month
        `);
        const { total: activeRentals, change: rentalsChange } = rentalsResult.rows[0];

        // Get monthly revenue and previous month comparison
        const revenueResult = await dwPool.query(`
            WITH current_month AS (
                SELECT COALESCE(SUM(valor_locacao), 0) as total
                FROM dw.fact_locacao
                WHERE EXTRACT(MONTH FROM data_locacao) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM data_locacao) = EXTRACT(YEAR FROM CURRENT_DATE)
            ),
            previous_month AS (
                SELECT COALESCE(SUM(valor_locacao), 0) as total
                FROM dw.fact_locacao
                WHERE EXTRACT(MONTH FROM data_locacao) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                AND EXTRACT(YEAR FROM data_locacao) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
            )
            SELECT 
                current_month.total,
                CASE 
                    WHEN previous_month.total = 0 THEN 0
                    ELSE ((current_month.total - previous_month.total)::float / previous_month.total * 100)
                END as change
            FROM current_month, previous_month
        `);
        const { total: monthlyRevenue, change: revenueChange } = revenueResult.rows[0];

        // Get rentals by category for the chart
        const rentalsByCategory = await dwPool.query(`
            SELECT 
                dg.nome as category,
                COUNT(f.locacao_id) as count
            FROM dw.fact_locacao f
            JOIN dw.dim_produto dp ON f.produto_id = dp.produto_id
            JOIN dw.dim_genero dg ON dp.genero_id = dg.genero_id
            GROUP BY dg.nome
            ORDER BY count DESC
            LIMIT 5
        `);

        // Get top movies for the chart
        const topMovies = await dwPool.query(`
            SELECT 
                dp.titulo,
                COUNT(f.locacao_id) as count
            FROM dw.fact_locacao f
            JOIN dw.dim_produto dp ON f.produto_id = dp.produto_id
            GROUP BY dp.titulo
            ORDER BY count DESC
            LIMIT 5
        `);

        res.json({
            totalCustomers,
            customersChange,
            availableMovies,
            moviesChange,
            activeRentals,
            rentalsChange,
            monthlyRevenue,
            revenueChange,
            rentalsByCategory: rentalsByCategory.rows,
            topMovies: topMovies.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
});

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

export default router;