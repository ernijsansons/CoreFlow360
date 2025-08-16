#!/bin/bash

# CoreFlow360 Database Migration Script
# Run this script after PostgreSQL is running

echo "CoreFlow360 Database Migration"
echo "=============================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Please copy .env.example to .env and configure DATABASE_URL"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check DATABASE_URL
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
    echo "Error: DATABASE_URL must start with postgresql:// or postgres://"
    echo "Current DATABASE_URL: $DATABASE_URL"
    exit 1
fi

echo "Using database: $DATABASE_URL"
echo ""

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev

# Show migration status
echo ""
echo "Migration status:"
npx prisma migrate status

echo ""
echo "Database migration complete!"