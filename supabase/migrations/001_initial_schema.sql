-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tubes table
CREATE TABLE tubes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    qr_hash VARCHAR(255) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Basic Information
    tube_type VARCHAR(50) NOT NULL, -- CO2, O2, N2, etc.
    serial_number VARCHAR(100) NOT NULL,
    
    -- Technical Specifications
    weight DECIMAL(10,2), -- in kg
    capacity DECIMAL(10,2), -- in liters or cubic meters
    pressure DECIMAL(10,2), -- in bar or psi
    volume DECIMAL(10,2), -- in liters
    
    -- Inspection & Maintenance
    inspection_date DATE,
    next_inspection_date DATE,
    last_service_date DATE,
    
    -- Environmental Data
    temperature DECIMAL(5,2), -- in celsius
    humidity DECIMAL(5,2), -- in percentage
    
    -- Status & Codes
    status_codes VARCHAR(100), -- e.g., "2+3+4+5"
    current_status VARCHAR(50) DEFAULT 'active', -- active, maintenance, retired
    
    -- Additional Information
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    year_manufactured INTEGER,
    location VARCHAR(255),
    notes TEXT,
    
    -- QR Code Settings
    qr_code_url TEXT,
    qr_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(company_id, serial_number)
);

-- Create audit_logs table for tracking changes
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tube_id UUID NOT NULL REFERENCES tubes(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, viewed
    changes JSONB, -- store the actual changes
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tubes_qr_hash ON tubes(qr_hash);
CREATE INDEX idx_tubes_company_id ON tubes(company_id);
CREATE INDEX idx_tubes_serial_number ON tubes(serial_number);
CREATE INDEX idx_tubes_status ON tubes(current_status);
CREATE INDEX idx_tubes_inspection_date ON tubes(inspection_date);
CREATE INDEX idx_audit_logs_tube_id ON audit_logs(tube_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tubes_updated_at 
    BEFORE UPDATE ON tubes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique QR hash
CREATE OR REPLACE FUNCTION generate_qr_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_hash IS NULL OR NEW.qr_hash = '' THEN
        NEW.qr_hash := encode(gen_random_bytes(16), 'hex');
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM tubes WHERE qr_hash = NEW.qr_hash) LOOP
            NEW.qr_hash := encode(gen_random_bytes(16), 'hex');
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for QR hash generation
CREATE TRIGGER generate_tube_qr_hash 
    BEFORE INSERT ON tubes 
    FOR EACH ROW EXECUTE FUNCTION generate_qr_hash();

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Companies can only see their own data
CREATE POLICY "Companies can view own data" ON companies
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Companies can update own data" ON companies
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Tubes policies
CREATE POLICY "Companies can view own tubes" ON tubes
    FOR SELECT USING (company_id = auth.uid()::uuid);

CREATE POLICY "Companies can insert own tubes" ON tubes
    FOR INSERT WITH CHECK (company_id = auth.uid()::uuid);

CREATE POLICY "Companies can update own tubes" ON tubes
    FOR UPDATE USING (company_id = auth.uid()::uuid);

CREATE POLICY "Companies can delete own tubes" ON tubes
    FOR DELETE USING (company_id = auth.uid()::uuid);

-- Public access for QR code viewing (no authentication required)
CREATE POLICY "Public can view tubes via QR hash" ON tubes
    FOR SELECT USING (true);

-- Audit logs policies
CREATE POLICY "Companies can view own audit logs" ON audit_logs
    FOR SELECT USING (company_id = auth.uid()::uuid);

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Insert sample company for testing
INSERT INTO companies (id, name, email, password_hash, phone, website) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Kano Marine',
    'admin@kanomarine.com',
    '$2b$10$example.hash.here', -- This should be properly hashed in production
    '+90 212 555 0123',
    'https://kanomarine.com'
);

-- Insert sample tube data
INSERT INTO tubes (
    company_id, 
    tube_type, 
    serial_number, 
    weight, 
    capacity, 
    pressure, 
    volume, 
    inspection_date, 
    temperature, 
    status_codes,
    manufacturer,
    location
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'CO2',
    '2171007',
    45.00,
    250.00,
    79.6,
    124.8,
    '2025-09-01',
    18.0,
    '2+3+4+5',
    'Kano Marine Industries',
    'Warehouse A - Section 1'
);
