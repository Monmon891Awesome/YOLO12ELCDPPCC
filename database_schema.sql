-- PneumAI PostgreSQL Database Schema
-- Execute this in pgAdmin after creating the database

-- Create database (run this separately in pgAdmin)
-- CREATE DATABASE pneumai_db;

-- Connect to pneumai_db and run the following:

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_scans INTEGER DEFAULT 0,
    last_visit TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(100),
    license_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time REAL,
    detected BOOLEAN,
    confidence REAL,
    risk_level VARCHAR(20),
    top_class VARCHAR(100),
    file_size INTEGER,
    image_format VARCHAR(20),
    image_width INTEGER,
    image_height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detections table (stores individual detections from each scan)
CREATE TABLE IF NOT EXISTS detections (
    id SERIAL PRIMARY KEY,
    scan_id VARCHAR(50) REFERENCES scans(id) ON DELETE CASCADE,
    class_name VARCHAR(100),
    confidence REAL,
    bbox_x INTEGER,
    bbox_y INTEGER,
    bbox_width INTEGER,
    bbox_height INTEGER,
    size_mm REAL,
    shape VARCHAR(50),
    density VARCHAR(50)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan images table (stores image data as bytea)
CREATE TABLE IF NOT EXISTS scan_images (
    scan_id VARCHAR(50) PRIMARY KEY REFERENCES scans(id) ON DELETE CASCADE,
    original_image BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scans_patient_id ON scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_scans_upload_time ON scans(upload_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_detections_scan_id ON detections(scan_id);

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample doctors
INSERT INTO doctors (id, name, email, phone, specialization, license_number) VALUES
('doc_001', 'Dr. Sarah Johnson', 'sarah.johnson@pneumai.com', '+1-555-0101', 'Pulmonology', 'MD-2019-45678'),
('doc_002', 'Dr. Michael Chen', 'michael.chen@pneumai.com', '+1-555-0102', 'Oncology', 'MD-2018-34567'),
('doc_003', 'Dr. Emily Rodriguez', 'emily.rodriguez@pneumai.com', '+1-555-0103', 'Radiology', 'MD-2020-56789')
ON CONFLICT (id) DO NOTHING;
