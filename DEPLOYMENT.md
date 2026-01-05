# Deployment Guide

## Quick Start Checklist

### 1. Database Setup (Neon recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (DATABASE_URL)
4. Add to Vercel environment variables

### 2. Vercel Blob Storage

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Blob
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add as `VERCEL_BLOB_READ_WRITE_TOKEN` in environment variables

### 3. Upstash Redis & QStash

1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database (free tier available)
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Create a QStash queue
5. Copy `QSTASH_TOKEN` and signing keys
6. Add all to Vercel environment variables

### 4. NextAuth Configuration

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```
2. Add as `NEXTAUTH_SECRET` in environment variables
3. Set `NEXTAUTH_URL` to your production URL (e.g., `https://your-app.vercel.app`)

### 5. GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. Copy Client ID and Secret
5. Add to environment variables

### 6. Worker Secret

1. Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```
2. Add as `WORKER_SECRET` in environment variables
3. This protects the worker endpoint from unauthorized access

### 7. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### 8. Post-Deployment

1. Run database migrations:
   ```bash
   npx prisma db push
   ```
   
   Or via Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

2. Update QStash webhook URL (if needed):
   - Should be: `https://your-app.vercel.app/api/worker/extract-batch`
   - QStash will automatically call this URL

## Environment Variables Summary

```env
# Required
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
VERCEL_BLOB_READ_WRITE_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
WORKER_SECRET=

# Optional
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OPENAI_API_KEY=
```

## Testing Deployment

1. Sign in to your application
2. Create a test project
3. Upload a test PDF
4. Create a simple extraction template
5. Run extraction
6. Verify results appear
7. Generate master PDF

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- For Neon, ensure connection pooling is enabled if needed

### Blob Storage Issues

- Verify VERCEL_BLOB_READ_WRITE_TOKEN is correct
- Check blob store exists in Vercel dashboard

### QStash Worker Not Running

- Verify WORKER_SECRET matches in environment variables
- Check QStash dashboard for failed jobs
- Verify worker URL is accessible (should be public endpoint)
- Check Vercel function logs for errors

### Authentication Issues

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches production URL exactly
- For GitHub OAuth, verify callback URL matches

### Build Failures

- Check Prisma schema is valid: `npx prisma validate`
- Ensure all dependencies are in package.json
- Check Vercel build logs for specific errors
