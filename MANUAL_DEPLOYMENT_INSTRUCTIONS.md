# 24LV Platform - Manual Deployment Instructions

## 🚀 Production Deployment Guide

**Server:** 194.238.23.217  
**Port:** 3000  
**Package:** 24lv-production-ready.tar.gz  
**Date:** July 23, 2025  

---

## 📦 Deployment Package Ready

The production-ready package `24lv-production-ready.tar.gz` has been created and is ready for deployment.

### Package Contents:
- ✅ Source code (`src/` directory)
- ✅ Public assets (`public/` directory) 
- ✅ Database schema (`prisma/` directory)
- ✅ Dependencies (`package.json`, `package-lock.json`)
- ✅ Configuration files (`next.config.js`, `tsconfig.json`, etc.)
- ✅ All necessary build configurations

---

## 🔧 Manual Deployment Steps

### Step 1: Upload Package to Server
```bash
# Copy the deployment package to the server
scp 24lv-production-ready.tar.gz root@194.238.23.217:/tmp/
```

### Step 2: SSH into Server and Deploy
```bash
# Connect to the server
ssh root@194.238.23.217

# Create deployment directory
mkdir -p /var/www/24lv
cd /var/www/24lv

# Extract the package
tar -xzf /tmp/24lv-production-ready.tar.gz

# Install dependencies
npm install --production

# Build the application
npm run build

# Set proper permissions
chown -R www-data:www-data /var/www/24lv
chmod -R 755 /var/www/24lv
```

### Step 3: Setup PM2 Process Manager
```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Create PM2 ecosystem configuration
cat > /var/www/24lv/ecosystem.config.js << 'EOF'
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
      PORT: 3000,
      MOCK_AUTH: 'true'
    }
  }]
}
EOF

# Stop any existing process
pm2 stop 24lv || true
pm2 delete 24lv || true

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Verify Deployment
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs 24lv

# Test local connection
curl http://localhost:3000

# Check if port 3000 is accessible
netstat -tlnp | grep :3000
```

---

## 🧪 Live Testing Checklist

Once deployed, test the following features directly on the production server:

### 1. **Application Access**
- [ ] Visit http://194.238.23.217:3000
- [ ] Verify homepage loads correctly
- [ ] Check responsive design on mobile

### 2. **Authentication & Navigation**
- [ ] Login functionality works
- [ ] Dashboard navigation is functional
- [ ] Sidebar menu items work correctly
- [ ] User profile displays properly

### 3. **Form Builder Module**
- [ ] Click "Create Form" button
- [ ] Verify solid white dialog background (no transparency/blur)
- [ ] Fill out form fields (name, type, description)
- [ ] Test form submission functionality
- [ ] Check if forms are created successfully
- [ ] Test form editing capabilities

### 4. **Appearance Settings**
- [ ] Navigate to Settings page
- [ ] Test pastel color themes:
  - [ ] Ocean theme (blue/cyan)
  - [ ] Sunset theme (purple/pink)
  - [ ] Forest theme (green/emerald)
  - [ ] Autumn theme (orange/yellow)
- [ ] Verify theme changes apply correctly

### 5. **File Upload Module**
- [ ] Test file upload component
- [ ] Verify drag-and-drop functionality
- [ ] Check file validation (type, size)
- [ ] Test progress tracking
- [ ] Verify file preview functionality

### 6. **Admin Features**
- [ ] Confirm "Upgrade to Pro" section is hidden for admin users
- [ ] Test admin-specific functionality
- [ ] Verify user management features

### 7. **Performance & Responsiveness**
- [ ] Page load times are acceptable
- [ ] Navigation is smooth
- [ ] Mobile responsiveness works
- [ ] No console errors in browser

---

## 🐛 Debugging Commands

If issues are encountered during testing:

### Check Application Status
```bash
ssh root@194.238.23.217
pm2 status
pm2 logs 24lv --lines 50
```

### Monitor Server Resources
```bash
htop
df -h
free -m
```

### Restart Application
```bash
pm2 restart 24lv
```

### Check Network Connectivity
```bash
netstat -tlnp | grep :3000
iptables -L
```

---

## 🔍 Known Issues to Test

### 1. **Form Submission Issue** (HIGH PRIORITY)
- **Problem:** Form creation button clicks may not trigger API calls
- **Test:** Create a new form and monitor browser console for errors
- **Debug:** Check if console.log messages appear when clicking "Create Form"
- **Files to check:** Form submission handling in forms page

### 2. **Mock Data Service**
- **Test:** Verify that forms are being created and stored
- **Check:** Form list updates after creation
- **Monitor:** API response times and data persistence

### 3. **Authentication Flow**
- **Test:** Login/logout functionality
- **Verify:** Session persistence
- **Check:** Role-based access control

---

## 📊 Performance Monitoring

### Key Metrics to Monitor:
- **Response Time:** < 2 seconds for page loads
- **Memory Usage:** < 1GB per PM2 process
- **CPU Usage:** < 80% under normal load
- **Error Rate:** < 1% of requests

### Monitoring Commands:
```bash
# Real-time logs
pm2 logs 24lv --lines 100 --raw

# Performance monitoring
pm2 monit

# System resources
htop
iostat 1
```

---

## 🚨 Troubleshooting Guide

### Application Won't Start
1. Check Node.js version: `node --version` (should be 18+)
2. Verify dependencies: `npm install`
3. Check build process: `npm run build`
4. Review PM2 logs: `pm2 logs 24lv`

### Port 3000 Not Accessible
1. Check if port is open: `netstat -tlnp | grep :3000`
2. Verify firewall rules: `iptables -L`
3. Check PM2 process: `pm2 status`

### Form Submission Not Working
1. Open browser developer tools
2. Check console for JavaScript errors
3. Monitor network tab for API calls
4. Verify form structure and event handlers

### Performance Issues
1. Check server resources: `htop`
2. Monitor PM2 processes: `pm2 monit`
3. Review application logs for errors
4. Consider increasing memory limits

---

## 📝 Post-Deployment Tasks

### 1. **Code Updates** (if needed)
If issues are found during testing, you can edit files directly on the server:

```bash
# Navigate to application directory
cd /var/www/24lv

# Edit files as needed
nano src/app/dashboard/forms/page.tsx

# Rebuild application
npm run build

# Restart PM2 process
pm2 restart 24lv
```

### 2. **Log Monitoring**
Set up log rotation and monitoring:

```bash
# Setup log rotation
pm2 install pm2-logrotate

# Configure log retention
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. **Backup Strategy**
```bash
# Create backup directory
mkdir -p /var/backups/24lv

# Backup current deployment
cp -r /var/www/24lv /var/backups/24lv/backup-$(date +%Y%m%d-%H%M%S)
```

---

## ✅ Success Criteria

The deployment is considered successful when:

- [ ] Application is accessible at http://194.238.23.217:3000
- [ ] All major features work correctly
- [ ] Form creation with solid white background works
- [ ] Appearance settings with pastel themes functional
- [ ] File upload module operational
- [ ] No critical errors in logs
- [ ] Performance meets acceptable standards
- [ ] Mobile responsiveness verified

---

## 📞 Support Information

**Repository:** https://github.com/r2w34/24lv-deploy-23-7-2025  
**Latest Commit:** f45afe2 - "Fix form dialog backgrounds to solid white and improve form submission handling"  
**Documentation:** See DEVELOPMENT_LOG.md for complete development history  

**Key Features Implemented:**
- ✅ Form builder with solid white dialogs
- ✅ Pastel color themes in appearance settings
- ✅ File upload with multiple storage options
- ✅ Admin upgrade section removal
- ✅ Enhanced UI/UX throughout platform
- ✅ Comprehensive test suite
- ✅ Production-ready deployment package

---

**Deployment Status:** Ready for Production  
**Next Action:** Execute manual deployment steps above  
**Priority:** Test form submission functionality on live server