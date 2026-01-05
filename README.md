# Document Scrapper

A production-ready web application for ingesting, extracting, and managing information from large document bases (thousands+ files).

## Features

- **Document Ingestion**
  - Upload multiple files (drag & drop)
  - Upload ZIP archives
  - Support for PDF, DOCX, TXT, CSV files
  - Store files in Vercel Blob (or S3-compatible storage)

- **Information Extraction**
  - Define custom extraction templates with multiple fields
  - Multiple extraction methods:
    - **Regex**: Pattern-based extraction with capture groups
    - **Keyword + Window**: Extract values near keywords
    - **LLM**: Pluggable interface (stub implementation included)
  - Batch processing for large document sets
  - Progress tracking and job status monitoring

- **Data Management**
  - Review and edit extracted fields
  - Filter results by confidence, status, etc.
  - Store extraction results in PostgreSQL

- **Master PDF Generation**
  - Generate compiled PDFs with table of contents
  - Clean two-column layout for extracted fields
  - Per-document sections with evidence snippets

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui components
- **Database**: PostgreSQL (Neon recommended) + Prisma ORM
- **Storage**: Vercel Blob (or S3-compatible adapter)
- **Queue**: Upstash Redis + QStash for background processing
- **Auth**: NextAuth.js (GitHub/Email)
- **PDF Processing**: pdf-lib, pdf-parse
- **Text Extraction**: pdf-parse, mammoth (DOCX)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended for serverless)
- Vercel account (for Blob storage)
- Upstash account (for Redis and QStash)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd document-scrapper
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Vercel Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# QStash
QSTASH_TOKEN="sig_xxx"
QSTASH_CURRENT_SIGNING_KEY="sig_xxx"
QSTASH_NEXT_SIGNING_KEY="sig_xxx"

# Worker Secret (for protecting worker endpoints)
WORKER_SECRET="your-worker-secret-here"

# Optional: OpenAI for LLM extraction
OPENAI_API_KEY=""
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Local Development

### Database Setup

1. Create a PostgreSQL database (use Neon for free serverless PostgreSQL)
2. Update `DATABASE_URL` in `.env`
3. Run migrations:

```bash
npx prisma db push
```

### Generating NextAuth Secret

```bash
openssl rand -base64 32
```

### Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── projects/     # Project management
│   │   ├── templates/    # Template management
│   │   ├── extract/      # Extraction job management
│   │   ├── worker/       # Background worker (protected)
│   │   ├── jobs/         # Job status
│   │   ├── results/      # Extraction results
│   │   └── pdf/          # PDF generation
│   ├── projects/[id]/    # Project dashboard
│   ├── auth/             # Authentication pages
│   └── page.tsx          # Landing page
├── lib/
│   ├── extraction/       # Extraction engine
│   │   ├── extractors/   # Regex, Keyword, LLM extractors
│   │   └── text-extractors.ts
│   ├── storage/          # Blob storage adapter
│   ├── queue/            # QStash integration
│   └── prisma.ts         # Prisma client
├── components/
│   └── ui/               # shadcn/ui components
└── prisma/
    └── schema.prisma     # Database schema
```

## Deployment to Vercel

### Prerequisites

- Vercel account
- All environment variables configured
- Database and storage services set up

### Steps

1. **Push your code to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import project to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

3. **Configure environment variables**

Add all environment variables from your `.env` file in the Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

4. **Configure build settings**

- Framework Preset: Next.js
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)

5. **Deploy**

- Click "Deploy"
- Wait for build to complete

### Post-Deployment

1. **Run database migrations**

After first deployment, you may need to run migrations:

```bash
npx prisma db push
```

Or use Vercel's CLI:

```bash
vercel env pull .env.local
npx prisma db push
```

2. **Update QStash webhook URL**

Update your QStash configuration to point to your production URL:

```
https://your-app.vercel.app/api/worker/extract-batch
```

## Usage Guide

### Creating a Project

1. Sign in to the application
2. Click "New Project" on the landing page
3. Enter a name and optional description
4. Click "Create"

### Uploading Documents

1. Navigate to your project
2. Go to the "Documents" tab
3. Drag and drop files or click to select
4. Supported formats: PDF, DOCX, TXT, CSV, ZIP

### Creating an Extraction Template

1. Go to the "Templates" tab
2. Click "New Template"
3. Enter template name and description
4. Add fields:
   - Field name
   - Type (string, number, date, boolean)
   - Extraction method (regex, keyword+window, LLM)
   - Configuration based on method
5. Click "Create"

### Running Extraction

1. Go to the "Extraction" tab
2. Select a template
3. Click "Start Extraction"
4. Monitor progress in the jobs table

### Viewing Results

1. Go to the "Results" tab
2. Select a template
3. View extracted data
4. Filter by confidence or status
5. Click eye icon to view details

### Generating Master PDF

1. Go to the "Results" tab
2. Select a template
3. Click "Generate Master PDF"
4. PDF will open in a new tab

## Architecture Notes

### Batch Processing

Documents are processed in batches (default: 20 per batch) to avoid serverless timeout limits. The extraction workflow:

1. User starts extraction job
2. Documents are split into batches
3. Each batch is enqueued to QStash
4. Worker endpoint processes batches
5. Progress is tracked and updated in database
6. UI polls for job status updates

### Extraction Methods

- **Regex**: Uses JavaScript RegExp with capture groups
- **Keyword + Window**: Finds keywords and extracts surrounding text
- **LLM**: Stub implementation - replace `StubLLMProvider` with actual LLM integration

### File Storage

Files are stored in Vercel Blob by default. To use S3-compatible storage:

1. Implement `BlobAdapter` interface
2. Update `lib/storage/blob.ts`
3. Configure S3 credentials in environment variables

## Limitations & Considerations

- **Serverless Timeouts**: Vercel has execution time limits (10s Hobby, 60s Pro). Batch processing helps, but very large files may still timeout.
- **Memory Limits**: Large files are streamed when possible, but PDF parsing may load files into memory.
- **LLM Extraction**: Currently stubbed. Implement with OpenAI, Anthropic, or other providers.
- **OCR**: Image OCR is not implemented. Add via `TextExtractor` interface for image files.

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

### Prisma Studio

```bash
npx prisma studio
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
