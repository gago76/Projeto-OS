const db = require('../config/database');

class Client {
  static async create(clientData) {
    const { name, email, phone, address, document } = clientData;

    const query = `
      INSERT INTO clients (name, email, phone, address, document)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [name, email, phone, address, document];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM clients ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM clients WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Client;