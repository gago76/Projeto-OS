const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/metrics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Total de clientes
    const clientsResult = await pool.query(
      'SELECT COUNT(*) as total FROM clients WHERE deleted_at IS NULL'
    );

    // Total de OS
    const osResult = await pool.query(
      'SELECT COUNT(*) as total FROM service_orders'
    );

    // OS por status
    const statusResult = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM service_orders
       GROUP BY status`
    );

    // OS abertas este mês
    const monthResult = await pool.query(
      `SELECT COUNT(*) as total 
       FROM service_orders 
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    // Receita total (estimada)
    const revenueResult = await pool.query(
      `SELECT 
        COALESCE(SUM(final_cost), 0) as total,
        COALESCE(SUM(estimated_cost), 0) as estimated
       FROM service_orders
       WHERE status = 'completed'`
    );

    res.json({
      clients: {
        total: parseInt(clientsResult.rows[0].total)
      },
      service_orders: {
        total: parseInt(osResult.rows[0].total),
        this_month: parseInt(monthResult.rows[0].total),
        by_status: statusResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {})
      },
      revenue: {
        total: parseFloat(revenueResult.rows[0].total) || 0,
        estimated: parseFloat(revenueResult.rows[0].estimated) || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas do dashboard' });
  }
});

// GET /api/metrics/charts
router.get('/charts', async (req, res) => {
  try {
    // OS por mês (últimos 6 meses)
    const monthlyResult = await pool.query(
      `SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
       FROM service_orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month`
    );

    // OS por prioridade
    const priorityResult = await pool.query(
      `SELECT 
        priority,
        COUNT(*) as count
       FROM service_orders
       GROUP BY priority`
    );

    res.json({
      monthly: monthlyResult.rows,
      priority: priorityResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar dados de gráficos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de gráficos' });
  }
});

module.exports = router;
