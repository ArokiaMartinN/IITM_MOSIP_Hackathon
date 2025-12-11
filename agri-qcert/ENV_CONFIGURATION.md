# AgriQCert Environment Configuration

## Backend .env

Create `backend/.env` with these variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=agri_qcert
DB_PASSWORD=your_password_here
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRY=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email Configuration (Optional - for future enhancement)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@agriQcert.com

# Inji Integration (Future)
INJI_CERTIFY_URL=https://certify.inji.io
INJI_VERIFY_URL=https://verify.inji.io
INJI_API_KEY=your_inji_api_key_here

# Cloud Storage (Optional - for future enhancement)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=agri-qcert-bucket
AWS_REGION=ap-south-1
```

## Frontend .env.local

Create `frontend/.env.local` with:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AgriQCert
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_QR_SCANNER=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_NOTIFICATIONS=false

# Analytics (Optional)
VITE_ANALYTICS_ID=
```

## Production .env

For production deployment, use secure values:

```env
# Backend Production
PORT=5000
NODE_ENV=production
DB_USER=prod_user
DB_HOST=prod-db-host.example.com
DB_NAME=agri_qcert_prod
DB_PASSWORD=strong_secure_password
JWT_SECRET=long_random_string_minimum_32_characters

# Frontend Production
VITE_API_URL=https://api.agriQcert.com/api
VITE_APP_NAME=AgriQCert
```

## 🔐 Security Best Practices

1. **Never commit .env files to Git**
   - Add to `.gitignore`: `*.env`, `.env.local`

2. **Use strong secrets in production**
   - Generate random 32+ character strings for JWT_SECRET
   - Use environment variables, not hardcoded values

3. **Database credentials**
   - Use strong passwords (20+ characters)
   - Rotate credentials regularly
   - Use different credentials for dev/prod

4. **CORS settings**
   - Specify exact allowed origins
   - Don't use wildcard (*) in production

5. **Email service**
   - Use app-specific passwords, not main password
   - Enable 2FA on email account

6. **API Keys**
   - Rotate keys regularly
   - Use environment-specific keys
   - Revoke compromised keys immediately

## 📋 Quick Setup Checklist

- [ ] Create `backend/.env` file
- [ ] Update database credentials
- [ ] Generate secure JWT_SECRET (use online generator or `openssl rand -base64 32`)
- [ ] Create `frontend/.env.local` file
- [ ] Verify all paths and URLs
- [ ] Test database connection
- [ ] Run backend: `npm run dev`
- [ ] Run frontend: `npm run dev`
- [ ] Access http://localhost:3000

## 🚀 Deployment Configuration

### For Docker
```dockerfile
# Backend Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### For Heroku
```bash
# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set DB_PASSWORD=your_password
heroku config:set NODE_ENV=production
```

### For AWS/GCP
```bash
# Use AWS Systems Manager Parameter Store or Google Secret Manager
# Reference in application:
# const dbPassword = await secretsManager.getSecret('db-password')
```

## 🔄 Updating Environment Variables

To update environment variables:

1. **Development**
   - Edit `.env` file
   - Restart `npm run dev`

2. **Production (Heroku)**
   - Use `heroku config:set KEY=VALUE`
   - Or use Dashboard → Settings → Config Vars

3. **Production (Docker)**
   - Update `.env` in container
   - Restart container

4. **Production (AWS/GCP)**
   - Update in Secrets Manager
   - Restart application

## ⚠️ Common Configuration Issues

### Issue: Database connection fails
```
Check: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
Verify: PostgreSQL is running and accessible
```

### Issue: CORS errors
```
Check: ALLOWED_ORIGINS includes frontend URL
Format: http://localhost:3000 (include protocol and port)
```

### Issue: JWT token errors
```
Check: JWT_SECRET is set and same on all instances
Note: Changing JWT_SECRET will invalidate all existing tokens
```

### Issue: File upload fails
```
Check: UPLOAD_DIR exists and has write permissions
Check: MAX_FILE_SIZE is appropriate
Create directory: mkdir -p ./uploads
```

---

**Remember**: Keep your `.env` file secure and never share credentials! 🔒
