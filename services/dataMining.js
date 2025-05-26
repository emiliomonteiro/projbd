const { KMeans } = require('ml-kmeans');
const { LinearRegression } = require('ml-regression-linear');

class DataMiningService {
    constructor() {
        this.dwPool = require('./postgre');
}

async clientClustering() {
    // Get client data
    const {rows} = await this.dwPool.query(`
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
    const kmeans =  new KMeans(data, 3);
    return kmeans.clusters;
}

async salesPrediction() {
    // Get Historical sales data
    const {rows} = await this.dwPool.query(`
        SELECT 
            dt.mes,
            dt.ano,
            COUNT(fl.locacao_id) as total_locacoes,
            AVG(fl.valor_locacao) as valor_medio,
        FROM dw.fact_locacao fl
        JOIN dw.dim_tempo dt ON fl.tempo_id = dt.tempo_id
        GROUP BY dt.mes, dt.ano
        ORDER BY dt.ano, dt.mes
    `);

    // Prepare data for regression
    const X = rows.map((_, i) => [i]);
    const y = rows.map(row => row.total_vendas);

    // Train the model
    const regression = new LinearRegression(X, y);

    // Predict future sales
    const nextMonth = rows.length;
    return regression.predict([nextMonth]); 
    }
}

module.exports = new DataMiningService();