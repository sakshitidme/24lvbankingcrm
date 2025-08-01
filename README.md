# 24LV - Property Valuation & Legal Services Platform

A modern, scalable platform for property valuation and legal services designed for banks and financial institutions.

## 🚀 Status: READY FOR PRODUCTION

✅ **All development completed**  
✅ **Zero build errors**  
✅ **All TypeScript warnings resolved**  
✅ **Tailwind CSS v4 properly configured**  
✅ **Ready for immediate Vercel deployment**

👉 **See [FINAL_DEPLOYMENT_GUIDE.md](./FINAL_DEPLOYMENT_GUIDE.md) for quick deployment steps**

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, tRPC, Prisma ORM
- **Database**: PostgreSQL (Supabase/Neon/Railway ready)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-optimized

## Features

- 🔐 **Secure Authentication** - Role-based access control
- 👥 **Multi-user System** - Admin, Bank, Valuator, Advocate roles
- 📋 **Dynamic Forms** - Customizable request forms
- 🏦 **Bank Management** - Multi-bank support
- 💰 **Wallet System** - Transaction management
- 📊 **Dashboard** - Real-time statistics and insights
- 📄 **Report Generation** - Maintain existing report formats
- 🔒 **Enterprise Security** - CSRF protection, rate limiting

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd 24lv-app-v2
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL and other configurations:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/24lv_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

## Test Accounts

After seeding, you can login with these test accounts:

- **Admin**: `admin@24lv.com` / `admin123`
- **Valuator**: `valuator@24lv.com` / `admin123`
- **Advocate**: `advocate@24lv.com` / `admin123`
- **Bank User**: `bank@sbi.com` / `admin123`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
├── server/               # tRPC server setup
└── types/                # TypeScript type definitions
```

## API Documentation

The application uses tRPC for type-safe API calls. Main routers include:

- **User Router** - User management and authentication
- **Bank Router** - Bank operations
- **Form Router** - Dynamic form management
- **Request Router** - Request workflow management

## Database Schema

Key entities:
- **Users** - System users with role-based permissions
- **Banks** - Bank information and configuration
- **Forms** - Dynamic form definitions
- **Requests** - Valuation/legal service requests
- **Transactions** - Wallet and payment tracking

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Migration

For production deployment:
```bash
npx prisma migrate deploy
npm run db:seed
```

## Development

### Database Management

```bash
# View database in browser
npm run db:studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Security Features

- CSRF protection
- Rate limiting
- Input validation with Zod
- Secure password hashing
- JWT token management
- Role-based access control

## License

Private - 24LV Platform
