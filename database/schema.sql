-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'technician',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(100),
    document VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabela de ordens de serviço
CREATE TABLE service_orders (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    client_id INTEGER REFERENCES clients(id),
    technician_id INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(10) DEFAULT 'normal',
    equipment VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(50),
    reported_issue TEXT NOT NULL,
    diagnosed_issue TEXT,
    solution TEXT,
    technician_notes TEXT,
    customer_notes TEXT,
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabela de itens da OS
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id),
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    type VARCHAR(20) -- 'service' or 'part'
);

-- Inserir usuário admin padrão
INSERT INTO users (name, email, password, role) VALUES (
    'Administrador',
    'admin@sistema.com',
    '$2a$12$LQv3c1yqBWVHxkd0L6k0R.L8Y5aH2wRZ5J5J5J5J5J5J5J5J5J5J', -- senha: admin123
    'admin'
);