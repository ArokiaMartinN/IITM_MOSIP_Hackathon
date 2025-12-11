# AgriQCert - Complete Project Overview

## 🌾 Project Description

AgriQCert is a comprehensive **web-based agricultural product certification portal** that enables:
- **Exporters** to submit product batches for quality certification
- **QA Agencies** to conduct inspections and issue digital certificates
- **Importers/Customs** to verify product authenticity using Verifiable Credentials

The system integrates Verifiable Credentials (W3C standard) with QR codes for secure, tamper-proof agricultural supply chain certification.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│        ├── Exporter Portal     (Batch Management)               │
│        ├── QA Agency Portal    (Inspection Workflow)            │
│        ├── Importer Portal     (Verification)                   │
│        └── Admin Dashboard     (System Monitoring)              │
└──────────────────────────────────────────────────────────────────┘
                                  ↓
                    (REST API with JWT Auth)
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)                   │
│     ├── Auth Module      (JWT, Role-based Access)              │
│     ├── Batch Module     (CRUD Operations)                     │
│     ├── Inspection Module (Quality Checks)                     │
│     ├── VC Module        (W3C Credentials, QR Codes)           │
│     └── Middleware       (Auth, Validation, Error Handling)    │
└──────────────────────────────────────────────────────────────────┘
                                  ↓
                        (SQL Queries)
                                  ↓
┌──────────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                      │
│     ├── Users           (Exporter, QA Agency, Importer, Admin)  │
│     ├── Batches         (Product Information)                   │
│     ├── Inspections     (Quality Metrics)                       │
│     ├── VCs             (Verifiable Credentials)                │
│     ├── Verification Logs (Audit Trail)                         │
│     └── Attachments     (Documents, Images)                     │
└──────────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

### Backend (`backend/`)
```
backend/
├── src/
│   ├── index.js                 # Main server entry point
│   ├── config/
│   │   └── database.js         # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js   # User auth logic
│   │   ├── batchController.js  # Batch CRUD
│   │   ├── inspectionController.js  # Inspection management
│   │   └── vcController.js     # VC generation & verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── batches.js
│   │   ├── inspections.js
│   │   └── verifiableCredentials.js
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── services/               # Business logic
│   └── models/                 # Data models
├── schema.sql                  # Database schema
├── package.json
├── .env.example
└── README.md
```

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Main app with routing
│   ├── index.css              # Global & Tailwind styles
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── exporter/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BatchSubmission.jsx
│   │   │   └── BatchDetails.jsx
│   │   ├── qa-agency/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InspectionList.jsx
│   │   │   └── InspectionForm.jsx
│   │   ├── importer/
│   │   │   ├── Dashboard.jsx
│   │   │   └── VerifyCredential.jsx
│   │   └── admin/
│   │       └── Dashboard.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── FormField.jsx
│   │   ├── Alert.jsx
│   │   ├── Modal.jsx
│   │   └── DataTable.jsx
│   ├── services/
│   │   ├── apiClient.js       # Axios config
│   │   ├── authService.js
│   │   ├── batchService.js
│   │   ├── inspectionService.js
│   │   └── vcService.js
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   └── assets/
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## 🔄 User Workflows

### Exporter Workflow
1. **Register** → Create account with company details
2. **Login** → Access exporter dashboard
3. **Submit Batch** → Fill product details (type, quantity, location, destination)
4. **Upload Documents** → Attach lab reports, farming data, images
5. **Track Status** → Monitor batch through inspection process
6. **Receive Certificate** → Get Verifiable Credential once inspection is complete

### QA Agency Workflow
1. **Register** → Create certified QA agency account
2. **Login** → Access inspection dashboard
3. **View Pending** → See batches awaiting inspection
4. **Conduct Inspection** → Enter quality metrics (moisture, pesticides, organic status, ISO codes)
5. **Generate VC** → Issue Verifiable Credential for approved batches
6. **Track History** → View all completed inspections

### Importer Workflow
1. **Access Portal** → No login required (or login for analytics)
2. **Scan QR Code** → Use camera to scan certificate code
3. **Enter Credential ID** → Alternatively, manually enter ID
4. **Verify Certificate** → Get instant authenticity confirmation
5. **View Details** → See product metrics, issuer info, issuance date
6. **Print Report** → Generate verification report for customs

## 🗄️ Database Schema

### Users Table
- User authentication with roles: exporter, qa_agency, importer, admin
- Organization details, contact information
- Account status tracking

### Batches Table
- Product type, quantity, unit
- Origin location, destination
- Status: submitted → inspection_pending → inspection_completed → certified
- Timestamps for tracking

### Inspections Table
- Links batch to QA agency
- Quality metrics: moisture level, pesticide content, organic status
- ISO codes compliance
- Status tracking: scheduled → in_progress → completed

### Verifiable Credentials Table
- W3C-compliant VC payload in JSON format
- Issuer information
- Issue date and status
- Embedded product information

### Supporting Tables
- Verification Logs (audit trail)
- Attachments (documents, images)

## 🔐 Security Features

✅ **JWT Authentication** - Secure token-based authentication
✅ **Role-Based Access Control** - Different permissions for each role
✅ **Password Hashing** - bcryptjs for secure password storage
✅ **Protected API Routes** - Middleware validation on all endpoints
✅ **CORS Configuration** - Cross-origin request handling
✅ **Input Validation** - Joi schema validation
✅ **Error Handling** - Comprehensive error messages
✅ **Audit Trail** - All verification actions logged

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register         Register new user
POST   /api/auth/login            User login
POST   /api/auth/logout           User logout
```

### Batches
```
POST   /api/batches               Create new batch
GET    /api/batches               List batches (with filters)
GET    /api/batches/:id           Get batch details
PUT    /api/batches/:id           Update batch
DELETE /api/batches/:id           Delete batch
```

### Inspections
```
POST   /api/inspections           Schedule inspection
GET    /api/inspections           List inspections (with filters)
PUT    /api/inspections/:id       Update inspection results
POST   /api/inspections/:id/complete   Complete inspection
```

### Verifiable Credentials
```
POST   /api/credentials/generate  Generate VC
GET    /api/credentials/:id       Get credential
POST   /api/credentials/verify    Verify credential
GET    /api/credentials/:id/qrcode   Generate QR code
```

## 🎨 Frontend Features

### Authentication Pages
- Professional login form with email/password
- Registration with role selection
- Form validation and error messages
- Responsive design for mobile

### Exporter Dashboard
- Overview statistics (total, certified, pending batches)
- Batch list with filtering
- Batch submission form with file uploads
- Batch detail view with timeline

### QA Agency Portal
- Inspection statistics and overview
- Inspection list with status indicators
- Inspection form with quality metrics
- VC generation confirmation modal

### Importer Verification
- Simple, fast verification interface
- QR code scanner integration (ready for implementation)
- Manual credential ID input
- Clear pass/fail results
- Detailed verification information

### Shared Components
- Responsive navbar with user menu
- Reusable form fields with validation
- Alert notifications (success, error, warning)
- Modal dialogs for confirmations
- Data tables with filtering
- Status badges and indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
psql -U postgres -d agri_qcert -f backend/schema.sql
```

## 📊 Tech Stack Summary

**Backend:**
- Node.js + Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- Axios (HTTP requests)
- Joi (validation)
- QRCode (QR generation)

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Lucide React (icons)
- QRCode.React

**DevTools:**
- Vite (frontend build tool)
- Nodemon (backend auto-reload)
- Jest (testing - ready)

## 🔄 Workflow Integration Points

1. **Exporter submits batch** → Backend creates batch record
2. **System matches QA agency** → Creates inspection request
3. **QA agency completes inspection** → Updates inspection metrics
4. **Inspection approved** → Backend generates VC with product data
5. **VC issued** → QR code generated and sent to exporter wallet
6. **Importer scans QR** → Frontend requests verification from backend
7. **Verification returns** → Details displayed to importer

## 📈 Scalability Considerations

- Database indexing on frequently queried fields
- API rate limiting ready for implementation
- Stateless backend for horizontal scaling
- Frontend state management with Context API
- Service worker support for offline capability
- Image optimization and lazy loading ready

## 🎯 Next Steps After Setup

1. ✅ Install frontend dependencies and test
2. ✅ Install backend dependencies and test
3. ✅ Set up PostgreSQL database
4. ✅ Configure environment variables
5. ✅ Run backend development server
6. ✅ Run frontend development server
7. ✅ Test complete user workflows
8. ✅ Integrate with Inji Certify for VC generation
9. ✅ Integrate QR code scanner library
10. ✅ Deploy to production

## 📝 License

MIT License

## 👥 Support

For questions or issues, please refer to the README files in backend/ and frontend/ directories.

---

**AgriQCert v1.0** - Professional Agricultural Certification Platform 🌾
