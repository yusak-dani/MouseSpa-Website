# MouseSpa - Railway Deployment Guide

## Prerequisites
1. Akun Railway (https://railway.app)
2. Railway CLI terinstall

## Deploy ke Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login ke Railway
```bash
railway login
```

### Step 3: Initialize Project di folder Backend
```bash
cd d:\MouseSpa\Backend
railway init
```
Pilih "Empty Project" saat diminta.

### Step 4: Add MySQL Database
1. Buka [Railway Dashboard](https://railway.app/dashboard)
2. Klik project yang baru dibuat
3. Klik **"+ New"** → **"Database"** → **"MySQL"**
4. Railway akan otomatis buat database dan set environment variables

### Step 5: Link Service & Deploy
```bash
railway link
railway up
```

## Environment Variables (Auto-set oleh Railway MySQL)
Railway MySQL plugin akan otomatis set:
- `MYSQLHOST` atau `DB_HOST`
- `MYSQLPORT` atau `DB_PORT`
- `MYSQLUSER` atau `DB_USER`
- `MYSQLPASSWORD` atau `DB_PASSWORD`
- `MYSQLDATABASE` atau `DB_NAME`

### Manual Set jika perlu:
Di Railway Dashboard → Variables:
```
DB_HOST=<dari Railway MySQL>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<dari Railway>
DB_NAME=railway
```

## Struktur Files untuk Deployment
```
Backend/
├── Dockerfile          ← Build instructions
├── railway.toml        ← Railway config
├── main.go             ← Serves API + Frontend
├── static/             ← Frontend files
│   ├── index.html
│   ├── index.css
│   ├── index.js
│   └── assets/
│       └── logo.png
└── ...
```

## Setelah Deploy
- Frontend: `https://your-app.railway.app/`
- API: `https://your-app.railway.app/api/orders`
- Health: `https://your-app.railway.app/health`

## Troubleshooting
1. **Build failed**: Check Dockerfile syntax
2. **DB connection error**: Verify environment variables
3. **Static files not loading**: Check `static/` folder exists
