-- 003_create_views_procs.sql
-- Script para criar Views e Stored Procedures para consultas comuns

-- View: Vendas Diárias (Daily Sales)
-- Agrega o total de vendas por dia.
IF OBJECT_ID(N'dbo.vw_daily_sales', N'V') IS NOT NULL
    DROP VIEW dbo.vw_daily_sales;
GO

CREATE VIEW dbo.vw_daily_sales AS
SELECT
    CAST(order_date AS DATE) AS sale_date,
    SUM(total_amount) AS daily_total_sales,
    COUNT(order_id) AS daily_order_count
FROM
    dbo.orders
-- WHERE status != 'Cancelled' -- Opcional: Excluir pedidos cancelados da soma
GROUP BY
    CAST(order_date AS DATE);
GO

PRINT 'View vw_daily_sales criada/atualizada.';

-- View: Vendas Mensais (Monthly Sales)
-- Agrega o total de vendas por mês.
IF OBJECT_ID(N'dbo.vw_monthly_sales', N'V') IS NOT NULL
    DROP VIEW dbo.vw_monthly_sales;
GO

CREATE VIEW dbo.vw_monthly_sales AS
SELECT
    FORMAT(order_date, 'yyyy-MM') AS sale_month, -- Formato AAAA-MM
    SUM(total_amount) AS monthly_total_sales,
    COUNT(order_id) AS monthly_order_count
FROM
    dbo.orders
-- WHERE status != 'Cancelled'
GROUP BY
    FORMAT(order_date, 'yyyy-MM');
GO

PRINT 'View vw_monthly_sales criada/atualizada.';

-- View: Vendas Anuais (Year-to-Date Sales)
-- Agrega o total de vendas por ano.
IF OBJECT_ID(N'dbo.vw_ytd_sales', N'V') IS NOT NULL
    DROP VIEW dbo.vw_ytd_sales;
GO

CREATE VIEW dbo.vw_ytd_sales AS
SELECT
    YEAR(order_date) AS sale_year,
    SUM(total_amount) AS ytd_total_sales,
    COUNT(order_id) AS ytd_order_count
FROM
    dbo.orders
-- WHERE status != 'Cancelled'
GROUP BY
    YEAR(order_date);
GO

PRINT 'View vw_ytd_sales criada/atualizada.';

-- View: Top Produtos por Receita (Top Products by Revenue)
IF OBJECT_ID(N'dbo.vw_top_products_revenue', N'V') IS NOT NULL
    DROP VIEW dbo.vw_top_products_revenue;
GO

CREATE VIEW dbo.vw_top_products_revenue AS
SELECT
    p.product_id,
    p.product_name,
    SUM(oi.total_price) AS total_revenue,
    SUM(oi.quantity) AS total_quantity_sold
FROM
    dbo.order_items oi
JOIN
    dbo.products p ON oi.product_id = p.product_id
JOIN
    dbo.orders o ON oi.order_id = o.order_id
-- WHERE o.status != 'Cancelled'
GROUP BY
    p.product_id, p.product_name;
GO

PRINT 'View vw_top_products_revenue criada/atualizada.';

-- View: Vendas por Região (Sales by Region)
IF OBJECT_ID(N'dbo.vw_sales_by_region', N'V') IS NOT NULL
    DROP VIEW dbo.vw_sales_by_region;
GO

CREATE VIEW dbo.vw_sales_by_region AS
SELECT
    c.region,
    SUM(o.total_amount) AS total_sales_in_region,
    COUNT(o.order_id) AS order_count_in_region
FROM
    dbo.orders o
JOIN
    dbo.customers c ON o.customer_id = c.customer_id
-- WHERE o.status != 'Cancelled'
GROUP BY
    c.region;
GO

PRINT 'View vw_sales_by_region criada/atualizada.';

-- View: Performance de Vendedores (Sales Person Performance)
-- Inclui vendas totais e comparação com metas (se houver)
IF OBJECT_ID(N'dbo.vw_sales_person_performance', N'V') IS NOT NULL
    DROP VIEW dbo.vw_sales_person_performance;
GO

CREATE VIEW dbo.vw_sales_person_performance AS
SELECT
    u.user_id AS sales_person_id,
    u.full_name AS sales_person_name,
    u.username AS sales_person_username,
    FORMAT(o.order_date, 'yyyy-MM') AS sale_month,
    SUM(o.total_amount) AS total_sales_amount,
    COUNT(o.order_id) AS total_orders,
    AVG(o.total_amount) AS average_order_value,
    (SELECT st.target_amount
     FROM dbo.sales_targets st
     WHERE st.user_id = u.user_id
       AND st.target_month = DATEFROMPARTS(YEAR(o.order_date), MONTH(o.order_date), 1)) AS monthly_target
FROM
    dbo.orders o
JOIN
    dbo.users u ON o.sales_person_id = u.user_id
-- WHERE o.status != 'Cancelled'
GROUP BY
    u.user_id, u.full_name, u.username, FORMAT(o.order_date, 'yyyy-MM'), YEAR(o.order_date), MONTH(o.order_date);
GO

PRINT 'View vw_sales_person_performance criada/atualizada.';

-- Stored Procedure: Obter Detalhes do Pedido (Get Order Details)
-- Retorna detalhes de um pedido específico, incluindo itens.
IF OBJECT_ID(N'dbo.sp_get_order_details', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_get_order_details;
GO

CREATE PROCEDURE dbo.sp_get_order_details
    @order_id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Verifica se o usuário tem permissão (RLS já deve estar ativa na tabela orders)
    IF NOT EXISTS (SELECT 1 FROM dbo.orders WHERE order_id = @order_id)
    BEGIN
        -- Lança um erro ou retorna um conjunto vazio se o pedido não existe ou não é acessível
        RAISERROR('Pedido não encontrado ou acesso negado.', 16, 1);
        RETURN;
    END

    -- Detalhes do Pedido
    SELECT
        o.order_id,
        o.order_date,
        o.status,
        o.total_amount,
        c.customer_id,
        c.customer_name,
        c.email AS customer_email,
        c.region AS customer_region,
        u.user_id AS sales_person_id,
        u.full_name AS sales_person_name
    FROM
        dbo.orders o
    JOIN
        dbo.customers c ON o.customer_id = c.customer_id
    LEFT JOIN -- Usar LEFT JOIN caso sales_person_id seja NULL
        dbo.users u ON o.sales_person_id = u.user_id
    WHERE
        o.order_id = @order_id;

    -- Itens do Pedido
    SELECT
        oi.order_item_id,
        oi.product_id,
        p.product_name,
        p.sku,
        oi.quantity,
        oi.unit_price,
        oi.total_price
    FROM
        dbo.order_items oi
    JOIN
        dbo.products p ON oi.product_id = p.product_id
    WHERE
        oi.order_id = @order_id;
END;
GO

PRINT 'Stored Procedure sp_get_order_details criada/atualizada.';

-- Stored Procedure: Obter Vendas e Metas por Vendedor e Mês
-- Usado para o gráfico de Metas vs Realizado
IF OBJECT_ID(N'dbo.sp_get_sales_vs_target', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_get_sales_vs_target;
GO

CREATE PROCEDURE dbo.sp_get_sales_vs_target
    @target_month DATE -- Primeiro dia do mês (ex: '2024-05-01')
AS
BEGIN
    SET NOCOUNT ON;

    -- RLS na tabela sales_targets e orders já deve filtrar os dados acessíveis

    SELECT
        u.user_id,
        u.full_name,
        u.username,
        ISNULL(SUM(o.total_amount), 0) AS total_sales,
        ISNULL(st.target_amount, 0) AS target_amount,
        @target_month AS month_period
    FROM
        dbo.users u
    LEFT JOIN
        dbo.orders o ON u.user_id = o.sales_person_id
                     AND o.order_date >= @target_month
                     AND o.order_date < DATEADD(MONTH, 1, @target_month)
                     -- AND o.status != 'Cancelled'
    LEFT JOIN
        dbo.sales_targets st ON u.user_id = st.user_id
                             AND st.target_month = @target_month
    WHERE
        u.role_id IN (SELECT role_id FROM dbo.roles WHERE role_name IN ('sales_manager', 'admin')) -- Ou ajuste conforme a necessidade de quem vê as metas
        OR u.user_id = CAST(SESSION_CONTEXT(N'user_id') AS INT) -- Vendedor vê a própria meta
    GROUP BY
        u.user_id, u.full_name, u.username, st.target_amount
    ORDER BY
        u.full_name;
END;
GO

PRINT 'Stored Procedure sp_get_sales_vs_target criada/atualizada.';

PRINT 'Script 003_create_views_procs.sql concluído.'

