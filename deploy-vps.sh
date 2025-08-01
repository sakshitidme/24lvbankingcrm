#!/bin/bash

# 24LV Platform VPS Deployment Script
# Server: 194.238.23.217
# Port: 8080

set -e

echo "🚀 Starting 24LV Platform VPS Deployment..."

# Configuration
VPS_HOST="194.238.23.217"
VPS_USER="root"
APP_NAME="24lv-platform"
APP_PORT="8080"
DEPLOY_PATH="/opt/$APP_NAME"

echo "📦 Creating deployment package..."

# Create a clean deployment package
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.development' \
    -czf 24lv-deploy.tar.gz .

echo "📤 Transferring files to VPS..."

# Transfer the package to VPS
scp -o StrictHostKeyChecking=no 24lv-deploy.tar.gz root@$VPS_HOST:/tmp/

echo "🔧 Setting up application on VPS..."

# Execute deployment commands on VPS
ssh -o StrictHostKeyChecking=no root@$VPS_HOST << 'EOF'
    # Create application directory
    mkdir -p /opt/24lv-platform
    cd /opt/24lv-platform
    
    # Extract application
    tar -xzf /tmp/24lv-deploy.tar.gz
    
    # Copy production environment
    cp .env.production .env.local
    
    # Install dependencies
    npm install --production=false
    
    # Run database migrations
    npx prisma generate
    npx prisma db push
    
    # Build the application
    npm run build
    
    # Install PM2 if not already installed
    npm install -g pm2
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: '24lv-platform',
    script: 'npm',
    args: 'start',
    cwd: '/opt/24lv-platform',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
}
ECOSYSTEM
    
    # Stop existing process if running
    pm2 stop 24lv-platform || true
    pm2 delete 24lv-platform || true
    
    # Start the application
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    # Clean up
    rm /tmp/24lv-deploy.tar.gz
    
    echo "✅ 24LV Platform deployed successfully!"
    echo "🌐 Application running at: http://194.238.23.217:8080"
    
    # Show status
    pm2 status
EOF

echo "🎉 Deployment completed!"
echo "🌐 Your application is now running at: http://194.238.23.217:8080"

# Clean up local deployment package
rm 24lv-deploy.tar.gz

echo "📊 Checking application status..."
ssh -o StrictHostKeyChecking=no root@$VPS_HOST "pm2 status && curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 || echo 'Application starting...'"