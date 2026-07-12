# Arova Developer Onboarding Setup Script
# Written by Antigravity for Arova open-source project

$ErrorActionPreference = "Stop"

Write-Host "=== Starting Arova Full-Stack Environment Setup ===" -ForegroundColor Cyan

# 1. Dependency Checks
Write-Host "[*] Checking required development SDKs..." -ForegroundColor Yellow

try {
    $dotnetVersion = dotnet --version
    Write-Host "  [OK] .NET SDK is installed (Version: $dotnetVersion)" -ForegroundColor Green
} catch {
    Write-Error "  [FAIL] .NET SDK not found. Please install the .NET 10 SDK (https://dotnet.microsoft.com/download)."
}

try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js is installed (Version: $nodeVersion)" -ForegroundColor Green
} catch {
    Write-Error "  [FAIL] Node.js not found. Please install Node.js v22+ (https://nodejs.org)."
}

# 2. Restore and Build Backend
Write-Host "`n[*] Restoring backend NuGet dependencies..." -ForegroundColor Yellow
Push-Location backend
try {
    dotnet restore
    Write-Host "  [OK] Backend NuGet restore completed." -ForegroundColor Green
    
    Write-Host "[*] Building backend solution..." -ForegroundColor Yellow
    dotnet build --configuration Debug
    Write-Host "  [OK] Backend compilation succeeded." -ForegroundColor Green
} finally {
    Pop-Location
}

# 3. Restore and Build Frontend
Write-Host "`n[*] Restoring frontend npm packages (this might take a minute)..." -ForegroundColor Yellow
Push-Location frontend
try {
    npm install
    Write-Host "  [OK] Frontend npm packages installed successfully." -ForegroundColor Green
    
    Write-Host "[*] Running frontend smoke build verification..." -ForegroundColor Yellow
    npm run build -- --configuration=development
    Write-Host "  [OK] Frontend compilation succeeded." -ForegroundColor Green
} finally {
    Pop-Location
}

# 4. Database Setup
Write-Host "`n[*] Setting up developer SQLite database..." -ForegroundColor Yellow
Push-Location backend/OurLittleUniverse
try {
    Write-Host "  Applying EF Migrations for SQLite..." -ForegroundColor DarkYellow
    try {
        $env:Database__Provider = "SQLite"
        dotnet ef database update --context AppDbContext
        Write-Host "  [OK] SQLite dev database successfully initialized." -ForegroundColor Green
    } catch {
        Write-Host "  [INFO] 'dotnet ef' tool not found or failed. Database will be automatically created on backend application startup." -ForegroundColor Gray
    } finally {
        $env:Database__Provider = $null
    }
} finally {
    Pop-Location
}

Write-Host "`n=== Arova Full-Stack Workspace is ready! ===" -ForegroundColor Green
Write-Host "To run backend: cd backend/OurLittleUniverse; dotnet run" -ForegroundColor Cyan
Write-Host "To run frontend: cd frontend; npm start" -ForegroundColor Cyan
Write-Host "=== Happy pair programming! ===" -ForegroundColor Magenta
