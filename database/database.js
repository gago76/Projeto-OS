const { Pool } = require('pg');
require('dotenv').config();

// Se não houver DATABASE_URL, o sistema deve parar para evitar usar localhost.
if (!process.env.DATABASE_URL) {
  console.error('ERRO FATAL: DATABASE_URL não configurada. Impossível conectar ao banco em produção.');
  // Em produção, isso garante que o servidor não ligue e evite o erro 500.
  // Você pode comentar a linha abaixo se quiser que ele tente rodar localmente.
  // process.exit(1);
}

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
      // Se não for produção, não usa SSL
      ssl: false,
    };

const pool = new Pool(poolConfig);
// ... (o restante do arquivo continua o mesmo)