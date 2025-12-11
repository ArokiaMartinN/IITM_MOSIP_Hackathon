# AgriQCert Frontend

Professional React + Tailwind CSS frontend for the AgriQCert portal - Agricultural Product Certification System.

## Features

- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Multi-role authentication (Exporter, QA Agency, Importer, Admin)
- ✅ Exporter dashboard for batch management
- ✅ QA Agency inspection workflow
- ✅ Importer credential verification
- ✅ Admin system monitoring
- ✅ Real-time API integration
- ✅ Protected routes with JWT
- ✅ Form validation and error handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── pages/              # Page components
│   ├── auth/          # Login, Register
│   ├── exporter/      # Exporter dashboard & batch management
│   ├── qa-agency/     # QA agency inspection & VC generation
│   ├── importer/      # Importer verification portal
│   └── admin/         # Admin dashboard
├── components/        # Reusable components
├── services/          # API service layer
├── contexts/          # Auth context
├── hooks/             # Custom hooks
└── assets/            # Images, icons
```

## Key Pages

### Authentication
- **Login**: `/login` - User authentication
- **Register**: `/register` - New user registration

### Exporter Portal
- **Dashboard**: `/exporter/dashboard` - Batch overview
- **Submit Batch**: `/exporter/submit-batch` - Create new batch
- **Batch Details**: `/exporter/batch/:id` - View batch status

### QA Agency Portal
- **Dashboard**: `/qa-agency/dashboard` - Inspection overview
- **Inspections**: `/qa-agency/inspections` - All inspections
- **Inspection Form**: `/qa-agency/inspection/:id` - Conduct inspection

### Importer Portal
- **Dashboard**: `/importer/dashboard` - Verification portal
- **Verify**: `/verify/:credentialId` - Verify credential

## Technologies Used

- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- Lucide React Icons
- QRCode.React

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`

All requests include JWT authentication token automatically.

## Environment Variables

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:5000/api
```

## Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is attached to all API requests
4. Protected routes check authentication
5. Automatic redirect to login on token expiry
