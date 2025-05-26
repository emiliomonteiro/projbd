const { Pool } = require('pg');
const config = require('../config');

// OLTP Database Pool
const oltpPool = new Pool({
    user: config.postgres.user,
    host: config.postgres.host,
    database: 'locadora',
    password: config.postgres.password,
    port: config.postgres.port
});

// Data Warehouse Pool
const dwPool = new Pool({
    user: config.postgres.user,
    host: config.postgres.host,
    database: 'locadora_dw',
    password: config.postgres.password,
    port: config.postgres.port
});

// Test connections
async function testConnections() {
    try {
        await oltpPool.query('SELECT NOW()');
        await dwPool.query('SELECT NOW()');
        console.log('Conexões com PostgreSQL estabelecidas com sucesso');
    } catch (error) {
        console.error('Erro ao conectar com PostgreSQL:', error);
        throw error;
    }
}

// Initialize connections
testConnections();

module.exports = {
    oltp: oltpPool,
    dw: dwPool
};