# AgriQCert Backend

Node.js/Express backend for the AgriQCert portal - Agricultural Product Certification System.

## Features

- User authentication (Exporter, QA Agency, Importer)
- Product batch management
- Quality inspection workflow
- Verifiable Credentials (VC) generation (W3C standard)
- QR code integration
- PostgreSQL database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update database connection in `.env`

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Batches
- `POST /api/batches` - Create batch
- `GET /api/batches` - List batches
- `GET /api/batches/:id` - Get batch details
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Inspections
- `POST /api/inspections` - Schedule inspection
- `GET /api/inspections` - List inspections
- `PUT /api/inspections/:id` - Update inspection
- `POST /api/inspections/:id/complete` - Complete inspection

### Verifiable Credentials
- `POST /api/credentials/generate` - Generate VC
- `GET /api/credentials/:id` - Get credential
- `POST /api/credentials/verify` - Verify credential
- `GET /api/credentials/:id/qrcode` - Generate QR code

## Database Setup

Database schema will be provided in the next step.

## Technologies Used

- Express.js
- PostgreSQL
- JWT Authentication
- Verifiable Credentials (W3C)
- QR Codes
- Bcrypt for password hashing
