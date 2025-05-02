# Dashboard de Vendas - Aplicação Completa

Este repositório contém o código-fonte para uma aplicação de dashboard de vendas full-stack, incluindo um backend Node.js/TypeScript com SQL Server e um frontend Next.js/React.

## Funcionalidades

*   **Backend:**
    *   API RESTful com Express.js e TypeScript.
    *   ORM com TypeORM para interação com SQL Server.
    *   Autenticação JWT e autorização baseada em papéis (RBAC).
    *   Row-Level Security (RLS) implementado no SQL Server para segurança de dados.
    *   WebSockets (Socket.IO) para atualizações em tempo real.
    *   Estrutura organizada (Services, Controllers, Routes, Entities).
*   **Frontend:**
    *   Interface interativa com Next.js (App Router) e React/TypeScript.
    *   Estilização com Tailwind CSS e componentes shadcn/ui.
    *   Visualização de dados com Recharts.
    *   Gerenciamento de estado de autenticação.
    *   Proteção de rotas.
    *   Tabela de dados interativa (paginação, ordenação, busca) com TanStack Table.
    *   Notificações em tempo real via WebSocket.
    *   Componentes reutilizáveis (KPI Cards, Date Picker, Charts).
*   **Banco de Dados:**
    *   Schema SQL Server com tabelas para usuários, clientes, produtos, pedidos, etc.
    *   Implementação de RLS para restringir o acesso aos dados com base no usuário logado.
    *   Stored Procedures e Views para otimizar consultas.
    *   Script de seed de dados para ambiente de desenvolvimento.

## Estrutura do Projeto

```
/sales-dashboard-app
├── backend/
│   ├── src/
│   ├── config/
│   ├── entities/
│   ├── migrations/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── sql/          # Scripts SQL (schema, RLS, seed)
│   ├── .env          # Variáveis de ambiente (backend)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/      # Páginas e layouts (App Router)
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── context/    # Contextos React (Auth, Notifications)
│   │   └── lib/      # Utilitários (apiClient, socketClient)
│   ├── .env.local    # Variáveis de ambiente (frontend)
│   ├── package.json
│   └── tsconfig.json
├── todo.md           # Checklist de desenvolvimento
└── README.md         # Este arquivo
```

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

*   Node.js (v20 ou superior recomendado)
*   npm (geralmente vem com Node.js) ou pnpm (usado no frontend)
*   SQL Server (Instância local, Docker ou serviço de nuvem)
*   Um cliente SQL (ex: Azure Data Studio, DBeaver, SSMS) para executar os scripts SQL.

### Backend

1.  **Navegue até a pasta backend:**
    ```bash
    cd backend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    *   Copie ou renomeie `.env.example` (se existir) para `.env`.
    *   Edite o arquivo `.env` com as credenciais do seu banco de dados SQL Server e um segredo JWT:
        ```dotenv
        DB_HOST=localhost
        DB_PORT=1433
        DB_USERNAME=seu_usuario_sql
        DB_PASSWORD=sua_senha_sql
        DB_DATABASE=SalesDashboardDB # Ou o nome do seu banco
        DB_OPTIONS_TRUSTSERVERCERTIFICATE=true # Ajuste conforme necessário

        JWT_SECRET=seu_segredo_super_secreto_aqui # Troque por um segredo forte
        JWT_EXPIRES_IN=1h

        PORT=3001 # Porta para o servidor backend
        ```
4.  **Configure o Banco de Dados:**
    *   Crie um banco de dados no seu SQL Server (ex: `SalesDashboardDB`).
    *   Execute os scripts SQL localizados na pasta `backend/sql/` na seguinte ordem usando seu cliente SQL:
        1.  `001_create_tables.sql` (Cria as tabelas)
        2.  `002_implement_rls.sql` (Implementa as funções e políticas de RLS)
        3.  `003_create_views_procs.sql` (Cria views e procedures)
        4.  `004_seed_data.sql` (Popula o banco com dados de exemplo)
5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O backend estará rodando em `http://localhost:3001` (ou a porta definida em `.env`).

### Frontend

1.  **Navegue até a pasta frontend:**
    ```bash
    cd ../frontend
    ```
2.  **Instale as dependências (usando pnpm):**
    *   Se não tiver pnpm, instale globalmente: `npm install -g pnpm`
    *   Instale as dependências do projeto:
        ```bash
        pnpm install
        ```
3.  **Configure as variáveis de ambiente:**
    *   Verifique o arquivo `.env.local`.
    *   Certifique-se que `NEXT_PUBLIC_API_BASE_URL` aponta para a URL do seu backend (ex: `http://localhost:3001/api`).
    *   Certifique-se que `NEXT_PUBLIC_WS_URL` aponta para a URL base do seu backend (ex: `http://localhost:3001`).
        ```dotenv
        NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
        NEXT_PUBLIC_WS_URL=http://localhost:3001
        ```
4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    pnpm dev
    ```
    O frontend estará rodando em `http://localhost:3000`.

5.  **Acesse a aplicação:** Abra `http://localhost:3000` no seu navegador.
    *   Use as credenciais do usuário seed (ver `004_seed_data.sql`) para fazer login (ex: admin@example.com / password123).

## Instruções de Deploy

### Backend (Node.js/Express)

O backend pode ser implantado em várias plataformas que suportam Node.js (Azure App Service, AWS Elastic Beanstalk, Google App Engine, Heroku, Render, etc.).

**Passos Gerais:**

1.  **Build:** Compile o TypeScript para JavaScript:
    ```bash
    cd backend
    npm run build
    ```
    Isso criará uma pasta `dist/` com o código JavaScript transpilado.
2.  **Dependências de Produção:** Certifique-se de que apenas as dependências de produção estão instaladas ou empacotadas.
3.  **Banco de Dados:** Provisione um banco de dados SQL Server na nuvem (Azure SQL Database, AWS RDS, Google Cloud SQL).
4.  **Variáveis de Ambiente:** Configure as variáveis de ambiente na plataforma de hospedagem (credenciais do DB de produção, `JWT_SECRET`, `PORT`, `NODE_ENV=production`).
5.  **Execução:** Configure a plataforma para executar o comando `node dist/server.js` (ou o ponto de entrada definido no seu `package.json`).
6.  **Scripts SQL:** Execute os scripts SQL (exceto `004_seed_data.sql`, a menos que desejado) no banco de dados de produção.

**Exemplo (Azure App Service):**

*   Crie um App Service no Azure configurado para Node.js.
*   Implante o código (via Git, Zip Deploy, etc.), incluindo a pasta `dist/` e `node_modules` (ou instale no Azure).
*   Configure as variáveis de ambiente na seção "Configuration" -> "Application settings".
*   Configure a conexão com o Azure SQL Database.
*   Defina o comando de inicialização (Startup Command) se necessário.

### Frontend (Next.js)

O frontend Next.js é ideal para plataformas como Vercel (dos criadores do Next.js), Netlify, Azure Static Web Apps, AWS Amplify.

**Passos Gerais:**

1.  **Build:** Gere a versão estática/otimizada do site:
    ```bash
    cd frontend
    pnpm build
    ```
    Isso criará uma pasta `.next/` (ou `out/` para exportação estática, se configurado).
2.  **Variáveis de Ambiente:** Configure as variáveis de ambiente **públicas** (`NEXT_PUBLIC_*`) na plataforma de hospedagem. `NEXT_PUBLIC_API_BASE_URL` e `NEXT_PUBLIC_WS_URL` devem apontar para a URL **pública** do seu backend implantado.
3.  **Deploy:**
    *   **Vercel/Netlify:** Conecte seu repositório Git. A plataforma geralmente detecta Next.js e configura o build e deploy automaticamente.
    *   **Azure Static Web Apps:** Configure a tarefa de build para executar `pnpm install && pnpm build` e aponte para a pasta de saída correta (`.next`). Configure a URL da API backend nas configurações do SWA.

## Considerações Adicionais

*   **Segurança:** Use segredos fortes para JWT e senhas de banco de dados. Configure CORS adequadamente no backend. Considere medidas adicionais como rate limiting.
*   **RLS:** A implementação de RLS depende da correta configuração do `SESSION_CONTEXT` no backend. Certifique-se de que isso está funcionando corretamente no seu ambiente de produção.
*   **Testes:** Adicionar testes unitários e de integração é crucial para garantir a qualidade e a manutenibilidade.
*   **Escalabilidade:** Considere estratégias de cache, otimização de banco de dados e balanceamento de carga para ambientes de produção com alto tráfego.

