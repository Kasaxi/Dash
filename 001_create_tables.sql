-- 001_create_tables.sql
-- Script para criar as tabelas iniciais do banco de dados

-- Cria a tabela de papéis (roles)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE roles (
        role_id INT PRIMARY KEY IDENTITY(1,1),
        role_name VARCHAR(50) UNIQUE NOT NULL -- admin, sales_manager, viewer
    );
    PRINT 'Tabela roles criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela roles já existe.';
END
GO

-- Cria a tabela de usuários (users)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE users (
        user_id INT PRIMARY KEY IDENTITY(1,1),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name NVARCHAR(255),
        role_id INT NOT NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        -- RLS related column (e.g., region, department, etc. - adapt as needed)
        -- For simplicity, let's assume RLS might be based on the user themselves or their role initially
        -- A specific column like 'sales_region_id' could be added if needed for RLS
        CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES roles(role_id)
    );
    PRINT 'Tabela users criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela users já existe.';
END
GO

-- Cria a tabela de clientes (customers)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[customers]') AND type in (N'U'))
BEGIN
    CREATE TABLE customers (
        customer_id INT PRIMARY KEY IDENTITY(1,1),
        customer_name NVARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        address NVARCHAR(500),
        city NVARCHAR(100),
        region NVARCHAR(100), -- Para o gráfico de vendas por região
        country NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT 'Tabela customers criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela customers já existe.';
END
GO

-- Cria a tabela de produtos (products)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE products (
        product_id INT PRIMARY KEY IDENTITY(1,1),
        product_name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        price DECIMAL(18, 2) NOT NULL,
        sku VARCHAR(100) UNIQUE, -- Stock Keeping Unit
        category NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT 'Tabela products criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela products já existe.';
END
GO

-- Cria a tabela de pedidos (orders)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[orders]') AND type in (N'U'))
BEGIN
    CREATE TABLE orders (
        order_id INT PRIMARY KEY IDENTITY(1,1),
        customer_id INT NOT NULL,
        order_date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
        total_amount DECIMAL(18, 2) NOT NULL,
        sales_person_id INT, -- Referencia o usuário que realizou a venda
        CONSTRAINT FK_orders_customers FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        CONSTRAINT FK_orders_users FOREIGN KEY (sales_person_id) REFERENCES users(user_id) -- Ligação com o vendedor
    );
    PRINT 'Tabela orders criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela orders já existe.';
END
GO

-- Cria a tabela de itens do pedido (order_items)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[order_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE order_items (
        order_item_id INT PRIMARY KEY IDENTITY(1,1),
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(18, 2) NOT NULL, -- Preço no momento da compra
        total_price AS (quantity * unit_price), -- Coluna calculada
        CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        CONSTRAINT FK_order_items_products FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    PRINT 'Tabela order_items criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela order_items já existe.';
END
GO

-- Cria a tabela de metas de vendas (sales_targets)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sales_targets]') AND type in (N'U'))
BEGIN
    CREATE TABLE sales_targets (
        target_id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL, -- Meta associada a um vendedor específico
        target_month DATE NOT NULL, -- Primeiro dia do mês da meta
        target_amount DECIMAL(18, 2) NOT NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        UNIQUE (user_id, target_month), -- Garante uma meta por vendedor por mês
        CONSTRAINT FK_sales_targets_users FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    PRINT 'Tabela sales_targets criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela sales_targets já existe.';
END
GO

-- Adiciona um trigger para atualizar o updated_at na tabela users
IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_users_update_timestamp]'))
    DROP TRIGGER [dbo].[trg_users_update_timestamp];
GO
CREATE TRIGGER trg_users_update_timestamp
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users
    SET updated_at = GETUTCDATE()
    FROM inserted
    WHERE users.user_id = inserted.user_id;
END;
GO
PRINT 'Trigger trg_users_update_timestamp criado/atualizado.';

-- Adiciona um trigger para atualizar o updated_at na tabela sales_targets
IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_sales_targets_update_timestamp]'))
    DROP TRIGGER [dbo].[trg_sales_targets_update_timestamp];
GO
CREATE TRIGGER trg_sales_targets_update_timestamp
ON sales_targets
AFTER UPDATE
AS
BEGIN
    UPDATE sales_targets
    SET updated_at = GETUTCDATE()
    FROM inserted
    WHERE sales_targets.target_id = inserted.target_id;
END;
GO
PRINT 'Trigger trg_sales_targets_update_timestamp criado/atualizado.';

PRINT 'Script 001_create_tables.sql concluído.'

