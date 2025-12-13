-- ============================================
-- SCHEMA PREMIUM - Sistema de Ordens de Serviço
-- Versão: 2.0 Premium
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de usuários (aprimorada)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'attendant')),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabela de clientes (aprimorada)
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    phone_secondary VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    document VARCHAR(20),
    document_type VARCHAR(10) CHECK (document_type IN ('CPF', 'CNPJ')),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Tabela de categorias de serviço
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ordens de serviço (aprimorada)
CREATE TABLE service_orders (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE RESTRICT,
    technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
    number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_parts', 'waiting_approval', 'completed', 'cancelled', 'delivered')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Informações do equipamento
    equipment VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(50),
    
    -- Descrições e diagnósticos
    reported_issue TEXT NOT NULL,
    diagnosed_issue TEXT,
    solution TEXT,
    technician_notes TEXT,
    customer_notes TEXT,
    
    -- Valores
    estimated_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    final_cost DECIMAL(10,2),
    discount DECIMAL(10,2) DEFAULT 0,
    
    -- Prazos e datas
    estimated_completion DATE,
    completed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Garantia
    warranty_days INTEGER DEFAULT 90,
    warranty_expires_at DATE,
    
    -- Anexos e assinatura
    has_attachments BOOLEAN DEFAULT false,
    customer_signature TEXT,
    technician_signature TEXT,
    
    -- Controle
    is_urgent BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabela de itens da OS (aprimorada)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('service', 'part', 'other')),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anexos
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    description TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de status
CREATE TABLE status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de auditoria
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(id)
);

-- Tabela de estoque de peças
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    quantity DECIMAL(10,2) DEFAULT 0,
    min_quantity DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(200),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de movimentação de estoque
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE SET NULL,
    type VARCHAR(20) CHECK (type IN ('in', 'out', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_document ON clients(document);
CREATE INDEX idx_clients_active ON clients(is_active) WHERE deleted_at IS NULL;

CREATE INDEX idx_service_orders_number ON service_orders(number);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_client ON service_orders(client_id);
CREATE INDEX idx_service_orders_technician ON service_orders(technician_id);
CREATE INDEX idx_service_orders_created_at ON service_orders(created_at DESC);
CREATE INDEX idx_service_orders_priority ON service_orders(priority);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_attachments_order ON attachments(order_id);
CREATE INDEX idx_status_history_order ON status_history(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_active ON inventory(is_active);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças de status
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO status_history (order_id, from_status, to_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.technician_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER service_order_status_change AFTER UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- Trigger para calcular data de expiração da garantia
CREATE OR REPLACE FUNCTION calculate_warranty_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.warranty_days IS NOT NULL THEN
        NEW.warranty_expires_at = (NEW.completed_at + (NEW.warranty_days || ' days')::INTERVAL)::DATE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_warranty_expiration BEFORE INSERT OR UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION calculate_warranty_expiration();

-- ============================================
-- VIEWS PARA RELATÓRIOS
-- ============================================

-- View de ordens com informações completas
CREATE OR REPLACE VIEW v_service_orders_full AS
SELECT 
    so.id,
    so.uuid,
    so.number,
    so.status,
    so.priority,
    so.equipment,
    so.brand,
    so.model,
    so.reported_issue,
    so.final_cost,
    so.created_at,
    so.completed_at,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    u.name AS technician_name,
    creator.name AS created_by_name,
    cat.name AS category_name,
    CASE 
        WHEN so.status = 'completed' THEN 'Concluída'
        WHEN so.status = 'in_progress' THEN 'Em Andamento'
        WHEN so.status = 'open' THEN 'Aberta'
        WHEN so.status = 'cancelled' THEN 'Cancelada'
        ELSE so.status
    END AS status_label
FROM service_orders so
LEFT JOIN clients c ON so.client_id = c.id
LEFT JOIN users u ON so.technician_id = u.id
LEFT JOIN users creator ON so.created_by = creator.id
LEFT JOIN service_categories cat ON so.category_id = cat.id
WHERE so.deleted_at IS NULL;

-- View de métricas do dashboard
CREATE OR REPLACE VIEW v_dashboard_metrics AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'open') AS open_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count,
    COUNT(*) AS total_count,
    SUM(final_cost) FILTER (WHERE status = 'completed' AND EXTRACT(MONTH FROM completed_at) = EXTRACT(MONTH FROM CURRENT_DATE)) AS monthly_revenue,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') AS avg_completion_hours
FROM service_orders
WHERE deleted_at IS NULL;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir usuário admin padrão (senha: Admin@123)
INSERT INTO users (name, email, password, role, is_active, email_verified) VALUES (
    'Administrador do Sistema',
    'admin@sistema.com',
    '$2a$12$LQv3c1yqBWVHxkd0L6k0R.L8Y5aH2wRZ5J5J5J5J5J5J5J5J5J5J5J',
    'admin',
    true,
    true
);

-- Inserir categorias padrão
INSERT INTO service_categories (name, description, color, icon) VALUES
('Manutenção Preventiva', 'Serviços de manutenção preventiva e check-up', '#10B981', 'wrench'),
('Reparo', 'Serviços de reparo e conserto', '#F59E0B', 'tool'),
('Instalação', 'Serviços de instalação de equipamentos', '#3B82F6', 'settings'),
('Consultoria', 'Serviços de consultoria técnica', '#8B5CF6', 'help-circle'),
('Emergência', 'Atendimentos emergenciais', '#EF4444', 'alert-circle');

-- Inserir configurações padrão do sistema
INSERT INTO system_settings (key, value, type, description) VALUES
('company_name', 'Minha Empresa', 'string', 'Nome da empresa'),
('company_email', 'contato@empresa.com', 'string', 'Email de contato'),
('company_phone', '(00) 0000-0000', 'string', 'Telefone de contato'),
('os_prefix', 'OS', 'string', 'Prefixo dos números de OS'),
('default_warranty_days', '90', 'number', 'Dias de garantia padrão'),
('enable_email_notifications', 'true', 'boolean', 'Habilitar notificações por email'),
('enable_sms_notifications', 'false', 'boolean', 'Habilitar notificações por SMS'),
('max_file_upload_size', '10485760', 'number', 'Tamanho máximo de upload em bytes (10MB)');

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para gerar próximo número de OS
CREATE OR REPLACE FUNCTION generate_next_os_number()
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR := 'OS';
    next_number INTEGER;
    new_os_number VARCHAR;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_number
    FROM service_orders
    WHERE number LIKE prefix || '%';
    
    new_os_number := prefix || LPAD(next_number::TEXT, 6, '0');
    RETURN new_os_number;
END;
$$ LANGUAGE plpgsql;

-- Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete_service_order(order_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE service_orders 
    SET deleted_at = NOW() 
    WHERE id = order_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE clients IS 'Tabela de clientes';
COMMENT ON TABLE service_orders IS 'Tabela principal de ordens de serviço';
COMMENT ON TABLE order_items IS 'Itens e serviços de cada ordem';
COMMENT ON TABLE attachments IS 'Anexos das ordens de serviço';
COMMENT ON TABLE status_history IS 'Histórico de mudanças de status';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria do sistema';
COMMENT ON TABLE notifications IS 'Notificações para usuários';
COMMENT ON TABLE inventory IS 'Estoque de peças e materiais';
