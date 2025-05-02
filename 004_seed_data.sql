-- 004_seed_data.sql
-- Script para popular o banco de dados com dados de exemplo

-- Limpeza opcional (cuidado ao usar em produção!)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM sales_targets;
-- DELETE FROM users;
-- DELETE FROM roles;
-- DELETE FROM customers;
-- DELETE FROM products;
-- DBCC CHECKIDENT (
'order_items
', RESEED, 0);
-- DBCC CHECKIDENT (
'orders
', RESEED, 0);
-- DBCC CHECKIDENT (
'sales_targets
', RESEED, 0);
-- DBCC CHECKIDENT (
'users
', RESEED, 0);
-- DBCC CHECKIDENT (
'roles
', RESEED, 0);
-- DBCC CHECKIDENT (
'customers
', RESEED, 0);
-- DBCC CHECKIDENT (
'products
', RESEED, 0);
-- PRINT 
'Tabelas limpas e identidades reiniciadas (se descomentado).
';

BEGIN TRANSACTION;

-- 1. Inserir Papéis (Roles)
PRINT 
'Inserindo Roles...
';
IF NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 
'admin
') INSERT INTO roles (role_name) VALUES (
'admin
');
IF NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 
'sales_manager
') INSERT INTO roles (role_name) VALUES (
'sales_manager
');
IF NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 
'viewer
') INSERT INTO roles (role_name) VALUES (
'viewer
');
-- Adicionar um papel de vendedor para clareza
IF NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 
'sales_person
') INSERT INTO roles (role_name) VALUES (
'sales_person
');
PRINT 
'Roles inseridos.
';

-- 2. Inserir Usuários (Users)
-- Senha de exemplo: 
'password123
' (deve ser hasheada pelo backend antes de inserir)
-- O backend precisará gerar o hash. Aqui, usamos um placeholder.
PRINT 
'Inserindo Users...
';
DECLARE @AdminRoleID INT = (SELECT role_id FROM roles WHERE role_name = 
'admin
');
DECLARE @ManagerRoleID INT = (SELECT role_id FROM roles WHERE role_name = 
'sales_manager
');
DECLARE @ViewerRoleID INT = (SELECT role_id FROM roles WHERE role_name = 
'viewer
');
DECLARE @SalesPersonRoleID INT = (SELECT role_id FROM roles WHERE role_name = 
'sales_person
');

-- Senha hasheada para 
'password123
' (exemplo usando bcrypt, o backend deve gerar isso)
-- Exemplo de hash bcrypt: $2b$10$abcdefghijklmnopqrstuvwx./abcdefghijklmnopqrstuvwxyza
DECLARE @PasswordHash VARCHAR(255) = 
'$2b$10$D9yv/fG.1G7aH8.j9kL3p.oY0U8q1zX6sR7vT5bN4cI2eF1aG0hO
'; -- HASH EXEMPLO

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 
'admin_user
')
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES (
'admin_user
', 
'admin@example.com
', @PasswordHash, 
'Admin User
', @AdminRoleID);

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 
'manager_user
')
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES (
'manager_user
', 
'manager@example.com
', @PasswordHash, 
'Sales Manager
', @ManagerRoleID);

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 
'viewer_user
')
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES (
'viewer_user
', 
'viewer@example.com
', @PasswordHash, 
'Viewer User
', @ViewerRoleID);

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 
'sales_alice
')
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES (
'sales_alice
', 
'alice@example.com
', @PasswordHash, 
'Alice Smith
', @SalesPersonRoleID);

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 
'sales_bob
')
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES (
'sales_bob
', 
'bob@example.com
', @PasswordHash, 
'Bob Johnson
', @SalesPersonRoleID);
PRINT 
'Users inseridos.
';

-- 3. Inserir Clientes (Customers)
PRINT 
'Inserindo Customers...
';
IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 
'customer1@email.com
')
    INSERT INTO customers (customer_name, email, phone, address, city, region, country)
    VALUES (N
'Empresa Alpha
', 
'customer1@email.com
', 
'111-222-3333
', N
'Rua Principal, 123
', N
'São Paulo
', N
'Sudeste
', N
'Brasil
');
IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 
'customer2@email.com
')
    INSERT INTO customers (customer_name, email, phone, address, city, region, country)
    VALUES (N
'Comércio Beta
', 
'customer2@email.com
', 
'444-555-6666
', N
'Avenida Central, 456
', N
'Rio de Janeiro
', N
'Sudeste
', N
'Brasil
');
IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 
'customer3@email.com
')
    INSERT INTO customers (customer_name, email, phone, address, city, region, country)
    VALUES (N
'Indústria Gama
', 
'customer3@email.com
', 
'777-888-9999
', N
'Praça da Matriz, 789
', N
'Salvador
', N
'Nordeste
', N
'Brasil
');
PRINT 
'Customers inseridos.
';

-- 4. Inserir Produtos (Products)
PRINT 
'Inserindo Products...
';
IF NOT EXISTS (SELECT 1 FROM products WHERE sku = 
'PROD-001
')
    INSERT INTO products (product_name, description, price, sku, category)
    VALUES (N
'Laptop Pro X
', N
'Laptop de alta performance
', 7500.00, 
'PROD-001
', N
'Eletrônicos
');
IF NOT EXISTS (SELECT 1 FROM products WHERE sku = 
'PROD-002
')
    INSERT INTO products (product_name, description, price, sku, category)
    VALUES (N
'Monitor Gamer 27"
', N
'Monitor curvo para jogos
', 2200.50, 
'PROD-002
', N
'Eletrônicos
');
IF NOT EXISTS (SELECT 1 FROM products WHERE sku = 
'SERV-001
')
    INSERT INTO products (product_name, description, price, sku, category)
    VALUES (N
'Consultoria de TI (hora)
', N
'Serviço de consultoria especializada
', 350.00, 
'SERV-001
', N
'Serviços
');
IF NOT EXISTS (SELECT 1 FROM products WHERE sku = 
'SOFT-001
')
    INSERT INTO products (product_name, description, price, sku, category)
    VALUES (N
'Licença Software CRM
', N
'Licença anual de software
', 1200.00, 
'SOFT-001
', N
'Software
');
PRINT 
'Products inseridos.
';

-- 5. Inserir Pedidos (Orders) e Itens de Pedido (Order Items)
PRINT 
'Inserindo Orders e Order Items...
';
DECLARE @Cust1ID INT = (SELECT customer_id FROM customers WHERE email = 
'customer1@email.com
');
DECLARE @Cust2ID INT = (SELECT customer_id FROM customers WHERE email = 
'customer2@email.com
');
DECLARE @Cust3ID INT = (SELECT customer_id FROM customers WHERE email = 
'customer3@email.com
');
DECLARE @Prod1ID INT = (SELECT product_id FROM products WHERE sku = 
'PROD-001
');
DECLARE @Prod2ID INT = (SELECT product_id FROM products WHERE sku = 
'PROD-002
');
DECLARE @Prod3ID INT = (SELECT product_id FROM products WHERE sku = 
'SERV-001
');
DECLARE @Prod4ID INT = (SELECT product_id FROM products WHERE sku = 
'SOFT-001
');
DECLARE @SalesAliceID INT = (SELECT user_id FROM users WHERE username = 
'sales_alice
');
DECLARE @SalesBobID INT = (SELECT user_id FROM users WHERE username = 
'sales_bob
');

DECLARE @OrderID1 INT, @OrderID2 INT, @OrderID3 INT, @OrderID4 INT;
DECLARE @PriceProd1 DECIMAL(18, 2) = (SELECT price FROM products WHERE product_id = @Prod1ID);
DECLARE @PriceProd2 DECIMAL(18, 2) = (SELECT price FROM products WHERE product_id = @Prod2ID);
DECLARE @PriceProd3 DECIMAL(18, 2) = (SELECT price FROM products WHERE product_id = @Prod3ID);
DECLARE @PriceProd4 DECIMAL(18, 2) = (SELECT price FROM products WHERE product_id = @Prod4ID);

-- Pedido 1 (Alice, Mês Atual)
INSERT INTO orders (customer_id, order_date, status, total_amount, sales_person_id)
VALUES (@Cust1ID, DATEADD(day, -5, GETUTCDATE()), 
'Delivered
', (@PriceProd1 * 1) + (@PriceProd2 * 2), @SalesAliceID);
SET @OrderID1 = SCOPE_IDENTITY();
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID1, @Prod1ID, 1, @PriceProd1);
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID1, @Prod2ID, 2, @PriceProd2);

-- Pedido 2 (Bob, Mês Atual)
INSERT INTO orders (customer_id, order_date, status, total_amount, sales_person_id)
VALUES (@Cust2ID, DATEADD(day, -2, GETUTCDATE()), 
'Shipped
', (@PriceProd4 * 1), @SalesBobID);
SET @OrderID2 = SCOPE_IDENTITY();
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID2, @Prod4ID, 1, @PriceProd4);

-- Pedido 3 (Alice, Mês Anterior)
INSERT INTO orders (customer_id, order_date, status, total_amount, sales_person_id)
VALUES (@Cust3ID, DATEADD(month, -1, GETUTCDATE()), 
'Delivered
', (@PriceProd3 * 10), @SalesAliceID);
SET @OrderID3 = SCOPE_IDENTITY();
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID3, @Prod3ID, 10, @PriceProd3);

-- Pedido 4 (Bob, Mês Anterior)
INSERT INTO orders (customer_id, order_date, status, total_amount, sales_person_id)
VALUES (@Cust1ID, DATEADD(month, -1, DATEADD(day, -10, GETUTCDATE())), 
'Delivered
', (@PriceProd1 * 1) + (@PriceProd4 * 1), @SalesBobID);
SET @OrderID4 = SCOPE_IDENTITY();
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID4, @Prod1ID, 1, @PriceProd1);
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (@OrderID4, @Prod4ID, 1, @PriceProd4);
PRINT 
'Orders e Order Items inseridos.
';

-- 6. Inserir Metas de Vendas (Sales Targets)
PRINT 
'Inserindo Sales Targets...
';
DECLARE @CurrentMonth DATE = DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1);
DECLARE @PreviousMonth DATE = DATEADD(MONTH, -1, @CurrentMonth);

-- Metas Mês Atual
IF NOT EXISTS (SELECT 1 FROM sales_targets WHERE user_id = @SalesAliceID AND target_month = @CurrentMonth)
    INSERT INTO sales_targets (user_id, target_month, target_amount) VALUES (@SalesAliceID, @CurrentMonth, 15000.00);
IF NOT EXISTS (SELECT 1 FROM sales_targets WHERE user_id = @SalesBobID AND target_month = @CurrentMonth)
    INSERT INTO sales_targets (user_id, target_month, target_amount) VALUES (@SalesBobID, @CurrentMonth, 12000.00);

-- Metas Mês Anterior
IF NOT EXISTS (SELECT 1 FROM sales_targets WHERE user_id = @SalesAliceID AND target_month = @PreviousMonth)
    INSERT INTO sales_targets (user_id, target_month, target_amount) VALUES (@SalesAliceID, @PreviousMonth, 14000.00);
IF NOT EXISTS (SELECT 1 FROM sales_targets WHERE user_id = @SalesBobID AND target_month = @PreviousMonth)
    INSERT INTO sales_targets (user_id, target_month, target_amount) VALUES (@SalesBobID, @PreviousMonth, 11000.00);
PRINT 
'Sales Targets inseridos.
';

COMMIT TRANSACTION;

PRINT 
'Script 004_seed_data.sql concluído com sucesso.
';

