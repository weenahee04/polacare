-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    hn VARCHAR(50) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0),
    height DECIMAL(5,2) NOT NULL CHECK (height >= 0),
    bmi DECIMAL(4,2) NOT NULL CHECK (bmi >= 0),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_hn ON users(hn);

-- Create OTPs Table
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otps_phone ON otps(phone_number);
CREATE INDEX idx_otps_code ON otps(code);
CREATE INDEX idx_otps_expires ON otps(expires_at);

-- Create Patient Cases Table
CREATE TABLE IF NOT EXISTS patient_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hn VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    image_url VARCHAR(500) NOT NULL,
    ai_analysis_text TEXT,
    doctor_notes TEXT,
    diagnosis VARCHAR(255) NOT NULL,
    left_eye_visual_acuity VARCHAR(50),
    left_eye_intraocular_pressure VARCHAR(50),
    left_eye_diagnosis VARCHAR(255),
    left_eye_note TEXT,
    right_eye_visual_acuity VARCHAR(50),
    right_eye_intraocular_pressure VARCHAR(50),
    right_eye_diagnosis VARCHAR(255),
    right_eye_note TEXT,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Finalized')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_user ON patient_cases(user_id);
CREATE INDEX idx_cases_hn ON patient_cases(hn);
CREATE INDEX idx_cases_date ON patient_cases(date);
CREATE INDEX idx_cases_status ON patient_cases(status);

-- Create Checklist Items Table
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_observed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_case ON checklist_items(case_id);
CREATE INDEX idx_checklist_category ON checklist_items(category);

-- Create Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    next_time VARCHAR(10) NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    type VARCHAR(10) DEFAULT 'drop' CHECK (type IN ('drop', 'pill', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_taken ON medications(taken);

-- Create Vision Tests Table
CREATE TABLE IF NOT EXISTS vision_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,
    details TEXT,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tests_user ON vision_tests(user_id);
CREATE INDEX idx_tests_name ON vision_tests(test_name);
CREATE INDEX idx_tests_date ON vision_tests(test_date);

-- Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    read_time VARCHAR(20) NOT NULL,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(is_published);
CREATE INDEX idx_articles_published_at ON articles(published_at);

