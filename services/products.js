import { oltpPool } from './postgre.js';

class ProductService {
    async searchProducts(query = {}) {
        try {
            let sql = `
                SELECT 
                    p.id,
                    p.titulo,
                    p.disponivel,
                    p.created_at,
                    COUNT(l.id) as total_locacoes,
                    COALESCE(AVG(l.valor_locacao), 0) as valor_medio_locacao
                FROM filmes p
                LEFT JOIN locacoes l ON p.id = l.filme_id
            `;

            const conditions = [];
            const params = [];
            let paramIndex = 1;

            if (query.titulo) {
                conditions.push(`p.titulo ILIKE $${paramIndex}`);
                params.push(`%${query.titulo}%`);
                paramIndex++;
            }

            if (query.disponivel !== undefined) {
                conditions.push(`p.disponivel = $${paramIndex}`);
                params.push(query.disponivel);
                paramIndex++;
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            sql += ' GROUP BY p.id ORDER BY p.created_at DESC';

            const { rows } = await oltpPool.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const { rows } = await oltpPool.query(
                `SELECT * FROM filmes WHERE id = $1`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting product by id:', error);
            throw error;
        }
    }

    async createProduct(product) {
        try {
            const { rows } = await oltpPool.query(
                `INSERT INTO filmes (titulo, disponivel) VALUES ($1, $2) RETURNING *`,
                [product.titulo, product.disponivel ?? true]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        try {
            const { rows } = await oltpPool.query(
                `UPDATE filmes SET titulo = $1, disponivel = $2 WHERE id = $3 RETURNING *`,
                [product.titulo, product.disponivel, id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const { rows } = await oltpPool.query(
                `DELETE FROM filmes WHERE id = $1 RETURNING *`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
}

export default new ProductService(); 