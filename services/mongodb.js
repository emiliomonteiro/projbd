import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'locadora_dw';

class MongoDBService {
    constructor() {
        this.client = new MongoClient(uri);
        this.db = null;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(dbName);
            console.log('Conectado ao MongoDB');
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            console.log('Desconectado do MongoDB');
        } catch (error) {
            console.error('Erro ao desconectar do MongoDB:', error);
            throw error;
        }
    }

    // Comentários
    async addComentario(comentario) {
        try {
            const collection = this.db.collection('comentarios');
            const result = await collection.insertOne({
                ...comentario,
                data_comentario: new Date()
            });
            return result;
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            throw error;
        }
    }

    async getComentarios(produtoId) {
        try {
            const collection = this.db.collection('comentarios');
            return await collection.find({ produto_id: produtoId }).toArray();
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            throw error;
        }
    }

    // Imagens de Produtos
    async addProdutoImagem(produtoId, imagem) {
        try {
            const collection = this.db.collection('produto_imagens');
            const result = await collection.updateOne(
                { produto_id: produtoId },
                {
                    $push: {
                        imagens: {
                            ...imagem,
                            data_upload: new Date()
                        }
                    }
                },
                { upsert: true }
            );
            return result;
        } catch (error) {
            console.error('Erro ao adicionar imagem:', error);
            throw error;
        }
    }

    async getProdutoImagens(produtoId) {
        try {
            const collection = this.db.collection('produto_imagens');
            const result = await collection.findOne({ produto_id: produtoId });
            return result ? result.imagens : [];
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            throw error;
        }
    }

    async setCapaPrincipal(produtoId, imagemUrl) {
        try {
            const collection = this.db.collection('produto_imagens');
            const result = await collection.updateOne(
                { produto_id: produtoId },
                { $set: { capa_principal: imagemUrl } },
                { upsert: true }
            );
            return result;
        } catch (error) {
            console.error('Erro ao definir capa principal:', error);
            throw error;
        }
    }
}

export default new MongoDBService(); 