# Quick Database Setup Guide

## The Error You're Seeing

If you see: **"Environment variable not found: DATABASE_URL"**, you need to set up your database connection.

## Option 1: Quick Setup with Neon (Recommended - Free)

Neon provides free PostgreSQL databases perfect for this project.

### Steps:

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account

2. **Create a Database**
   - Click "Create Project"
   - Give it a name (e.g., "document-scrapper")
   - Select a region close to you
   - Click "Create Project"

3. **Get Your Connection String**
   - After creating, you'll see a connection string that looks like:
     ```
     postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - Click "Copy" to copy it

4. **Set Up Locally**
   - Create a `.env` file in your project root:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and paste your `DATABASE_URL`:
     ```env
     DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
     ```

5. **Set Up Database Schema**
   ```bash
   npx prisma db push
   ```

6. **For Vercel Deployment**
   - Go to your Vercel project settings
   - Click "Environment Variables"
   - Add `DATABASE_URL` with your Neon connection string
   - Redeploy your app

## Option 2: Use Your Own PostgreSQL Database

If you have your own PostgreSQL database:

1. Get your connection string:
   ```
   postgresql://username:password@host:5432/database?schema=public
   ```

2. Add it to `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   ```

## Quick Test

After setting up `DATABASE_URL`, test it:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

If everything works, you should be able to create projects without errors!

## Troubleshooting

**Still seeing errors?**
- Make sure `.env` file exists in the project root
- Make sure `DATABASE_URL` is in quotes: `DATABASE_URL="..."` 
- Restart your dev server after adding the variable
- Check that your database allows connections from your IP

**For Vercel:**
- Make sure `DATABASE_URL` is added in Vercel project settings
- Redeploy after adding environment variables
- Check Vercel build logs for database connection errors

