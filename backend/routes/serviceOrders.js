const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET - Listar todas as OS
router.get('/', async (req, res) => {
  try {
    // TRUQUE: 'final_cost as price' faz o frontend receber o campo como 'price'
    const result = await pool.query(
      'SELECT *, final_cost as price FROM service_orders ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar OS:', error);
    res.status(500).json({ error: 'Erro ao listar ordens de serviço' });
  }
});

// GET - Buscar OS por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TRUQUE: Aqui também retornamos final_cost como price
    const result = await pool.query(
      'SELECT *, final_cost as price FROM service_orders WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
  }
});

// POST - Criar nova OS
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      equipment,
      brand,
      model,
      serial_number,
      reported_issue,
      priority,
      customer_notes,
      price,      // Recebemos 'price' do frontend
      status      // Recebemos 'status'
    } = req.body;

    // Gerar número da OS
    const numberResult = await pool.query(
      `SELECT COALESCE(
        MAX(
          CASE 
            WHEN number ~ '^OS-[0-9]+$' 
            THEN CAST(SUBSTRING(number FROM 4) AS INTEGER)
            ELSE 0
          END
        ), 0
      ) + 1 as next_number 
      FROM service_orders`
    );
    const nextNumber = numberResult.rows[0].next_number;
    const osNumber = `OS-${String(nextNumber).padStart(4, '0')}`;

    // Mapeamos 'price' para 'final_cost' no banco
    const result = await pool.query(
      `INSERT INTO service_orders (
        number, client_id, equipment, brand, model, serial_number,
        reported_issue, priority, customer_notes, status, final_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *, final_cost as price`,
      [
        osNumber,
        client_id || null,
        equipment,
        brand || null,
        model || null,
        serial_number || null,
        reported_issue,
        priority || 'normal',
        customer_notes || null,
        status || 'open',
        price || 0 // Salvamos o preço aqui
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
  }
});

// PUT - Atualizar OS
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      equipment,
      brand,
      model,
      serial_number,
      reported_issue,
      diagnosed_issue,
      solution,
      technician_notes,
      customer_notes,
      priority,
      price // O frontend manda 'price'
    } = req.body;

    // Atualizamos 'final_cost' usando o valor de 'price'
    const result = await pool.query(
      `UPDATE service_orders SET
        status = COALESCE($1, status),
        equipment = COALESCE($2, equipment),
        brand = COALESCE($3, brand),
        model = COALESCE($4, model),
        serial_number = COALESCE($5, serial_number),
        reported_issue = COALESCE($6, reported_issue),
        diagnosed_issue = COALESCE($7, diagnosed_issue),
        solution = COALESCE($8, solution),
        technician_notes = COALESCE($9, technician_notes),
        customer_notes = COALESCE($10, customer_notes),
        priority = COALESCE($11, priority),
        final_cost = COALESCE($12, final_cost),
        updated_at = NOW()
      WHERE id = $13
      RETURNING *, final_cost as price`,
      [
        status, equipment, brand, model, serial_number,
        reported_issue, diagnosed_issue, solution,
        technician_notes, customer_notes, priority,
        price, // Mapeado para o parâmetro $12 (final_cost)
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar OS:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
  }
});

// DELETE - Deletar OS
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM service_orders WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar OS:', error);
    res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
  }
});

module.exports = router;