const db = require('../config/database');

class Metrics {
  // Métricas principais do dashboard com comparação de período anterior
  static async getDashboardMetrics(timeRange = 'month') {
    let dateFilter = '';
    let previousDateFilter = '';
    
    switch(timeRange) {
      case 'week':
        dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        previousDateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)";
        previousDateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)";
        break;
      case 'quarter':
        dateFilter = "AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE)";
        previousDateFilter = "AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months') AND created_at < DATE_TRUNC('quarter', CURRENT_DATE)";
        break;
      default:
        dateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)";
        previousDateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)";
    }

    // Métricas do período atual
    const currentMetricsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'open') as open_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_orders,
        COUNT(*) FILTER (WHERE status = 'waiting_approval') as waiting_approval,
        COALESCE(SUM(final_cost) FILTER (WHERE status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) FILTER (WHERE status = 'completed'), 0) as avg_completion_hours
      FROM service_orders 
      WHERE 1=1 ${dateFilter}
    `;

    // Métricas do período anterior para comparação
    const previousMetricsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'open') as open_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_orders,
        COUNT(*) FILTER (WHERE status = 'waiting_approval') as waiting_approval,
        COALESCE(SUM(final_cost) FILTER (WHERE status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) FILTER (WHERE status = 'completed'), 0) as avg_completion_hours
      FROM service_orders 
      WHERE 1=1 ${previousDateFilter}
    `;

    try {
      const [currentResult, previousResult] = await Promise.all([
        db.query(currentMetricsQuery),
        db.query(previousMetricsQuery)
      ]);

      const current = currentResult.rows[0];
      const previous = previousResult.rows[0];

      // Calcular tendências (percentual de mudança)
      const calculateTrend = (currentValue, previousValue) => {
        if (previousValue === 0 || previousValue === '0') return currentValue > 0 ? 100 : 0;
        const change = ((parseFloat(currentValue) - parseFloat(previousValue)) / parseFloat(previousValue)) * 100;
        return Math.round(change * 10) / 10; // Arredondar para 1 casa decimal
      };

      return {
        current: {
          total: parseInt(current.total_orders),
          open: parseInt(current.open_orders),
          in_progress: parseInt(current.in_progress_orders),
          completed: parseInt(current.completed_orders),
          urgent: parseInt(current.urgent_orders),
          waiting_approval: parseInt(current.waiting_approval),
          revenue: parseFloat(current.total_revenue),
          avg_hours: Math.round(parseFloat(current.avg_completion_hours))
        },
        trends: {
          total: calculateTrend(current.total_orders, previous.total_orders),
          open: calculateTrend(current.open_orders, previous.open_orders),
          in_progress: calculateTrend(current.in_progress_orders, previous.in_progress_orders),
          completed: calculateTrend(current.completed_orders, previous.completed_orders),
          urgent: calculateTrend(current.urgent_orders, previous.urgent_orders),
          waiting_approval: calculateTrend(current.waiting_approval, previous.waiting_approval),
          revenue: calculateTrend(current.total_revenue, previous.total_revenue),
          avg_hours: calculateTrend(current.avg_completion_hours, previous.avg_completion_hours)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw error;
    }
  }

  // Dados para gráficos
  static async getChartsData() {
    // Gráfico de OS por mês (últimos 6 meses)
    const ordersPerMonthQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon/YY') as month_label,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress
      FROM service_orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    // Gráfico de receita por mês (últimos 6 meses)
    const revenuePerMonthQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon/YY') as month_label,
        COALESCE(SUM(final_cost), 0) as revenue,
        COUNT(*) as orders_count
      FROM service_orders 
      WHERE status = 'completed'
        AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    // Gráfico de OS por status (mês atual)
    const ordersByStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM service_orders 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY status
      ORDER BY count DESC
    `;

    // Gráfico de OS por prioridade (mês atual)
    const ordersByPriorityQuery = `
      SELECT 
        priority,
        COUNT(*) as count
      FROM service_orders 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END
    `;

    try {
      const [ordersPerMonth, revenuePerMonth, ordersByStatus, ordersByPriority] = await Promise.all([
        db.query(ordersPerMonthQuery),
        db.query(revenuePerMonthQuery),
        db.query(ordersByStatusQuery),
        db.query(ordersByPriorityQuery)
      ]);

      return {
        ordersPerMonth: ordersPerMonth.rows,
        revenuePerMonth: revenuePerMonth.rows,
        ordersByStatus: ordersByStatus.rows,
        ordersByPriority: ordersByPriority.rows
      };
    } catch (error) {
      console.error('Erro ao buscar dados de gráficos:', error);
      throw error;
    }
  }

  // Tendências detalhadas
  static async getTrends() {
    const trendsQuery = `
      WITH current_month AS (
        SELECT 
          COUNT(*) as orders,
          COALESCE(SUM(final_cost), 0) as revenue,
          COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 0) as avg_hours
        FROM service_orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      previous_month AS (
        SELECT 
          COUNT(*) as orders,
          COALESCE(SUM(final_cost), 0) as revenue,
          COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 0) as avg_hours
        FROM service_orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      )
      SELECT 
        cm.orders as current_orders,
        pm.orders as previous_orders,
        cm.revenue as current_revenue,
        pm.revenue as previous_revenue,
        cm.avg_hours as current_avg_hours,
        pm.avg_hours as previous_avg_hours
      FROM current_month cm, previous_month pm
    `;

    try {
      const result = await db.query(trendsQuery);
      const data = result.rows[0] || {};

      const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 10) / 10;
      };

      return {
        orders: {
          current: parseInt(data.current_orders) || 0,
          previous: parseInt(data.previous_orders) || 0,
          change: calculateChange(data.current_orders, data.previous_orders)
        },
        revenue: {
          current: parseFloat(data.current_revenue) || 0,
          previous: parseFloat(data.previous_revenue) || 0,
          change: calculateChange(data.current_revenue, data.previous_revenue)
        },
        avgHours: {
          current: Math.round(parseFloat(data.current_avg_hours) || 0),
          previous: Math.round(parseFloat(data.previous_avg_hours) || 0),
          change: calculateChange(data.current_avg_hours, data.previous_avg_hours)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
      throw error;
    }
  }

  // Performance dos técnicos
  static async getTechnicianPerformance() {
    const query = `
      SELECT 
        u.name as technician_name,
        COUNT(so.id) as completed_orders,
        COALESCE(AVG(so.final_cost), 0) as avg_ticket,
        COALESCE(SUM(so.final_cost), 0) as total_revenue,
        ROUND(
          AVG(EXTRACT(EPOCH FROM (so.updated_at - so.created_at)) / 86400), 
          2
        ) as avg_completion_days
      FROM service_orders so
      LEFT JOIN users u ON so.technician_id = u.id
      WHERE so.status = 'completed'
        AND so.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY u.id, u.name
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  // Métricas de receita detalhadas
  static async getRevenueMetrics() {
    const query = `
      SELECT 
        COALESCE(SUM(final_cost) FILTER (WHERE created_at >= DATE_TRUNC('day', CURRENT_DATE)), 0) as today,
        COALESCE(SUM(final_cost) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)), 0) as this_week,
        COALESCE(SUM(final_cost) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)), 0) as this_month,
        COALESCE(SUM(final_cost) FILTER (WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)), 0) as this_year,
        COALESCE(AVG(final_cost), 0) as average_ticket,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count
      FROM service_orders
      WHERE status = 'completed'
    `;

    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Metrics;
