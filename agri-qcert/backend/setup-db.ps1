# PostgreSQL Setup Script for AgriQCert

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$pgctlPath = "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe"
$confPath = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"

Write-Host "PostgreSQL Database Setup for AgriQCert" -ForegroundColor Green

# Step 1: Backup
Write-Host "[1/5] Backing up PostgreSQL configuration..." -ForegroundColor Cyan
Copy-Item $confPath "$confPath.backup" -Force

# Step 2: Enable trust authentication temporarily
Write-Host "[2/5] Enabling temporary trust authentication..." -ForegroundColor Cyan
$confContent = Get-Content $confPath
$confContent = $confContent -replace 'host    all             all             127\.0\.0\.1/32            scram-sha-256', 'host    all             all             127.0.0.1/32            trust'
$confContent = $confContent -replace 'host    all             all             ::1/128                 scram-sha-256', 'host    all             all             ::1/128                 trust'
$confContent | Set-Content $confPath

# Step 3: Reload PostgreSQL
Write-Host "[3/5] Reloading PostgreSQL service..." -ForegroundColor Cyan
& $pgctlPath reload -D "C:\Program Files\PostgreSQL\17\data" 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Step 4: Setup database
Write-Host "[4/5] Setting up database..." -ForegroundColor Cyan
$env:PGPASSWORD = ""
& $psqlPath -U postgres -h localhost -d postgres -w -c "DROP DATABASE IF EXISTS agri_qcert;" 2>&1 | Out-Null
& $psqlPath -U postgres -h localhost -d postgres -w -c "CREATE DATABASE agri_qcert;" 2>&1 | Out-Null
& $psqlPath -U postgres -h localhost -d postgres -w -c "ALTER USER postgres WITH PASSWORD 'admin123';" 2>&1 | Out-Null

# Step 5: Restore secure authentication
Write-Host "[5/5] Restoring secure authentication..." -ForegroundColor Cyan
$confContent = Get-Content $confPath
$confContent = $confContent -replace 'host    all             all             127\.0\.0\.1/32            trust', 'host    all             all             127.0.0.1/32            scram-sha-256'
$confContent = $confContent -replace 'host    all             all             ::1/128                 trust', 'host    all             all             ::1/128                 scram-sha-256'
$confContent | Set-Content $confPath
& $pgctlPath reload -D "C:\Program Files\PostgreSQL\17\data" 2>&1 | Out-Null
Start-Sleep -Seconds 2

Write-Host "Setup Complete! Credentials: postgres / admin123" -ForegroundColor Green
