# Database Setup Guide

This guide explains how the automatic database initialization works and how to manage your database.

## Automatic Initialization

The GEMIJ journal application automatically initializes the database when the server starts. This means you don't need to manually run migration or seed commands in most cases.

### What Happens on Server Startup

When you start the server with `npm run dev` or `npm start`, the following happens automatically:

1. **Database Connection Check** - Waits for the database to be available (with retry logic)
2. **Run Migrations** - Applies any pending Prisma migrations to update the database schema
3. **Seed Data** - If the database is empty, populates it with:
   - Admin user (email: `admin@journal.com`, password: `admin123`)
   - Sample users (editor, reviewer, author)
   - Email templates for all notification types
   - System settings (journal name, APC amount, etc.)
   - Sample issues and articles

### Server Startup Logs

You'll see clear logs indicating the initialization progress:

```
⏳ Waiting for database to be available...
✅ Database is available
🔄 Running database migrations...
✅ Database migrations completed successfully
📊 Database is empty, running seed script...
🌱 Seeding database with initial data...
✅ Database seeded successfully
✅ Database initialization completed successfully!

🚀 Academic Journal API server running on port 5000
📚 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

## Manual Database Commands

While automatic initialization handles most scenarios, you can also manage the database manually:

### Initialize Database

Run migrations and seed data:

```bash
npm run db:init
```

### Check Migration Status

See which migrations have been applied:

```bash
npm run db:status
```

### Run Migrations Only

Apply pending migrations without seeding:

```bash
npm run db:deploy
```

### Seed Database Only

Populate the database with initial data:

```bash
npm run db:seed
```

### Reset Database

**⚠️ Warning: This will delete all data!**

Drop the database, recreate it, run all migrations, and seed:

```bash
npm run db:reset
```

### Open Prisma Studio

Browse and edit database records with a GUI:

```bash
npm run db:studio
```

## Environment Variables

Make sure your `.env` file contains the correct database connection string:

```env
DATABASE_URL="postgresql://journal_user:journal_password@localhost:5432/journal_db"
```

### For Docker Compose

If using Docker Compose, the database URL should point to the container:

```env
DATABASE_URL="postgresql://journal_user:journal_password@postgres:5432/journal_db"
```

## Default Users

After seeding, you can log in with these default accounts:

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@journal.com      | admin123     |
| Editor   | editor@journal.com     | editor123    |
| Reviewer | reviewer@journal.com   | reviewer123  |
| Author   | author@journal.com     | author123    |

**⚠️ Important:** Change these passwords in production!

## Troubleshooting

### Database Connection Failed

If you see database connection errors:

1. **Check if PostgreSQL is running:**
   ```bash
   # For Docker Compose
   docker-compose ps
   
   # For local PostgreSQL
   pg_isready
   ```

2. **Verify DATABASE_URL in .env:**
   - Check hostname (localhost vs postgres)
   - Verify port (default: 5432)
   - Confirm username and password
   - Ensure database name is correct

3. **Check PostgreSQL logs:**
   ```bash
   # For Docker Compose
   docker-compose logs postgres
   ```

### Migrations Failed

If migrations fail:

1. **Check migration status:**
   ```bash
   npm run db:status
   ```

2. **Reset and try again:**
   ```bash
   npm run db:reset
   ```

3. **Manual migration:**
   ```bash
   cd server
   npx prisma migrate dev
   ```

### Seed Script Errors

If seeding fails:

1. **Check if data already exists:**
   - The seed script uses `upsert` to avoid duplicates
   - Existing data won't cause errors

2. **Run seed manually to see detailed errors:**
   ```bash
   npm run db:seed
   ```

3. **Reset database if needed:**
   ```bash
   npm run db:reset
   ```

### Server Won't Start

If the server fails to start due to database issues:

1. **Check the error message** - It will indicate what failed
2. **Verify database is running** - Use `docker-compose ps` or `pg_isready`
3. **Try manual initialization:**
   ```bash
   npm run db:init
   ```
4. **Check database logs** for connection issues

## Production Deployment

For production environments:

1. **Set DATABASE_URL** to your production database
2. **Run migrations** before deploying:
   ```bash
   npm run db:deploy
   ```
3. **Seed production data** (optional):
   ```bash
   npm run db:seed
   ```
4. **Change default passwords** immediately after first deployment
5. **Set NODE_ENV=production** in your environment

## Database Backup

Regular backups are recommended:

```bash
# Backup
pg_dump -U journal_user journal_db > backup.sql

# Restore
psql -U journal_user journal_db < backup.sql
```

For Docker Compose:

```bash
# Backup
docker-compose exec postgres pg_dump -U journal_user journal_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U journal_user journal_db < backup.sql
```

## Schema Changes

When you modify `prisma/schema.prisma`:

1. **Create a migration:**
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

2. **The migration will be applied automatically** on next server start

3. **For production, deploy the migration:**
   ```bash
   npm run db:deploy
   ```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
