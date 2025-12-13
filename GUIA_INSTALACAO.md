# 🚀 Guia de Instalação - Sistema de Ordens de Serviço Premium

## Requisitos do Sistema

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados em seu computador:

### Software Necessário

**Node.js** versão 16.x ou superior é fundamental para executar tanto o backend quanto o frontend do sistema. Você pode baixar a versão LTS (Long Term Support) diretamente do site oficial em nodejs.org, que já inclui o npm (Node Package Manager) necessário para gerenciar as dependências do projeto.

**PostgreSQL** versão 12.x ou superior serve como banco de dados relacional do sistema. Recomendamos baixar a versão mais recente do site postgresql.org, que inclui o pgAdmin 4 para gerenciamento visual do banco de dados.

**Git** (opcional) facilita o controle de versão e atualizações futuras do sistema. Pode ser baixado em git-scm.com caso você deseje gerenciar o código com controle de versão.

---

## Passo 1: Configurar o Banco de Dados

### Criar o Banco de Dados

Abra o **SQL Shell (psql)** que foi instalado junto com o PostgreSQL. Você pode encontrá-lo no menu Iniciar do Windows digitando "SQL Shell". Ao abrir, pressione Enter para aceitar os valores padrão de servidor, banco de dados, porta e usuário. Digite sua senha do PostgreSQL quando solicitado.

Dentro do SQL Shell, execute o comando para criar o banco de dados:

```sql
CREATE DATABASE service_orders;
```

Você deve ver a mensagem "CREATE DATABASE" confirmando a criação. Em seguida, conecte-se ao banco recém-criado:

```sql
\c service_orders
```

### Executar o Schema

Localize o arquivo `schema.sql` ou `schema-premium.sql` na pasta `database` do projeto. Abra este arquivo com o Bloco de Notas, selecione todo o conteúdo (Ctrl+A) e copie (Ctrl+C). Volte ao SQL Shell e cole o conteúdo (clique com botão direito). Pressione Enter para executar.

O schema criará todas as tabelas necessárias incluindo users, clients, service_orders e outras tabelas auxiliares. Um usuário administrador padrão será criado automaticamente com email `admin@sistema.com` e senha `Admin@123`.

---

## Passo 2: Configurar o Backend

### Instalar Dependências

Abra o **Prompt de Comando** ou **PowerShell** e navegue até a pasta do backend:

```cmd
cd caminho\para\service-order-system\backend
```

Instale todas as dependências necessárias executando:

```cmd
npm install
```

Este processo pode levar alguns minutos dependendo da velocidade da sua internet. O npm baixará e instalará todas as bibliotecas necessárias listadas no arquivo `package.json`.

### Configurar Variáveis de Ambiente

Na pasta backend, localize o arquivo `.env`. Se não existir, crie um novo arquivo com este nome usando o Bloco de Notas. Configure as seguintes variáveis:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=service_orders
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgresql
JWT_SECRET=seu_secret_jwt_aqui
PORT=3001
```

**Importante:** Substitua `sua_senha_do_postgresql` pela senha que você definiu durante a instalação do PostgreSQL. O `JWT_SECRET` pode ser qualquer string longa e aleatória, como `meuSistemaDeOS2025SecretKey`.

### Iniciar o Backend

Com as dependências instaladas e o `.env` configurado, inicie o servidor backend:

```cmd
npm run dev
```

Você deve ver mensagens indicando que o servidor está rodando na porta 3001 e que as rotas foram carregadas com sucesso. Mantenha esta janela do Prompt de Comando aberta enquanto usa o sistema.

---

## Passo 3: Configurar o Frontend

### Instalar Dependências

Abra uma **nova janela** do Prompt de Comando (mantenha a do backend aberta) e navegue até a pasta do frontend:

```cmd
cd caminho\para\service-order-system\frontend
```

Instale as dependências:

```cmd
npm install
```

Assim como no backend, este processo baixará todas as bibliotecas necessárias para o frontend funcionar, incluindo React, React Router, Tailwind CSS e outras.

### Iniciar o Frontend

Após a instalação das dependências, inicie o servidor de desenvolvimento:

```cmd
npm run dev
```

O Vite (servidor de desenvolvimento) iniciará e mostrará a URL local, geralmente `http://localhost:5173`. Mantenha esta janela também aberta.

---

## Passo 4: Acessar o Sistema

### Fazer o Primeiro Login

Abra seu navegador (recomendamos Chrome, Edge ou Firefox) e acesse:

```
http://localhost:5173
```

Você verá a tela de login do sistema. Use as credenciais padrão:

- **Email:** admin@sistema.com
- **Senha:** Admin@123

Após o login bem-sucedido, você será redirecionado para o dashboard principal do sistema, onde poderá visualizar métricas, criar ordens de serviço e gerenciar clientes.

---

## Verificação de Funcionamento

### Backend Funcionando

O backend está funcionando corretamente quando você vê no Prompt de Comando mensagens como "Servidor rodando na porta 3001" e "Rotas carregadas". Você também pode testar acessando `http://localhost:3001/health` no navegador, que deve retornar uma mensagem JSON indicando que o sistema está OK.

### Frontend Funcionando

O frontend está funcionando quando você consegue acessar `http://localhost:5173` e ver a tela de login. Se aparecer uma tela em branco ou erro, verifique se o backend está rodando e se não há erros no console do navegador (pressione F12 para abrir).

### Banco de Dados Conectado

O banco está conectado corretamente quando você consegue fazer login e ver as métricas no dashboard. Se aparecer erro de "Credenciais inválidas" mesmo com a senha correta, verifique as configurações do `.env` no backend.

---

## Solução de Problemas Comuns

### Erro: "npm não é reconhecido"

Este erro indica que o Node.js não foi instalado corretamente ou não está no PATH do sistema. Reinstale o Node.js baixando a versão LTS do site nodejs.org e certifique-se de marcar a opção "Add to PATH" durante a instalação. Após instalar, reinicie o computador.

### Erro: "Não foi possível conectar ao banco de dados"

Verifique se o PostgreSQL está rodando. No Windows, abra o gerenciador de Serviços (Windows + R, digite `services.msc`) e procure por "postgresql". Se estiver parado, clique com botão direito e selecione "Iniciar". Verifique também se as credenciais no arquivo `.env` estão corretas.

### Erro: "Port 3001 already in use"

Isso significa que já existe outro processo usando a porta 3001. Você pode alterar a porta no arquivo `.env` do backend para outra (como 3002) ou encerrar o processo que está usando a porta 3001.

### Erro: "Credenciais inválidas" ao fazer login

Se você tem certeza que está usando as credenciais corretas (admin@sistema.com / Admin@123), o problema pode ser que o usuário não foi criado no banco. Volte ao SQL Shell, conecte ao banco `service_orders` e execute:

```sql
SELECT * FROM users;
```

Se não aparecer nenhum usuário, execute novamente a parte do schema que cria o usuário admin.

---

## Próximos Passos

Após a instalação bem-sucedida, você pode começar a usar o sistema criando seus primeiros clientes e ordens de serviço. Explore as funcionalidades do dashboard, que agora exibe métricas reais calculadas do banco de dados, incluindo tendências comparativas com o período anterior.

Para personalizar o sistema, você pode editar os arquivos de configuração, adicionar novos campos nas tabelas do banco de dados ou customizar a interface no código do frontend. Consulte a documentação técnica para mais detalhes sobre a arquitetura do sistema.

---

**Dúvidas?** Consulte o arquivo CHANGELOG.md para ver todas as funcionalidades implementadas ou entre em contato com o suporte técnico.
