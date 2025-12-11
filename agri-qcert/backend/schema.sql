-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- exporter, qa_agency, importer, admin
  phone VARCHAR(20),
  organization VARCHAR(255),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  product_type VARCHAR(255) NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  location VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  exporter_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'submitted', -- submitted, inspection_pending, inspection_completed, certified, rejected
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections table
CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES batches(id),
  qa_agency_id INTEGER NOT NULL REFERENCES users(id),
  scheduled_date TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, rejected
  moisture_level NUMERIC(5, 2),
  pesticide_content NUMERIC(5, 2),
  organic_status BOOLEAN,
  iso_codes VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifiable Credentials table
CREATE TABLE verifiable_credentials (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id),
  issuer_id INTEGER NOT NULL REFERENCES users(id),
  vc_payload JSON NOT NULL,
  status VARCHAR(50) DEFAULT 'issued', -- issued, verified, revoked
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification logs table (for audit trail)
CREATE TABLE verification_logs (
  id SERIAL PRIMARY KEY,
  credential_id INTEGER NOT NULL REFERENCES verifiable_credentials(id),
  verifier_id INTEGER REFERENCES users(id),
  verification_method VARCHAR(100),
  is_valid BOOLEAN,
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File attachments table
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES batches(id),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_batches_exporter_id ON batches(exporter_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_inspections_batch_id ON inspections(batch_id);
CREATE INDEX idx_inspections_qa_agency_id ON inspections(qa_agency_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_vc_inspection_id ON verifiable_credentials(inspection_id);
CREATE INDEX idx_vc_issuer_id ON verifiable_credentials(issuer_id);
CREATE INDEX idx_verification_logs_credential_id ON verification_logs(credential_id);
CREATE INDEX idx_attachments_batch_id ON attachments(batch_id);
