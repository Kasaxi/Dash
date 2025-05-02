# Todo - Dashboard de Vendas Full-Stack

## Fase 1: Configuração e Estrutura (Plano 003-004)

- [x] 003.1: Instalar dependências globais (se necessário - verificar Node/npm).
- [x] 004.1: Criar arquivo `todo.md`.
- [x] 004.2: Inicializar projeto backend (npm init).
- [x] 004.3: Instalar dependências do backend (Express, TypeScript, TypeORM, mssql, etc.).
- [x] 004.4: Configurar TypeScript no backend (`tsconfig.json`).
- [x] 004.5: Criar estrutura de pastas básica do backend (src, config, entities, migrations, services, controllers, routes, sql).
- [x] 004.6: Utilizar `create_nextjs_app` para criar o projeto frontend.
- [x] 004.7: Instalar dependências adicionais do frontend (axios, date-fns, recharts/chart.js, etc.).

## Fase 2: Banco de Dados (Plano 005)

- [x] 005.1: Definir schema SQL Server (Tabelas: users, roles, customers, products, orders, order_items, sales_targets).
- [ ] 005.2: Criar scripts de migração T-SQL.
- [x] 005.3: Implementar Row-Level Security (RLS) - T-SQL.
- [x] 005.4: Criar Stored Procedures e Views para consultas - T-SQL.
- [x] 005.5: Criar script de seed de dados T-SQL.
- [x] 005.6: Salvar scripts SQL em `/home/ubuntu/sales-dashboard-app/backend/sql`.

## Fase 3: Backend (Plano 006-007)

- [x] 006.1: Configurar conexão com SQL Server via TypeORM.
- [x] 006.2: Definir entidades TypeORM correspondentes ao schema DB.
- [x] 006.3: Implementar lógica de negócios (Services).
- [x] 006.4: Criar rotas RESTful (Controllers/Routes) para CRUDs e relatórios.
- [x] 007.1: Implementar autenticação JWT (geração, validação).
- [ ] 007.2: Implementar autenticação OAuth2 (e-mail/senha + provedores externos - *Nota: Provedores externos podem exigir configuração extra*).
- [x] 007.3: Implementar gerenciamento de papéis (roles) e controle de acesso baseado em papéis (middlewares).
- [ ] 006.5: Implementar tratamento de erros global.
- [ ] 006.6: Configurar WebSocket (socket.io ou similar) para notificações.
- [ ] 006.7: Escrever testes básicos (unitários/integração) para rotas de dados.

## Fase 4: Frontend (Plano 008-009)

- [x] 008.1: Configurar conexão com API backend (axios/fetch).
- [x] 008.2: Configurar conexão WebSocket.
- [x] 008.3: Implementar fluxo de autenticação (login, registro, OAuth callbacks).
- [x] 008.4: Implementar proteção de rotas baseada em autenticação e papéis.
- [x] 008.5: Configurar Tailwind CSS e tema visual.
- [x] 009.1: Criar layout principal do dashboard.
- [x] 009.2: Implementar componente de filtro de data.
- [x] 009.3: Implementar componentes de Cartões de KPI.
- [x] 009.4: Implementar Gráficos (Recharts/Chart.js): Série temporal, Top produtos, Vendas por região, Ranking de vendedores.
- [x] 009.5: Implementar Tabela de Pedidos (paginada, ordenável, pesquisável).
- [x] 009.6: Implementar Indicadores de Metas vs Realizado.
- [x] 009.7: Implementar sistema de Alertas e Notificações (via WebSocket).
- [x] 008.6: Configurar variáveis de ambiente (`.env.local`).

## Fase 5: Tempo Real e Finalização (Plano 010-013)

- [x] 010.1: Conectar backend e frontend via WebSocket para atualizações em tempo real (KPIs, gráficos).
- [x] 011.1: Escrever `README.md` com instruções de setup, configuração e deploy.
- [x] 011.2: Incluir instruções de deploy para Backend (Azure/AWS/GCP) e Frontend (Vercel/Netlify/Azure Static Web Apps).
- [ ] 012.1: Realizar testes manuais completos da aplicação.
- [ ] 012.2: Validar RLS e controle de acesso.
- [ ] 012.3: Verificar responsividade e compatibilidade entre navegadores.
- [ ] 013.1: Empacotar código-fonte (backend, frontend, scripts SQL).
- [ ] 013.2: Enviar pacote e documentação para o usuário.
