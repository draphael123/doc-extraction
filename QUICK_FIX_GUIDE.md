# Quick Fix Guide for Server Error

## Error: "Application error: a server-side exception has occurred"

### Immediate Steps to Fix

1. **Check Vercel Logs** (Most Important!)
   - Go to: Vercel Dashboard → Your Project → Deployments → Latest
   - Click "Runtime Logs" or "Function Logs"
   - Look for the actual error message

2. **Verify Environment Variables**
   - Go to: Vercel Dashboard → Project Settings → Environment Variables
   - **CRITICAL**: Verify these are set:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Random secret (generate with: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` - Must be exactly: `https://your-app-name.vercel.app`
     - `VERCEL_BLOB_READ_WRITE_TOKEN` - From Vercel Blob storage
     - `WORKER_SECRET` - Random secret

3. **Test the New Endpoints**
   
   After deployment, test these URLs:
   - `https://your-app.vercel.app/api/health` - Basic health check
   - `https://your-app.vercel.app/api/test-db` - Database connection test
   - `https://your-app.vercel.app/api/test-auth` - Authentication test
   
   These will show you exactly what's failing.

4. **Run Database Migrations**
   
   If database connection works but tables are missing:
   ```bash
   # Install Vercel CLI if needed
   npm i -g vercel
   
   # Pull environment variables
   vercel login
   vercel env pull .env.local
   
   # Run migrations
   npx prisma db push
   ```

5. **Common Issues & Fixes**

   **Issue**: Database connection error
   - **Fix**: Verify `DATABASE_URL` is correct
   - **For Neon**: Use connection pooler URL if available
   
   **Issue**: NextAuth errors
   - **Fix**: Ensure `NEXTAUTH_URL` matches your Vercel URL exactly (no trailing slash)
   - **Fix**: Verify `NEXTAUTH_SECRET` is set
   
   **Issue**: Prisma client errors
   - **Fix**: Database might not have tables - run `npx prisma db push`
   
   **Issue**: Missing environment variables
   - **Fix**: Add all required variables in Vercel Dashboard

### Most Likely Fix (90% of cases)

**Missing `DATABASE_URL` or `NEXTAUTH_SECRET`**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add missing variables
3. Redeploy (or wait for auto-redeploy)

### After Fixing

1. Visit `https://your-app.vercel.app/api/health` - Should return `{"status":"ok"}`
2. Visit `https://your-app.vercel.app/api/test-db` - Should return database status
3. Visit `https://your-app.vercel.app/api/test-auth` - Should return auth status
4. Try accessing the main app

If all test endpoints work but main app fails, check the specific route logs in Vercel.
