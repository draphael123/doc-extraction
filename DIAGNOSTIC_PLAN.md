# Diagnostic Plan for Server-Side Error

## Error Information
- Error: "Application error: a server-side exception has occurred"
- Digest: 3030861406
- This is a Next.js runtime error (not a build error)

## Step-by-Step Diagnostic Plan

### Phase 1: Check Vercel Logs (Primary Investigation)

1. **Access Vercel Deployment Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Click "Runtime Logs" or "Function Logs"
   - Look for stack traces, error messages, or exceptions

2. **Check Function Logs Specifically**
   - Navigate to: Vercel Dashboard → Project → Functions
   - Check each API route's logs for errors
   - Pay special attention to routes that run on page load

### Phase 2: Common Causes Checklist

#### A. Environment Variables Missing
**Symptoms**: Prisma connection errors, authentication failures
**Check**:
- Verify all required env vars are set in Vercel:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `VERCEL_BLOB_READ_WRITE_TOKEN`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `QSTASH_TOKEN`
  - `WORKER_SECRET`

**Fix**: Add missing variables in Vercel Dashboard → Settings → Environment Variables

#### B. Database Connection Issues
**Symptoms**: Prisma client errors, connection timeouts
**Check**:
- Verify `DATABASE_URL` is correct format
- Check if database allows connections from Vercel IPs
- For Neon: Check if connection pooling is enabled correctly

**Fix**:
```bash
# Test database connection
vercel env pull .env.local
npx prisma db push
```

#### C. Prisma Client Not Generated
**Symptoms**: "PrismaClient is not initialized" errors
**Check**: Verify build process includes `prisma generate`

**Fix**: Already in `vercel.json` build command, but verify it runs

#### D. NextAuth Configuration Issues
**Symptoms**: Session/auth errors
**Check**:
- `NEXTAUTH_URL` matches production URL exactly
- `NEXTAUTH_SECRET` is set and valid
- GitHub OAuth credentials if using GitHub auth

#### E. Runtime Errors in API Routes
**Symptoms**: Specific route failures
**Check**:
- Routes using `getCurrentUser()` without proper error handling
- Routes accessing database before Prisma client is ready
- Missing try-catch blocks

#### F. Missing Dependencies
**Symptoms**: Module not found errors
**Check**: All packages in `package.json` are installed

### Phase 3: Quick Fixes to Implement

1. **Add Error Boundary to Root Layout**
   - Catch and display errors gracefully

2. **Add Better Error Handling to Critical Routes**
   - Wrap `getCurrentUser()` calls in try-catch
   - Add error logging

3. **Verify Prisma Client Initialization**
   - Ensure singleton pattern is working correctly

4. **Add Health Check Endpoint**
   - Create `/api/health` to test basic functionality

### Phase 4: Systematic Debugging Steps

1. **Create Minimal Test Endpoint**
   ```typescript
   // app/api/test/route.ts
   export async function GET() {
     return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
   }
   ```
   - Deploy and test: `https://your-app.vercel.app/api/test`
   - If this works, issue is in specific routes

2. **Test Database Connection**
   ```typescript
   // app/api/test-db/route.ts
   import { prisma } from '@/lib/prisma'
   export async function GET() {
     try {
       await prisma.$connect()
       return Response.json({ status: 'connected' })
     } catch (error) {
       return Response.json({ error: String(error) }, { status: 500 })
     }
   }
   ```

3. **Test Authentication**
   ```typescript
   // app/api/test-auth/route.ts
   import { getCurrentUser } from '@/lib/auth'
   export async function GET() {
     try {
       const user = await getCurrentUser()
       return Response.json({ user: user ? 'authenticated' : 'not authenticated' })
     } catch (error) {
       return Response.json({ error: String(error) }, { status: 500 })
     }
   }
   ```

### Phase 5: Most Likely Issues (Prioritized)

Based on common deployment issues:

1. **Missing NEXTAUTH_URL** (High Priority)
   - Must match production URL exactly
   - Format: `https://your-app.vercel.app` (no trailing slash)

2. **Database Connection String** (High Priority)
   - Connection pooling URL needed for serverless
   - Neon: Use `?pgbouncer=true` or connection pooler URL

3. **Prisma Client Generation** (Medium Priority)
   - Verify `prisma generate` runs in build
   - Check for Prisma schema errors

4. **Environment Variable Format** (Medium Priority)
   - Ensure no extra spaces or quotes
   - Verify all secrets are set

5. **Runtime Error in getCurrentUser** (Lower Priority)
   - Check if `getServerSession` fails silently

## Immediate Actions

1. **Check Vercel Logs First** - This will tell you exactly what's failing
2. **Verify All Environment Variables** - Most common cause
3. **Test Database Connection** - Second most common
4. **Add Test Endpoints** - Isolate the issue
5. **Check Specific Route Logs** - Which route is failing?

## Next Steps After Diagnosis

Once you identify the specific error from logs:
- Database error → Fix connection string or permissions
- Auth error → Fix NextAuth configuration
- Module error → Check dependencies
- Runtime error → Add error handling
- Type error → Fix TypeScript issues

