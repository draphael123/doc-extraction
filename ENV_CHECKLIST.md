# Environment Variables Checklist

## CRITICAL - Check These First!

If you're seeing "Application error: a server-side exception has occurred", **99% of the time it's missing environment variables**.

### Step 1: Go to Vercel Dashboard
1. Navigate to: [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Verify ALL of these are set:

### Required Environment Variables (MUST HAVE):

```env
# Database - REQUIRED
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# NextAuth - REQUIRED
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Worker Secret - REQUIRED
WORKER_SECRET=your-worker-secret-here
```

### Important Environment Variables (Should Have):

```env
# Vercel Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# QStash
QSTASH_TOKEN=sig_xxx
```

### Optional (But Recommended):

```env
# GitHub OAuth (optional)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

## Quick Test After Setting Variables:

1. Visit: `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok",...}`

2. Visit: `https://your-app.vercel.app/api/test-db`
   - Should show database connection status

3. Visit: `https://your-app.vercel.app/api/test-auth`
   - Should show authentication configuration status

## Common Issues:

### Issue 1: DATABASE_URL Missing
**Error**: Prisma connection errors
**Fix**: Add DATABASE_URL from your database provider (Neon, Supabase, etc.)

### Issue 2: NEXTAUTH_SECRET Missing
**Error**: NextAuth configuration errors
**Fix**: Generate with: `openssl rand -base64 32`

### Issue 3: NEXTAUTH_URL Incorrect
**Error**: Session/auth errors
**Fix**: Must exactly match: `https://your-app-name.vercel.app` (no trailing slash!)

### Issue 4: All Variables Set But Still Error
**Fix**: 
1. Check Vercel Runtime Logs for exact error
2. Redeploy after setting variables (or wait for auto-redeploy)
3. Verify variable names match exactly (case-sensitive)

## After Setting Variables:

1. Save all environment variables in Vercel
2. Wait for auto-redeploy (or trigger manual redeploy)
3. Check deployment logs to confirm success
4. Test the health endpoints listed above
