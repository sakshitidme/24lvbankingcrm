#!/bin/bash

# 24LV Platform Final Deployment Script
# Date: 2025-07-23
# Purpose: Deploy the complete 24LV platform to production VPS

set -e

echo "🚀 Starting 24LV Platform Final Deployment..."

# Configuration
VPS_HOST="194.238.23.217"
VPS_USER="root"
DEPLOY_DIR="/var/www/24lv"
BACKUP_DIR="/var/backups/24lv"
SERVICE_NAME="24lv"

# Create deployment package
echo "📦 Creating deployment package..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.tar.gz' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='build' \
    -czf 24lv-final-deployment.tar.gz \
    src/ \
    public/ \
    prisma/ \
    package.json \
    package-lock.json \
    next.config.js \
    next.config.ts \
    tsconfig.json \
    components.json \
    postcss.config.mjs \
    eslint.config.mjs \
    deploy.sh

echo "✅ Deployment package created: 24lv-final-deployment.tar.gz"

# Deploy to VPS
echo "🌐 Deploying to VPS server..."

# Copy deployment package to server
scp -o StrictHostKeyChecking=no 24lv-final-deployment.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Execute deployment on server
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
set -e

echo "🔧 Setting up deployment environment..."

# Create backup of existing deployment
if [ -d "/var/www/24lv" ]; then
    echo "📋 Creating backup..."
    mkdir -p /var/backups/24lv
    cp -r /var/www/24lv /var/backups/24lv/backup-$(date +%Y%m%d-%H%M%S)
fi

# Create deployment directory
mkdir -p /var/www/24lv
cd /var/www/24lv

# Extract new deployment
echo "📂 Extracting deployment package..."
tar -xzf /tmp/24lv-final-deployment.tar.gz

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🔨 Building application..."
npm run build

# Set permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/24lv
chmod -R 755 /var/www/24lv

# Setup PM2 process
echo "⚙️ Setting up PM2 process..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'ECOSYSTEM_EOF'
module.exports = {
  apps: [{
    name: '24lv',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/24lv',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
ECOSYSTEM_EOF

# Stop existing process if running
pm2 stop 24lv || true
pm2 delete 24lv || true

# Start new process
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on http://194.238.23.217:3000"

# Test the deployment
echo "🧪 Testing deployment..."
sleep 5
curl -f http://localhost:3000 > /dev/null && echo "✅ Application is responding" || echo "❌ Application is not responding"

EOF

echo "🎉 Deployment completed!"
echo "🌐 Your application should be available at: http://194.238.23.217:3000"
echo "📊 Check PM2 status: ssh root@194.238.23.217 'pm2 status'"
echo "📋 View logs: ssh root@194.238.23.217 'pm2 logs 24lv'"

# Cleanup
rm -f 24lv-final-deployment.tar.gz

echo "✨ Final deployment script completed!"