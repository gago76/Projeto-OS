const { Pool } = require('pg');
require('dotenv').config();

// Configuração Inteligente:
// 1. Se existir DATABASE_URL (Render/Produção), usa ela.
// 2. Se não, usa as variáveis individuais (Local/Desenvolvimento).
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Obrigatório para o Render aceitar a conexão
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'service_orders',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
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