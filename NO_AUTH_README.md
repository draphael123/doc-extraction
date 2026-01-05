# No Authentication Required

The Document Scrapper app has been configured to work **without authentication**. Anyone can access and use the app directly.

## How It Works

- All projects are associated with a single "public user" ID: `public-user`
- No sign-in required
- All features are accessible without authentication
- The app uses this public user ID for all database operations

## Setup Required

Before using the app, you need to create the public user in your database:

### Option 1: Use the Seed Script (Recommended)

```bash
npm run db:seed
```

This will create the public user in your database.

### Option 2: Manual Database Insert

Run this SQL in your database:

```sql
INSERT INTO users (id, "createdAt", "updatedAt") 
VALUES ('public-user', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### Option 3: Via Prisma Studio

1. Run `npx prisma studio`
2. Go to the Users table
3. Create a new user with ID: `public-user`

## Environment Variables

**You no longer need**:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

**You still need**:
- `DATABASE_URL` - PostgreSQL connection string
- `VERCEL_BLOB_READ_WRITE_TOKEN` - For file storage
- `UPSTASH_REDIS_REST_URL` - For Redis (optional)
- `UPSTASH_REDIS_REST_TOKEN` - For Redis (optional)
- `QSTASH_TOKEN` - For queue processing (optional)
- `WORKER_SECRET` - For worker endpoint protection (optional)

## Notes

- All users share the same projects (since everything is associated with `public-user`)
- This is suitable for single-user or public demo use cases
- For multi-user scenarios, you may want to re-enable authentication

## Re-enabling Authentication

If you want to restore authentication in the future, you would need to:
1. Restore the `getCurrentUser()` calls in API routes
2. Restore authentication checks in pages
3. Re-add NextAuth environment variables
4. Update project queries to use actual user IDs instead of `PUBLIC_USER_ID`

