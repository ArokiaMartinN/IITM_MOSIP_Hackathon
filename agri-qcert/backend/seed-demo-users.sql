-- Seed demo users for AgriQCert
-- Run this script after schema.sql

BEGIN;

-- Insert demo users
INSERT INTO users (email, password, name, role, phone, organization, address, status) VALUES
('exporter@test.com', '$2a$10$YJSf.xr/N7dEBz3LqME4N.Y1wXH0I8z0lH0CZLmjXGQZJGVLW6Kvi', 'John Exporter', 'exporter', '+91-9876543210', 'AgroFresh India', '123 Farm Lane, Punjab, India', 'active'),
('qa@test.com', '$2a$10$YJSf.xr/N7dEBz3LqME4N.Y1wXH0I8z0lH0CZLmjXGQZJGVLW6Kvi', 'Sarah QA Officer', 'qa_agency', '+91-9876543211', 'AgriQuality Labs', '456 Test Road, Delhi, India', 'active'),
('importer@test.com', '$2a$10$YJSf.xr/N7dEBz3LqME4N.Y1wXH0I8z0lH0CZLmjXGQZJGVLW6Kvi', 'Ahmed Importer', 'importer', '+971-501234567', 'Gulf Trading Co', '789 Trade St, Dubai, UAE', 'active'),
('admin@test.com', '$2a$10$YJSf.xr/N7dEBz3LqME4N.Y1wXH0I8z0lH0CZLmjXGQZJGVLW6Kvi', 'Admin User', 'admin', '+91-9876543212', 'AgriQCert Admin', '000 Admin Plaza, Bangalore, India', 'active');

COMMIT;

SELECT 'Demo users inserted successfully' AS status;
SELECT COUNT(*) as total_users FROM users;
