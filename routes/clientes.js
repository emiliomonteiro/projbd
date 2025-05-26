const express = require('express');
const router = express.Router();
const { oltp: oltpPool, dw: dwPool } = require('../services/postgre');

// Listar todos os clientes
router.get('/', async (req, res) => {
    try {
        const { rows } = await oltpPool.query(`
            SELECT 
                id,
                nome,
                email,
                telefone,
                cidade,
                estado
            FROM clientes
            ORDER BY nome
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

// Buscar clientes
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        const { rows } = await oltpPool.query(`
            SELECT 
                id,
                nome,
                email,
                telefone,
                cidade,
                estado
            FROM clientes
            WHERE nome ILIKE $1 OR email ILIKE $1
            ORDER BY nome
        `, [`%${q}%`]);
        res.json(rows);
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ error: 'Erro na busca' });
    }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await oltpPool.query(`
            SELECT 
                id,
                nome,
                email,
                telefone,
                cidade,
                estado
            FROM clientes
            WHERE id = $1
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
});

// Criar novo cliente
router.post('/', async (req, res) => {
    const { nome, email, telefone, cidade, estado } = req.body;
    
    try {
        const { rows } = await oltpPool.query(
            'INSERT INTO clientes (nome, email, telefone, cidade, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, email, telefone, cidade, estado]
        );

        // Sincronizar com o Data Warehouse
        await syncToDataWarehouse(rows[0]);

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cidade, estado } = req.body;
    
    try {
        const { rows } = await oltpPool.query(
            'UPDATE clientes SET nome = $1, email = $2, telefone = $3, cidade = $4, estado = $5 WHERE id = $6 RETURNING *',
            [nome, email, telefone, cidade, estado, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        // Sincronizar com o Data Warehouse
        await syncToDataWarehouse(rows[0]);

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

// Excluir cliente
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await oltpPool.query(
            'DELETE FROM clientes WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        // Remover do Data Warehouse
        await dwPool.query('DELETE FROM dw.dim_cliente WHERE cliente_id = $1', [id]);

        res.json({ message: 'Cliente excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
});

// Função auxiliar para sincronizar com o Data Warehouse
async function syncToDataWarehouse(cliente) {
    try {
        await dwPool.query('BEGIN');

        // Verificar/inserir estado
        let estadoResult = await dwPool.query(
            'SELECT estado_id FROM dw.dim_estado WHERE uf = $1',
            [cliente.estado]
        );
        
        if (estadoResult.rows.length === 0) {
            estadoResult = await dwPool.query(
                'INSERT INTO dw.dim_estado (nome, uf) VALUES ($1, $2) RETURNING estado_id',
                [cliente.estado, cliente.estado]
            );
        }
        
        const estado_id = estadoResult.rows[0].estado_id;

        // Verificar/inserir cidade
        let cidadeResult = await dwPool.query(
            'SELECT cidade_id FROM dw.dim_cidade WHERE nome = $1 AND estado_id = $2',
            [cliente.cidade, estado_id]
        );
        
        if (cidadeResult.rows.length === 0) {
            cidadeResult = await dwPool.query(
                'INSERT INTO dw.dim_cidade (nome, estado_id) VALUES ($1, $2) RETURNING cidade_id',
                [cliente.cidade, estado_id]
            );
        }
        
        const cidade_id = cidadeResult.rows[0].cidade_id;

        // Inserir/atualizar cliente no DW
        await dwPool.query(`
            INSERT INTO dw.dim_cliente (cliente_id, nome, email, telefone, cidade_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (cliente_id) DO UPDATE
            SET nome = EXCLUDED.nome,
                email = EXCLUDED.email,
                telefone = EXCLUDED.telefone,
                cidade_id = EXCLUDED.cidade_id
        `, [cliente.id, cliente.nome, cliente.email, cliente.telefone, cidade_id]);

        await dwPool.query('COMMIT');
    } catch (error) {
        await dwPool.query('ROLLBACK');
        console.error('Erro ao sincronizar com Data Warehouse:', error);
        throw error;
    }
}

module.exports = router;