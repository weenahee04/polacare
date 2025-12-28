-- Add role and doctor fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_license ON users(license_number);

-- Update existing users to have patient role
UPDATE users SET role = 'patient' WHERE role IS NULL;

