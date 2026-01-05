# Quick Vercel Deployment Guide

Your code is now on GitHub: https://github.com/draphael123/doc-extraction.git

## Step-by-Step Vercel Deployment

### 1. Go to Vercel
Visit [vercel.com](https://vercel.com) and sign in (or create an account if you don't have one)

### 2. Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Select **"doc-extraction"** from your GitHub repositories
4. Click **"Import"**

### 3. Configure Project Settings
- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 4. Set Environment Variables
**CRITICAL**: You must add these environment variables before deploying:

Click **"Environment Variables"** and add each one:

#### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```
👉 Get from Neon or your PostgreSQL provider

```
NEXTAUTH_SECRET=your-generated-secret
```
👉 Generate with: `openssl rand -base64 32`

```
NEXTAUTH_URL=https://your-app-name.vercel.app
```
👉 Will be your Vercel URL (update after first deploy)

```
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```
👉 Get from Vercel Dashboard → Storage → Blob

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```
👉 Get from Upstash Dashboard → Redis

```
QSTASH_TOKEN=sig_xxx
```
👉 Get from Upstash Dashboard → QStash

```
WORKER_SECRET=your-random-secret
```
👉 Generate with: `openssl rand -base64 32`

#### Optional Variables:

```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```
👉 Get from GitHub OAuth App settings

```
OPENAI_API_KEY=xxx
```
👉 Only if using LLM extraction

### 5. Deploy!
1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

### 6. Post-Deployment Steps

#### Update NEXTAUTH_URL
1. Copy your Vercel deployment URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (Settings → Redeploy)

#### Set Up Database
1. Run migrations:
   ```bash
   npx prisma db push
   ```
   Or use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma db push
   ```

### 7. Quick Setup Checklist

#### Database (Neon - Recommended)
- [ ] Create account at [neon.tech](https://neon.tech)
- [ ] Create new project
- [ ] Copy connection string → Add as `DATABASE_URL`

#### Vercel Blob Storage
- [ ] Vercel Dashboard → Storage → Create → Blob
- [ ] Copy token → Add as `VERCEL_BLOB_READ_WRITE_TOKEN`

#### Upstash Redis & QStash
- [ ] Create account at [upstash.com](https://upstash.com)
- [ ] Create Redis database → Copy credentials
- [ ] Create QStash queue → Copy token
- [ ] Add all to environment variables

#### GitHub OAuth (Optional)
- [ ] GitHub → Settings → Developer settings → OAuth Apps
- [ ] Create new app
- [ ] Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
- [ ] Copy Client ID & Secret → Add to environment variables

### Troubleshooting

**Build fails?**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify `DATABASE_URL` is set correctly

**Database connection errors?**
- Verify `DATABASE_URL` is correct
- Check database allows external connections
- For Neon: Enable connection pooling if needed

**Worker not running?**
- Verify `WORKER_SECRET` is set and matches
- Check QStash dashboard for failed jobs
- Verify worker endpoint is accessible

**Authentication not working?**
- Update `NEXTAUTH_URL` to your production URL
- Verify `NEXTAUTH_SECRET` is set
- For GitHub OAuth: Check callback URL matches

### Next Steps After Deployment

1. ✅ Visit your deployed app
2. ✅ Sign in (GitHub or Email)
3. ✅ Create a test project
4. ✅ Upload a test PDF
5. ✅ Create an extraction template
6. ✅ Run extraction
7. ✅ Generate master PDF

Your app is now live! 🚀

For detailed documentation, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
