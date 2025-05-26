import mongoose from 'mongoose';
import { Pool } from 'pg';
import { config } from '../config.js';

class DatabaseManager {
    constructor() {
        this.pgPool = null;
        this.mongoConnection = null;
    }

    async connectPostgres() {
        try {
            this.pgPool = new Pool({
                ...config.postgres,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            await this.pgPool.query('SELECT NOW()');
            console.log('Connected to PostgreSQL');
        } catch (error) {
            console.error('PostgreSQL connection error:', error);
            throw error;
        }
    }

    async connectMongo() {
        try {
            this.mongoConnection = await mongoose.connect(config.mongodb.uri, {
                dbName: config.mongodb.database,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async connectAll() {
        try {
            await Promise.all([
                this.connectPostgres(),
                this.connectMongo()
            ]);
        } catch (error) {
            console.error('Failed to connect to databases:', error);
            throw error;
        }
    }

    async disconnectAll() {
        try {
            if (this.pgPool) {
                await this.pgPool.end();
            }
            if (this.mongoConnection) {
                await mongoose.disconnect();
            }
            console.log('Disconnected from all databases');
        } catch (error) {
            console.error('Error disconnecting from databases:', error);
            throw error;
        }
    }

    getPostgresPool() {
        if (!this.pgPool) {
            throw new Error('PostgreSQL connection not initialized');
        }
        return this.pgPool;
    }

    getMongoConnection() {
        if (!this.mongoConnection) {
            throw new Error('MongoDB connection not initialized');
        }
        return this.mongoConnection;
    }
}

// Create a singleton instance
const dbManager = new DatabaseManager();

export default dbManager; 