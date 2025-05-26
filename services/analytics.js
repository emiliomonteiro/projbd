import mlKmeans from 'ml-kmeans';
const { KMeans } = mlKmeans;
import { SimpleLinearRegression } from 'ml-regression';
import { dwPool } from './postgre.js';

class AnalyticsService {
    async clientClustering() {
        try {
            // Get client data
            const { rows } = await dwPool.query(`
                SELECT 
                    dc.cliente_id,
                    COUNT(fl.locacao_id) as total_locacoes,
                    AVG(fl.valor_locacao) as valor_medio,
                    COUNT(DISTINCT fl.produto_id) as filmes_diferentes
                FROM dw.dim_cliente dc
                LEFT JOIN dw.fact_locacao fl ON dc.cliente_id = fl.cliente_id
                GROUP BY dc.cliente_id
            `);

            // Prepare data for clustering
            const data = rows.map((row) => [
                row.total_locacoes,
                row.valor_medio,
                row.filmes_diferentes
            ]);

            // Perform clustering
            const kmeans = new KMeans(data, 3);
            return {
                clusters: kmeans.clusters,
                centroids: kmeans.centroids,
                clientData: rows
            };
        } catch (error) {
            console.error('Error in client clustering:', error);
            throw error;
        }
    }

    async salesPrediction() {
        try {
            // Get Historical sales data
            const { rows } = await dwPool.query(`
                SELECT 
                    dt.mes,
                    dt.ano,
                    COUNT(fl.locacao_id) as total_locacoes,
                    AVG(fl.valor_locacao) as valor_medio
                FROM dw.fact_locacao fl
                JOIN dw.dim_tempo dt ON fl.tempo_id = dt.tempo_id
                GROUP BY dt.mes, dt.ano
                ORDER BY dt.ano, dt.mes
            `);

            // Prepare data for regression
            const X = rows.map((_, i) => i);
            const y = rows.map(row => row.total_locacoes);

            // Train the model
            const regression = new SimpleLinearRegression(X, y);

            // Predict future sales
            const nextMonth = rows.length;
            const prediction = regression.predict(nextMonth);

            return {
                prediction,
                historicalData: rows,
                model: {
                    slope: regression.slope,
                    intercept: regression.intercept
                }
            };
        } catch (error) {
            console.error('Error in sales prediction:', error);
            throw error;
        }
    }
}

export default new AnalyticsService(); 