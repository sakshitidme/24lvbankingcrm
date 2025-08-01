# 24LV Property Valuation Platform - Deployment Guide

## 🚀 Deployment Configuration

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Redis (for caching and sessions)
- AWS S3 or compatible storage (for file uploads)

### Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Redis
REDIS_URL="redis://username:password@host:port"

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="production"
PORT="3000"
```

### Build and Deploy

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Docker
```bash
# Build Docker image
docker build -t 24lv-platform .

# Run container
docker run -p 3000:3000 --env-file .env.production 24lv-platform
```

#### Option 3: Traditional Server
```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Start production server
npm start
```

### Database Setup

1. **Run Prisma migrations:**
```bash
npx prisma migrate deploy
```

2. **Generate Prisma client:**
```bash
npx prisma generate
```

3. **Seed initial data (optional):**
```bash
npx prisma db seed
```

### Performance Optimizations

1. **Enable compression:**
   - Gzip/Brotli compression at server level
   - Image optimization with Next.js Image component

2. **Caching strategy:**
   - Redis for session storage
   - CDN for static assets
   - Database query caching

3. **Security headers:**
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)
   - X-Frame-Options

### Monitoring and Logging

1. **Application monitoring:**
   - Error tracking with Sentry
   - Performance monitoring
   - Uptime monitoring

2. **Database monitoring:**
   - Query performance
   - Connection pooling
   - Backup strategies

### SSL/TLS Configuration

1. **Certificate setup:**
   - Let's Encrypt for free SSL
   - Cloudflare for CDN and SSL

2. **Security best practices:**
   - Force HTTPS redirects
   - Secure cookie settings
   - CORS configuration

### Backup Strategy

1. **Database backups:**
   - Daily automated backups
   - Point-in-time recovery
   - Cross-region replication

2. **File storage backups:**
   - S3 versioning enabled
   - Cross-region replication
   - Lifecycle policies

### Health Checks

Create health check endpoints:
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- `/api/health/redis` - Redis connectivity

### Scaling Considerations

1. **Horizontal scaling:**
   - Load balancer configuration
   - Session store externalization
   - Stateless application design

2. **Database scaling:**
   - Read replicas
   - Connection pooling
   - Query optimization

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Monitoring tools setup
- [ ] Backup strategy implemented
- [ ] Health checks working
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Documentation updated

### Post-Deployment

1. **Verify functionality:**
   - User registration/login
   - Form creation and submission
   - File uploads
   - Email notifications

2. **Performance testing:**
   - Load testing
   - Stress testing
   - Database performance

3. **Security testing:**
   - Vulnerability scanning
   - Penetration testing
   - Access control verification

### Maintenance

1. **Regular updates:**
   - Security patches
   - Dependency updates
   - Feature releases

2. **Monitoring:**
   - Error rates
   - Response times
   - Resource usage

3. **Backups:**
   - Regular backup testing
   - Recovery procedures
   - Data retention policies