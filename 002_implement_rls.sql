-- 002_implement_rls.sql
-- Script para implementar Row-Level Security (RLS)

-- Pré-requisito: A aplicação backend DEVE definir o user_id e role_name no SESSION_CONTEXT
-- Exemplo: EXEC sp_set_session_context @key = N'user_id', @value = <actual_user_id>;
-- Exemplo: EXEC sp_set_session_context @key = N'role_name', @value = 
'<actual_role_name>';

-- Função de Predicado para RLS na tabela orders
-- Regras:
-- 1. Admin pode ver todos os pedidos.
-- 2. Sales Manager pode ver todos os pedidos (simplificado, poderia ser restrito por região/equipe).
-- 3. Outros usuários (incluindo vendedores) só podem ver seus próprios pedidos.
IF OBJECT_ID(N'dbo.fn_rls_orders_predicate', N'IF') IS NOT NULL
    DROP FUNCTION dbo.fn_rls_orders_predicate;
GO

CREATE FUNCTION dbo.fn_rls_orders_predicate(@sales_person_id INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS fn_accessResult
WHERE
    -- Admins e Sales Managers podem ver tudo
    (IS_MEMBER(
'db_owner
') = 1 OR CAST(SESSION_CONTEXT(N'role_name') AS VARCHAR(50)) IN (
'admin
', 
'sales_manager
'))
    -- Outros usuários só veem seus próprios pedidos
    OR (@sales_person_id = CAST(SESSION_CONTEXT(N'user_id') AS INT));
GO

PRINT 
'Função de predicado fn_rls_orders_predicate criada/atualizada.
';

-- Política de Segurança para a tabela orders
IF EXISTS (SELECT * FROM sys.security_policies WHERE name = N'sec_policy_orders')
    DROP SECURITY POLICY sec_policy_orders;
GO

CREATE SECURITY POLICY sec_policy_orders
ADD FILTER PREDICATE dbo.fn_rls_orders_predicate(sales_person_id) ON dbo.orders
WITH (STATE = ON);
GO

PRINT 
'Política de segurança sec_policy_orders criada/atualizada para dbo.orders.
';

-- Função de Predicado para RLS na tabela sales_targets
-- Regras:
-- 1. Admin pode ver todas as metas.
-- 2. Sales Manager pode ver todas as metas.
-- 3. Outros usuários (vendedores) só podem ver suas próprias metas.
IF OBJECT_ID(N'dbo.fn_rls_sales_targets_predicate', N'IF') IS NOT NULL
    DROP FUNCTION dbo.fn_rls_sales_targets_predicate;
GO

CREATE FUNCTION dbo.fn_rls_sales_targets_predicate(@user_id INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS fn_accessResult
WHERE
    -- Admins e Sales Managers podem ver tudo
    (IS_MEMBER(
'db_owner
') = 1 OR CAST(SESSION_CONTEXT(N'role_name') AS VARCHAR(50)) IN (
'admin
', 
'sales_manager
'))
    -- Outros usuários só veem suas próprias metas
    OR (@user_id = CAST(SESSION_CONTEXT(N'user_id') AS INT));
GO

PRINT 
'Função de predicado fn_rls_sales_targets_predicate criada/atualizada.
';

-- Política de Segurança para a tabela sales_targets
IF EXISTS (SELECT * FROM sys.security_policies WHERE name = N'sec_policy_sales_targets')
    DROP SECURITY POLICY sec_policy_sales_targets;
GO

CREATE SECURITY POLICY sec_policy_sales_targets
ADD FILTER PREDICATE dbo.fn_rls_sales_targets_predicate(user_id) ON dbo.sales_targets
WITH (STATE = ON);
GO

PRINT 
'Política de segurança sec_policy_sales_targets criada/atualizada para dbo.sales_targets.
';

-- Considerações adicionais para RLS:
-- - Poderia ser aplicada a outras tabelas como `customers` ou `products` se necessário.
-- - A lógica do predicado pode ser ajustada para regras mais complexas (ex: Sales Manager vê apenas sua equipe).
-- - É crucial que o backend configure corretamente `SESSION_CONTEXT`.

PRINT 
'Script 002_implement_rls.sql concluído.
'

