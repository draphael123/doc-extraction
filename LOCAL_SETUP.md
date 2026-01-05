# Local Setup Guide (No External Services)

This guide will help you run Document Scrapper **completely locally** without any external databases or cloud services!

## ✅ What's Included

- **SQLite Database** - File-based, no external database needed
- **Local File Storage** - Files stored in `storage/files/` directory
- **Simple Job Queue** - Processes batches directly (no Redis/QStash needed)
- **No External Services** - Everything runs on your machine

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# SQLite Database (file-based, no external DB needed!)
DATABASE_URL="file:./dev.db"

# Optional: Only needed if you want to customize
# WORKER_SECRET="local-dev-secret"
```

That's it! No other environment variables needed for local development.

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database and tables
npx prisma db push
```

This creates a `dev.db` file in your project root (SQLite database).

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 File Storage

Uploaded files are stored in:
```
storage/
  files/
    YYYY/
      MM/
        DD/
          timestamp-filename.pdf
```

Files are served via the `/api/files/[...path]` route automatically.

## 🔧 How It Works

### Database (SQLite)
- Uses a local `dev.db` file
- No external database connection needed
- All data stored locally on your machine

### File Storage
- Files saved to `storage/files/` directory
- Organized by date (YYYY/MM/DD)
- Served via Next.js API routes

### Job Processing
- Batches processed directly (no external queue)
- Runs in the background without blocking
- Simple and reliable for local development

## 📝 Notes

- **Database File**: The `dev.db` file contains all your data. Keep it safe!
- **Storage Directory**: The `storage/` folder contains all uploaded files
- **Git Ignore**: Both `dev.db` and `storage/` are in `.gitignore` (won't be committed)

## 🚀 Deploying to Production

If you want to deploy later, you can:
1. Switch back to PostgreSQL (change `prisma/schema.prisma`)
2. Use Vercel Blob or S3 for file storage
3. Use Upstash Redis/QStash for job queue

But for local development, everything works without external services!

## 🐛 Troubleshooting

**Database errors?**
- Make sure you ran `npx prisma db push`
- Check that `DATABASE_URL="file:./dev.db"` is in your `.env`

**File upload errors?**
- Make sure the `storage/` directory is writable
- Check that files are being created in `storage/files/`

**Job processing not working?**
- Check the browser console for errors
- Look at the server logs for processing errors

## 🎉 You're All Set!

You can now:
- ✅ Create projects
- ✅ Upload documents
- ✅ Create extraction templates
- ✅ Run extractions
- ✅ Generate PDFs

All without any external services!

