const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// GET - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// POST - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      document,
      address,
      city,
      state,
      zip_code,
      notes,
      is_active
    } = req.body;

    // Validação
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Verificar email duplicado
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM clients WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    const result = await pool.query(
      `INSERT INTO clients (
        name, email, phone, company, document, 
        address, city, state, zip_code, notes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        email || null,
        phone || null,
        company || null,
        document || null,
        address || null,
        city || null,
        state || null,
        zip_code || null,
        notes || null,
        is_active !== undefined ? is_active : true
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente', details: error.message });
  }
});

// PUT - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      company,
      document,
      address,
      city,
      state,
      zip_code,
      notes,
      is_active
    } = req.body;

    // Verificar se cliente existe
    const clientCheck = await pool.query(
      'SELECT id FROM clients WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar email duplicado
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM clients WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
        [email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    const result = await pool.query(
      `UPDATE clients SET
        name = $1,
        email = $2,
        phone = $3,
        company = $4,
        document = $5,
        address = $6,
        city = $7,
        state = $8,
        zip_code = $9,
        notes = $10,
        is_active = $11,
        updated_at = NOW()
      WHERE id = $12 AND deleted_at IS NULL
      RETURNING *`,
      [
        name,
        email || null,
        phone || null,
        company || null,
        document || null,
        address || null,
        city || null,
        state || null,
        zip_code || null,
        notes || null,
        is_active !== undefined ? is_active : true,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// DELETE - Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE clients SET 
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
