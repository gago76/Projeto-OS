const { Pool } = require('pg');

// REMOVIDO: O Render já carrega as variáveis em 'process.env'.
// require('dotenv').config(); 

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, 
      },
    }
  : {
      // Configuração para AMBIENTE LOCAL/DESENVOLVIMENTO
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'service_orders',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: false,
    };

const pool = new Pool(poolConfig);

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    return res;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

module.exports = { query };