#!/bin/bash

# 24LV Platform Deployment Script
echo "🚀 Starting 24LV Platform Deployment..."

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf 24lv-deployment-final.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=*.log \
  --exclude=*.tar.gz \
  src/ \
  package.json \
  package-lock.json \
  next.config.js \
  tsconfig.json \
  prisma/ \
  DEPLOYMENT_SUMMARY.md \
  components.json \
  postcss.config.mjs \
  eslint.config.mjs

echo "✅ Deployment package created: 24lv-deployment-final.tar.gz"

# Instructions for manual deployment
echo ""
echo "📋 Manual Deployment Instructions:"
echo "1. Copy 24lv-deployment-final.tar.gz to your server"
echo "2. Extract: tar -xzf 24lv-deployment-final.tar.gz"
echo "3. Install dependencies: npm install"
echo "4. Build application: npm run build"
echo "5. Restart PM2: pm2 restart 24lv-platform"
echo ""

# Show deployment summary
echo "📊 Deployment Summary:"
echo "✅ Form creation popup background fixed"
echo "✅ Admin 'Upgrade to Pro' section removed"
echo "✅ Appearance settings enhanced with pastel colors"
echo "✅ Form creation functionality improved"
echo "✅ File/image upload module added with S3 support"
echo "✅ All popup backgrounds styled consistently"
echo ""
echo "🎉 Deployment package ready!"