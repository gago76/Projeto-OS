const db = require('../config/database');

class ServiceOrder {
  static async create(orderData) {
    const {
      client_id, equipment, brand, model, serial_number,
      reported_issue, estimated_cost, created_by, technician_id
    } = orderData;

    const count = await db.query('SELECT COUNT(*) FROM service_orders WHERE DATE(created_at) = CURRENT_DATE');
    const dailyCount = parseInt(count.rows[0].count) + 1;
    const number = `OS${new Date().getFullYear()}${String(dailyCount).padStart(5, '0')}`;

    const query = `
      INSERT INTO service_orders 
      (number, client_id, equipment, brand, model, serial_number, reported_issue, estimated_cost, created_by, technician_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [number, client_id, equipment, brand, model, serial_number, reported_issue, estimated_cost, created_by, technician_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT so.*, c.name as client_name, c.phone as client_phone, c.email as client_email
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE service_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT so.*, c.name as client_name 
      FROM service_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND so.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.technician_id) {
      query += ` AND so.technician_id = $${paramCount}`;
      values.push(filters.technician_id);
      paramCount++;
    }

    query += ' ORDER BY so.created_at DESC';
    const result = await db.query(query, values);
    return result.rows;
  }
}

module.exports = ServiceOrder;