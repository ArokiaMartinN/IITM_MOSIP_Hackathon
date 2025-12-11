# AgriQCert - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Database Setup
```bash
# Create PostgreSQL database
createdb agri_qcert

# Run schema
psql -U postgres -d agri_qcert -f backend/schema.sql
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials:
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost

# Start server
npm run dev
# Server runs at http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:3000
```

## 🧪 Testing the Application

### Demo User Credentials
Use these for testing:

**Exporter:**
- Email: exporter@test.com
- Password: password
- Role: exporter

**QA Agency:**
- Email: qa@test.com
- Password: password
- Role: qa_agency

**Importer:**
- Email: importer@test.com
- Password: password
- Role: importer

### Test Workflow

1. **Register & Login as Exporter**
   - Go to http://localhost:3000/register
   - Fill in details, select "Exporter" role
   - Login with credentials

2. **Submit a Batch**
   - Click "Submit New Batch"
   - Fill in product details (e.g., Rice, 1000 kg)
   - Click "Submit Batch"

3. **Login as QA Agency**
   - Logout and go to register
   - Create account with "QA Agency" role
   - Go to QA Dashboard

4. **Inspect Batch**
   - Click on inspection from dashboard
   - Enter quality metrics:
     - Moisture Level: 12.5%
     - Pesticide Content: 0.5 ppm
     - Organic Status: Yes/No
   - Click "Generate Certificate"

5. **Verify as Importer**
   - Logout and register as "Importer"
   - Go to Importer Dashboard
   - Enter credential ID (from VC generation)
   - Click "Verify"

## 📱 Project URLs

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api/health |

## 🔧 Common Issues & Solutions

### Issue: Database connection error
**Solution:**
```bash
# Check PostgreSQL is running
# Windows: psql -U postgres
# Mac: psql
# Verify DB_USER, DB_PASSWORD, DB_HOST in .env
```

### Issue: Port already in use
**Solution:**
```bash
# Change port in backend .env:
PORT=5001

# Change port in frontend vite.config.js:
server: { port: 3001 }
```

### Issue: Dependencies not installing
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📦 Project Structure Quick Reference

```
agri-qcert/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation
│   │   └── services/          # Services
│   ├── schema.sql             # Database schema
│   └── package.json
│
└── frontend/                   # React App
    ├── src/
    │   ├── pages/             # Page components
    │   ├── components/        # UI components
    │   ├── services/          # API calls
    │   └── contexts/          # State management
    └── package.json
```

## 🎯 Key Features to Explore

### ✅ Features Implemented
- ✅ User authentication (Login/Register)
- ✅ Multi-role access control
- ✅ Exporter batch submission
- ✅ QA agency inspection workflow
- ✅ Verifiable Credential generation
- ✅ Public credential verification
- ✅ API integration with JWT
- ✅ Professional UI with Tailwind CSS
- ✅ Form validation and error handling
- ✅ Responsive mobile design

### 🔮 Ready for Enhancement
- 🚀 QR code scanner integration
- 🚀 Inji Certify integration
- 🚀 Email notifications
- 🚀 File upload to cloud storage
- 🚀 Advanced analytics dashboard
- 🚀 Batch processing
- 🚀 Mobile app
- 🚀 Blockchain integration

## 📚 API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Exporter",
    "email": "john@example.com",
    "password": "password123",
    "role": "exporter",
    "organization": "Export Co"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Batch
```bash
curl -X POST http://localhost:5000/api/batches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productType": "Rice",
    "quantity": 1000,
    "location": "Mumbai",
    "destination": "Dubai"
  }'
```

## 🐛 Debugging Tips

### Backend
```bash
# Check server is running
curl http://localhost:5000/api/health

# View logs
npm run dev  # Shows all console output

# Check database connection
psql -U postgres -d agri_qcert -c "SELECT 1;"
```

### Frontend
```bash
# Open browser console (F12)
# Check Network tab for API calls
# Check Application tab for stored token
# Use React DevTools browser extension
```

## 📝 Next Development Steps

1. **Add Email Notifications**
   - Send alerts when batch is submitted
   - Notify when inspection is complete
   - Certificate issued notifications

2. **Enhance File Management**
   - Upload to AWS S3 / Google Cloud
   - Image compression
   - Document preview

3. **Advanced Analytics**
   - Dashboard with charts
   - Batch trends analysis
   - Compliance reports

4. **Mobile App**
   - React Native
   - Offline support
   - Push notifications

5. **Integration**
   - Inji Wallet integration
   - Blockchain verification
   - Government systems API

## 🆘 Support & Resources

- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`
- **Project Overview**: `PROJECT_OVERVIEW.md`
- **Database Schema**: `backend/schema.sql`

## ✨ You're All Set! 🎉

Start both servers and begin exploring AgriQCert. Happy coding! 🚀

---

For more detailed information, check the README files in each directory.
