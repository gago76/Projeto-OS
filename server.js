const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// CORREÇÃO ESSENCIAL PARA O RENDER/VERCEL/PROXIES
// Permite que o Express identifique IPs reais por trás do proxy.
app.set('trust proxy', 1); 

// Configurações de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());

// RATE LIMITING
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 1000, // Limite de 1000 requisições por IP nesse tempo
    message: { error: 'Muitas requisições, aguarde um momento.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Carregar rotas com mensagens
console.log('🔧 CARREGANDO ROTAS...');

try {
    // CORREÇÃO DE REFERÊNCIA DE ROTA: aponta para a nova pasta 'api_src'
    const authRoutes = require('./api_src/routes/auth'); 
    app.use('/api/auth', authRoutes);
    console.log('✅ Rotas de autenticação carregadas');
} catch (error) {
    console.log('❌ Rotas de autenticação não carregadas');
    console.error('   Erro:', error.message);
}

try {
    // CORREÇÃO DE REFERÊNCIA DE ROTA: aponta para a nova pasta 'api_src'
    const serviceOrderRoutes = require('./api_src/routes/serviceOrders');
    app.use('/api/service-orders', serviceOrderRoutes);
    console.log('✅ Rotas de ordens de serviço carregadas');
} catch (error) {
    console.log('❌ Rotas de ordens de serviço não carregadas');
    console.error('   Erro:', error.message);
}

try {
    // CORREÇÃO DE REFERÊNCIA DE ROTA: aponta para a nova pasta 'api_src'
    const metricsRoutes = require('./api_src/routes/metrics');
    app.use('/api/metrics', metricsRoutes);
    console.log('✅ Rotas de métricas carregadas');
} catch (error) {
    console.log('❌ Rotas de métricas não carregadas');
    console.error('   Erro:', error.message);
}

try {
    // CORREÇÃO DE REFERÊNCIA DE ROTA: aponta para a nova pasta 'api_src'
    const clientRoutes = require('./api_src/routes/clients');
    app.use('/api/clients', clientRoutes);
    console.log('✅ Rotas de clientes carregadas');
} catch (error) {
    console.log('❌ Rotas de clientes não carregadas');
    console.error('   Erro:', error.message);
    console.error('   Stack:', error.stack);
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Sistema de Ordens de Serviço funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bem-vindo ao Sistema de Ordens de Serviço',
        version: '1.0.0',
        endpoints: {
            clients: '/api/clients',
            service_orders: '/api/service-orders',
            metrics: '/api/metrics',
            health: '/health'
        }
    });
});

// EXPORTAÇÃO PARA A VERCEL (Mantida na Raiz)
module.exports = app;