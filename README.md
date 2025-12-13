# 🔧 Sistema de Ordem de Serviço - Premium

Sistema completo de gerenciamento de ordens de serviço com arquitetura profissional.

**Versão:** 2.0 Premium - Corrigido  
**Data:** 02/11/2025  
**Status:** ✅ Totalmente Funcional

---

## 🚀 Instalação Rápida

### Passo 1: Configurar Banco de Dados

1. Abra o **SQL Shell (psql)**
2. Execute:
```sql
CREATE DATABASE service_orders;
\c service_orders
\i 'C:/caminho/para/database/schema.sql'
```

### Passo 2: Configurar Backend

```cmd
cd backend
npm install
```

Edite o arquivo `.env` e coloque sua senha do PostgreSQL:
```env
DB_PASSWORD=SUA_SENHA_AQUI
```

Inicie o backend:
```cmd
npm run dev
```

### Passo 3: Configurar Frontend

```cmd
cd frontend
npm install
npm run dev
```

### Passo 4: Criar Usuário

Use curl ou Postman:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@sistema.com","password":"senha123","role":"admin"}'
```

### Passo 5: Acessar

Abra: **http://localhost:5173**

Login: admin@sistema.com / senha123

---

## ✅ Resultado Esperado

Ao iniciar o backend, você deve ver:

```
✅ Conectado ao PostgreSQL
🔧 CARREGANDO ROTAS...
✅ Rotas de autenticação carregadas
✅ Rotas de ordens de serviço carregadas
✅ Rotas de métricas carregadas
✅ Rotas de clientes carregadas

🚀 SISTEMA INICIADO COM SUCESSO!
```

---

## 📋 Funcionalidades

- ✅ Gerenciamento de clientes (CRUD completo)
- ✅ Gerenciamento de ordens de serviço
- ✅ Dashboard com métricas em tempo real
- ✅ Autenticação JWT
- ✅ Interface moderna com TailwindCSS
- ✅ Soft delete
- ✅ Validação de dados
- ✅ Segurança (Helmet, CORS, Rate Limiting)

---

## 🔧 Tecnologias

**Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt  
**Frontend:** React, Vite, TailwindCSS, Framer Motion

---

## 📞 Suporte

Veja o arquivo `INSTRUCOES_COMPLETAS.md` para documentação detalhada.

---

**Versão Premium - Pronto para Uso** ✅
