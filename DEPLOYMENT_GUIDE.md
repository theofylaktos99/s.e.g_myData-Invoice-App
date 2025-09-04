# Deployment Guide - Italian Corner Invoice System

## Overview

This deployment guide provides comprehensive instructions for setting up the Italian Corner Invoice Management System in various environments, from local development to production deployment.

## System Requirements

### Minimum Requirements
- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Memory**: 512MB RAM available
- **Storage**: 100MB free disk space
- **Browser**: Modern browser with ES6+ support

### Recommended Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Memory**: 1GB RAM available
- **Storage**: 1GB free disk space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Supported Operating Systems
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+, CentOS 7+, Debian 10+)

## Local Development Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd "c:\DEV PORTOFOLIO\italiancorner_invoice_app"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backendaade
npm install
cd ..
```

### 2. Start Development Servers

#### Option A: Start Both Servers Separately
```bash
# Terminal 1 - Frontend server
npm start
# Starts on http://localhost:8080

# Terminal 2 - Backend server (optional)
npm run backend
# Starts on http://localhost:3000
```

#### Option B: Start with PowerShell Script
```powershell
# Create start script (start-dev.ps1)
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start"
Start-Sleep 2
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run backend"
```

### 3. Access Application
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- API Health Check: `http://localhost:3000/api/aade/validate` (POST)

## Production Deployment

### Method 1: Static Hosting (Frontend Only)

#### Prepare for Static Deployment
```bash
# Create production build directory
mkdir production-build

# Copy essential files
copy frontendmock.jsx production-build/
copy pdfGenerator.js production-build/
copy index.html production-build/
copy package.json production-build/
copy -r assets production-build/

# Update API configuration in frontendmock.jsx
# Set useBackend to false for static-only deployment
```

#### Deploy to Web Server
```bash
# Apache/Nginx - copy to web root
cp -r production-build/* /var/www/html/

# IIS - copy to wwwroot
copy production-build\* C:\inetpub\wwwroot\

# Static hosting services (Netlify, Vercel, GitHub Pages)
# Upload production-build directory contents
```

#### Configure Web Server

**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css text/javascript application/javascript application/json
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Method 2: Node.js Hosting (Full Stack)

#### Prepare Production Environment
```bash
# Create production package.json
cat > package.json << 'EOF'
{
  "name": "italiancorner-invoice-app",
  "version": "1.0.0",
  "description": "Italian Corner Invoice Management System",
  "main": "frontend-server.js",
  "scripts": {
    "start": "node frontend-server.js",
    "backend": "node backendaade/aade-backend-stub.js",
    "start:production": "concurrently \"npm start\" \"npm run backend\""
  },
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "concurrently": "^7.6.0"
  }
}
EOF

# Install production dependencies
npm install
```

#### Deploy to Node.js Hosting

**Heroku Deployment**
```bash
# Create Heroku app
heroku create italian-corner-invoice

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=80

# Create Procfile
echo "web: concurrently \"npm start\" \"npm run backend\"" > Procfile

# Deploy
git add .
git commit -m "Production deployment"
git push heroku main
```

**DigitalOcean/Linode Deployment**
```bash
# Copy files to server
scp -r . user@server:/var/www/italian-corner/

# SSH to server
ssh user@server

# Install dependencies
cd /var/www/italian-corner
npm install --production

# Create systemd service
sudo cat > /etc/systemd/system/italian-corner.service << 'EOF'
[Unit]
Description=Italian Corner Invoice App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/italian-corner
ExecStart=/usr/bin/node frontend-server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable italian-corner
sudo systemctl start italian-corner
```

### Method 3: Docker Deployment

#### Create Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS frontend

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 8080

CMD ["npm", "start"]
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS backend

WORKDIR /app
COPY backendaade/package*.json ./
RUN npm install --production

COPY backendaade/ .
EXPOSE 3000

CMD ["node", "aade-backend-stub.js"]
```

#### Create Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./assets:/app/assets:ro

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
```

#### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Update deployment
docker-compose pull
docker-compose up -d --force-recreate
```

## Environment Configuration

### Environment Variables

**Frontend Server**
```bash
# .env file
PORT=8080
NODE_ENV=production
STATIC_ROOT=.
BACKEND_URL=http://localhost:3000
```

**Backend Server**
```bash
# backendaade/.env file
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080
REQUEST_SIZE_LIMIT=1mb
LOG_LEVEL=info
```

### Configuration Files

**Production config.json**
```json
{
  "frontend": {
    "port": 8080,
    "staticRoot": ".",
    "apiEndpoint": "http://localhost:3000"
  },
  "backend": {
    "port": 3000,
    "corsOrigin": "*",
    "requestSizeLimit": "1mb",
    "mockMode": true
  },
  "logging": {
    "level": "info",
    "file": "logs/app.log"
  }
}
```

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # Proxy to Node.js applications
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Monitoring and Logging

### Application Monitoring

**PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'italian-corner-frontend',
    script: 'frontend-server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 2,
    exec_mode: 'cluster'
  }, {
    name: 'italian-corner-backend',
    script: 'backendaade/aade-backend-stub.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start applications
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Setup startup script
pm2 startup
pm2 save
```

### Log Management

**Winston Logging (Optional Enhancement)**
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### Health Checks

**Simple Health Endpoint**
```javascript
// Add to backend server
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

## Backup and Recovery

### Data Backup Strategy
```bash
# Backup script (backup.sh)
#!/bin/bash

BACKUP_DIR="/var/backups/italian-corner"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup application files
tar -czf "$BACKUP_DIR/$DATE/app-files.tar.gz" /var/www/italian-corner

# Backup logs
cp -r /var/www/italian-corner/logs "$BACKUP_DIR/$DATE/"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$DATE"
```

### Recovery Procedures
```bash
# Restore from backup
RESTORE_DATE="20250115_120000"
BACKUP_DIR="/var/backups/italian-corner/$RESTORE_DATE"

# Stop services
sudo systemctl stop italian-corner

# Restore application files
sudo tar -xzf "$BACKUP_DIR/app-files.tar.gz" -C /

# Restore logs
sudo cp -r "$BACKUP_DIR/logs" /var/www/italian-corner/

# Start services
sudo systemctl start italian-corner
```

## Performance Optimization

### Frontend Optimization
```javascript
// Optimize bundle loading
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

// Enable gzip for static assets
// Minify CSS and JavaScript
// Optimize images and logos
// Use CDN for external libraries
```

### Backend Optimization
```javascript
// Express optimization
const express = require('express');
const compression = require('compression');

const app = express();

// Enable gzip compression
app.use(compression());

// Set appropriate cache headers
app.use('/assets', express.static('assets', {
  maxAge: '1y',
  immutable: true
}));

// Request size limits
app.use(express.json({ limit: '1mb' }));
```

## Security Hardening

### Application Security
```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Input validation
const validateInput = (req, res, next) => {
  // Add input sanitization
  next();
};
```

### Server Security
```bash
# Firewall configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban for SSH protection
sudo apt-get install fail2ban

# Regular security updates
sudo apt-get update && sudo apt-get upgrade
```

## Troubleshooting

### Common Issues

**1. Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :8080
netstat -tulpn | grep :3000

# Kill processes on ports
sudo lsof -ti:8080 | xargs sudo kill -9
sudo lsof -ti:3000 | xargs sudo kill -9
```

**2. Permission Issues**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/italian-corner
sudo chmod -R 755 /var/www/italian-corner
```

**3. Memory Issues**
```bash
# Monitor memory usage
top -p $(pgrep -d, node)

# Increase Node.js memory limit
node --max-old-space-size=1024 frontend-server.js
```

### Log Analysis
```bash
# View application logs
sudo journalctl -u italian-corner -f

# Check error logs
tail -f logs/error.log

# Monitor access patterns
tail -f /var/log/nginx/access.log
```

## Maintenance

### Regular Maintenance Tasks
```bash
# Weekly maintenance script
#!/bin/bash

# Update dependencies
npm update

# Clear old logs
find logs/ -name "*.log" -mtime +7 -delete

# Restart services
sudo systemctl restart italian-corner

# Check disk space
df -h

# Check memory usage
free -h
```

### Update Procedures
```bash
# Application updates
git pull origin main
npm install
sudo systemctl restart italian-corner

# System updates
sudo apt-get update && sudo apt-get upgrade
sudo reboot
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: January 2025  
**Supported Platforms**: Linux, Windows, macOS  
**Minimum Node.js**: 14.x  
**Recommended Setup**: Production with HTTPS and monitoring
