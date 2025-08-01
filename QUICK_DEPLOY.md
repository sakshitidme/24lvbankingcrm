# 🚀 Quick Deployment Guide

## Step 1: Set Up Database (Choose One)

### Option A: Neon (Recommended - Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### Option B: Supabase (Free Tier Available)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Option C: Railway (Simple Setup)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string

## Step 2: Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

## Step 3: Deploy to Vercel

### Quick Commands:
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy (run from project directory)
cd 24lv-app-v2
vercel

# 3. Follow the prompts:
# - Link to existing project? N
# - Project name: 24lv-app (or your choice)
# - Directory: ./
# - Override settings? N
```

## Step 4: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Your generated secret | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |
| `NEXTAUTH_URL` | Your preview URL | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |

## Step 5: Set Up Database Schema

After deployment, run these commands:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Push database schema
npx prisma db push

# Seed the database with test data
npm run db:seed
```

## Step 6: Test Your Deployment

Visit your Vercel URL and login with:
- **Admin**: `admin@24lv.com` / `admin123`
- **Valuator**: `valuator@24lv.com` / `admin123`
- **Advocate**: `advocate@24lv.com` / `admin123`
- **Bank User**: `bank@sbi.com` / `admin123`

## 🎉 You're Done!

Your 24LV application is now live on Vercel!

## Troubleshooting

### Build Errors
```bash
# Test build locally
npm run build
```

### Database Connection Issues
```bash
# Test database connection
npx prisma db push --preview-feature
```

### Environment Variable Issues
```bash
# Check environment variables
vercel env ls
```

## Need Help?
- Check the detailed `DEPLOYMENT.md` guide
- Review `DEPLOYMENT_CHECKLIST.md`
- Visit [vercel.com/docs](https://vercel.com/docs)