# CoreFlow360 Database Setup Guide

## Prerequisites

1. **Docker Desktop** - Required for running PostgreSQL and Redis locally
2. **Node.js 18+** - Required for running Prisma migrations

## Quick Start

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
docker compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

The default PostgreSQL connection string is already configured:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coreflow360?schema=public"
```

### 3. Run Database Migration

```bash
# Generate Prisma client and run migrations
./scripts/migrate-database.sh
```

Or manually:
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Seed Database (Optional)

```bash
npx prisma db seed
```

This creates:
- Test tenant: "Demo Company"
- Test users with different roles (password: `password123`)
  - admin@coreflow360.com (SUPER_ADMIN)
  - manager@demo.com (ADMIN)
  - user@demo.com (USER)
- Sample departments and customers

## Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: coreflow360
- **Username**: postgres
- **Password**: postgres

## Common Commands

```bash
# View database logs
docker compose -f docker-compose.dev.yml logs -f postgres

# Stop services
docker compose -f docker-compose.dev.yml down

# Reset database (WARNING: destroys all data)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
./scripts/migrate-database.sh

# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Troubleshooting

### Docker not found
- Ensure Docker Desktop is installed and running
- On WSL, ensure WSL2 integration is enabled in Docker Desktop settings

### Database connection failed
- Check if PostgreSQL is running: `docker ps`
- Check logs: `docker compose -f docker-compose.dev.yml logs postgres`
- Verify DATABASE_URL in .env file

### Migration errors
- Ensure database is running before migrations
- Check for syntax errors in schema.prisma
- Run `npx prisma validate` to check schema

## Production Deployment

For production, use a managed PostgreSQL service:
- Vercel Postgres
- Supabase
- Neon
- Railway
- Amazon RDS

Update DATABASE_URL with your production database connection string.