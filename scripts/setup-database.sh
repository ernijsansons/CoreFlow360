#!/bin/bash

# CoreFlow360 Database Setup Script
# This script helps set up PostgreSQL for local development

echo "CoreFlow360 Database Setup"
echo "=========================="

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and ensure it's running"
    exit 1
fi

# Start services
echo "Starting PostgreSQL and Redis services..."
docker compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init_postgresql

# Run seed data
echo "Seeding database with test data..."
npx prisma db seed

echo ""
echo "Database setup complete!"
echo ""
echo "PostgreSQL is running at: postgresql://localhost:5432/coreflow360"
echo "Redis is running at: redis://localhost:6379"
echo ""
echo "To stop the services, run: docker compose -f docker-compose.dev.yml down"
echo "To view logs, run: docker compose -f docker-compose.dev.yml logs -f"