#!/bin/bash

# 24LV Production Deployment Script
# This script handles the complete production deployment process

set -e

echo "🚀 Starting 24LV Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_success "Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# Build the application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    npx prisma db push
    print_success "Database migrations completed"
}

# Seed database (optional)
seed_database() {
    if [ "$1" = "--seed" ]; then
        print_status "Seeding database..."
        npm run db:seed
        print_success "Database seeded"
    fi
}

# Start the application
start_app() {
    print_status "Starting application..."
    npm start
}

# Main deployment process
main() {
    print_status "24LV Production Deployment Started"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Set production environment
    export NODE_ENV=production
    export NEXT_PUBLIC_MOCK_AUTH=false
    export MOCK_AUTH=false
    
    # Run deployment steps
    check_env_vars
    install_dependencies
    generate_prisma
    build_app
    run_migrations
    seed_database "$1"
    
    print_success "🎉 Production deployment completed successfully!"
    print_status "Application is ready to start with: npm start"
    
    # Optionally start the app
    if [ "$2" = "--start" ]; then
        start_app
    fi
}

# Run main function with all arguments
main "$@"