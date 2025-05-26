const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

async function connect() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB');
        return client.db('locadora');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        throw error;
    }
}

module.exports = { connect };