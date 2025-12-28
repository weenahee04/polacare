-- Create PDPA Consent Table
CREATE TABLE IF NOT EXISTS pdpa_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terms_version VARCHAR(20) NOT NULL,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'data_usage')),
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consents_user ON pdpa_consents(user_id);
CREATE INDEX idx_consents_version ON pdpa_consents(terms_version);
CREATE INDEX idx_consents_type ON pdpa_consents(consent_type);

-- Create Terms Versions Table
CREATE TABLE IF NOT EXISTS terms_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_terms_active ON terms_versions(is_active);
CREATE INDEX idx_terms_version ON terms_versions(version);

-- Create Medication Logs Table
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    taken_at TIMESTAMP,
    taken BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_medication ON medication_logs(medication_id);
CREATE INDEX idx_logs_user ON medication_logs(user_id);
CREATE INDEX idx_logs_scheduled ON medication_logs(scheduled_time);
CREATE INDEX idx_logs_taken ON medication_logs(taken);

-- Add columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE medications ADD COLUMN IF NOT EXISTS dosage VARCHAR(100);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE patient_cases ADD COLUMN IF NOT EXISTS image_storage_type VARCHAR(20) DEFAULT 'local';
ALTER TABLE patient_cases ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);
CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(view_count);

