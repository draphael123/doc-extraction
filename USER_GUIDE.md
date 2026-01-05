# Document Scrapper - User Guide

Welcome to Document Scrapper! This guide will walk you through using the platform to extract information from large document bases.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Projects](#creating-projects)
3. [Uploading Documents](#uploading-documents)
4. [Creating Extraction Templates](#creating-extraction-templates)
5. [Running Extraction Jobs](#running-extraction-jobs)
6. [Reviewing Results](#reviewing-results)
7. [Generating Master PDFs](#generating-master-pdfs)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Steps

1. **Navigate to the Platform**: Open the Document Scrapper in your web browser
2. **Landing Page**: You'll see the main projects page where all your projects are listed
3. **No Sign-In Required**: The platform is publicly accessible - no authentication needed!

---

## Creating Projects

Projects help you organize your document extraction workflows.

### How to Create a Project

1. **Click "New Project"**: On the main page, click the purple "New Project" button in the top right
2. **Enter Project Details**:
   - **Project Name** (Required): Give your project a descriptive name (e.g., "Q4 2024 Invoices")
   - **Description** (Optional): Add a brief description to help you remember what this project is for
3. **Click "Create"**: Your project will be created and you'll be redirected to the project dashboard

### Project Dashboard Overview

The project dashboard has four main tabs:
- **Documents**: Upload and manage your documents
- **Templates**: Create and manage extraction templates
- **Extraction**: Run extraction jobs
- **Results**: View and review extracted data

---

## Uploading Documents

### Supported File Types

- **PDF** (`.pdf`) - PDF documents
- **Word Documents** (`.docx`) - Microsoft Word documents
- **Text Files** (`.txt`) - Plain text files
- **CSV Files** (`.csv`) - Comma-separated values
- **ZIP Archives** (`.zip`) - Compressed folders containing any of the above

### How to Upload Documents

1. **Navigate to Documents Tab**: Click on the "Documents" tab in your project dashboard
2. **Upload Methods**:
   - **Drag & Drop**: Drag files from your computer directly onto the upload area
   - **Click to Select**: Click on the upload area to open a file browser
   - **Multiple Files**: You can upload multiple files at once
   - **ZIP Files**: Upload a ZIP file containing multiple documents (they'll be extracted automatically)
3. **Wait for Upload**: Files will be uploaded and stored securely
4. **View Uploaded Documents**: Once uploaded, you'll see a list of all documents with their status:
   - **PENDING**: Document is uploaded but not yet processed
   - **PROCESSING**: Document is currently being extracted
   - **COMPLETED**: Extraction is complete
   - **FAILED**: An error occurred during processing

### Document Status

- Documents are stored securely in cloud storage
- You can upload hundreds or thousands of documents
- Large files are processed in batches to avoid timeouts

---

## Creating Extraction Templates

Templates define what information you want to extract from your documents.

### What is a Template?

A template specifies:
- **Fields**: What data to extract (e.g., Invoice Number, Date, Amount)
- **Extraction Methods**: How to find the data (Regex, Keyword + Window, or LLM)
- **Field Types**: The data type (string, number, date, boolean)

### How to Create a Template

1. **Navigate to Templates Tab**: Click on the "Templates" tab
2. **Click "New Template"**: Click the purple "New Template" button
3. **Enter Template Details**:
   - **Template Name**: Give it a descriptive name (e.g., "Invoice Extraction")
   - **Description** (Optional): Describe what this template extracts
4. **Add Fields**: For each piece of information you want to extract:
   - Click "Add Field" to add a new field
   - **Field Name**: The name of the field (e.g., `invoice_number`)
   - **Description**: What this field represents
   - **Type**: Choose from String, Number, Date, or Boolean
   - **Extraction Method**: Choose how to extract:
     - **Regex**: Use regular expressions (for structured patterns)
     - **Keyword + Window**: Find text near keywords (for flexible extraction)
     - **LLM**: Use AI/LLM extraction (coming soon)
   - **Required**: Check if this field must be found
   - **Remove Field**: Click the trash icon to remove a field

### Extraction Methods Explained

#### Regex Method
- **Best for**: Structured, predictable formats (e.g., "Invoice #12345", "Date: 2024-01-15")
- **Pattern**: Enter a regular expression pattern
- **Flags** (optional): Add regex flags (e.g., `gi` for global, case-insensitive)
- **Example Pattern**: `Invoice #(\d+)` to extract invoice numbers

#### Keyword + Window Method
- **Best for**: Finding information near specific keywords
- **Keywords**: Enter comma-separated keywords (e.g., "Invoice Number, Invoice #")
- **Window Size**: Number of characters to search around the keyword (default: 200)
- **How it works**: Finds the keyword, then extracts text within the specified window

#### LLM Method
- **Status**: Coming soon
- **Use case**: For complex, unstructured extraction where patterns are unclear

### Example Template

**Template Name**: Invoice Extraction

**Fields**:
1. **Invoice Number**
   - Type: String
   - Method: Regex
   - Pattern: `Invoice #(\d+)`
   - Required: Yes

2. **Date**
   - Type: Date
   - Method: Keyword + Window
   - Keywords: "Invoice Date, Date, Issued"
   - Window: 200
   - Required: Yes

3. **Total Amount**
   - Type: Number
   - Method: Keyword + Window
   - Keywords: "Total, Amount Due, Sum"
   - Window: 150
   - Required: Yes

---

## Running Extraction Jobs

Once you have documents uploaded and templates created, you can run extraction jobs.

### How to Run an Extraction

1. **Navigate to Extraction Tab**: Click on the "Extraction" tab
2. **Select a Template**: Choose which template to use for extraction from the dropdown
3. **Click "Start Extraction"**: Click the green "Start Extraction" button
4. **Monitor Progress**: 
   - The job status will appear below
   - You'll see progress updates (total docs, processed, failed)
   - Status indicators:
     - **PENDING**: Job is queued
     - **RUNNING**: Job is in progress
     - **COMPLETED**: Job finished successfully
     - **FAILED**: Job encountered an error

### How Extraction Works

- Documents are processed in **batches** (typically 10-50 documents per batch)
- This prevents serverless timeout issues
- Progress is saved frequently, so you can monitor real-time updates
- Large document bases (thousands of files) are handled automatically
- If a document fails, others continue processing

### Job Status

- **Total Documents**: Number of documents in the job
- **Processed**: Documents successfully extracted
- **Failed**: Documents that encountered errors
- **Progress**: Percentage complete
- **Started/Completed**: Timestamps

---

## Reviewing Results

After extraction completes, review and edit the extracted data.

### How to View Results

1. **Navigate to Results Tab**: Click on the "Results" tab
2. **Select a Template**: Choose which template's results to view
3. **View the Results Table**: You'll see a table with:
   - **Document**: Document name
   - **Status**: Overall extraction status (OK, NEEDS_REVIEW, MISSING)
   - **Field Results**: Status for each field

### Result Statuses

- **OK**: Field was extracted successfully
- **NEEDS_REVIEW**: Extraction found something but confidence is low
- **MISSING**: Field was not found

### Filtering Results

- **Show Needs Review**: Toggle to show only documents that need review
- **Confidence Threshold**: Adjust the slider to filter by confidence score (0-1)
  - Lower threshold (e.g., 0.5) shows more results
  - Higher threshold (e.g., 0.9) shows only high-confidence extractions

### Editing Results

1. **Click on a Document**: Click on a document row to open the detail view
2. **View Field Details**:
   - Extracted value
   - Confidence score
   - Source snippet (the text where it was found)
   - Page number (if available)
3. **Edit Values**: You can edit extracted values directly
4. **Mark as Approved**: Once reviewed, mark fields as approved

### Exporting Data

- Results can be exported (feature may vary)
- Data is stored in the database and accessible via API

---

## Generating Master PDFs

Create a compiled PDF with all extracted information organized by document.

### How to Generate a Master PDF

1. **Navigate to Results Tab**: Make sure you're viewing results
2. **Select a Template**: Choose the template whose results you want to compile
3. **Click "Generate Master PDF"**: Click the orange "Generate Master PDF" button
4. **Wait for Generation**: PDF generation may take a moment for large document sets
5. **Download PDF**: The PDF will open in a new tab/window for download

### Master PDF Contents

The generated PDF includes:

1. **Cover Page**:
   - Project name
   - Template name
   - Generation timestamp

2. **Table of Contents**:
   - List of all documents
   - Page numbers for each document section

3. **Document Sections** (one per document):
   - **Document Title**
   - **Extracted Fields**: Two-column layout showing Field Name / Value
   - **Evidence Block** (optional): Source snippets with page numbers

### PDF Features

- Professional formatting
- Automatically generated page numbers
- Searchable text
- Organized by document
- Easy to share and archive

---

## Tips & Best Practices

### Template Design

1. **Start Simple**: Begin with 2-3 essential fields
2. **Test on Sample Documents**: Test your template on a few documents before running on the full set
3. **Use Specific Patterns**: More specific regex patterns reduce false positives
4. **Keyword Selection**: Choose keywords that are unique to the field you want
5. **Window Size**: Adjust window size based on document structure (smaller for dense text, larger for spread-out content)

### Document Upload

1. **Batch Upload**: Upload documents in batches if you have hundreds or thousands
2. **Organize by Project**: Use separate projects for different document types or time periods
3. **ZIP Archives**: Use ZIP files for bulk uploads of related documents
4. **File Naming**: Use descriptive filenames to make results easier to review

### Extraction Best Practices

1. **Run Test Extractions**: Start with a small subset to test your template
2. **Review Sample Results**: Check a few results before processing the full batch
3. **Iterate on Templates**: Refine templates based on initial results
4. **Monitor Progress**: Keep an eye on failed documents and adjust templates as needed

### Results Management

1. **Review High-Confidence First**: Start with high-confidence extractions, then review lower-confidence items
2. **Use Filters**: Leverage the confidence threshold and "needs review" filters
3. **Document Issues**: Note any patterns in failed extractions to improve templates
4. **Export Regularly**: Generate master PDFs periodically to archive progress

### Performance Tips

1. **Large Document Sets**: The platform handles thousands of documents automatically through batching
2. **Be Patient**: Large extractions take time - progress is saved, so you don't lose work
3. **Failed Documents**: Some documents may fail due to format issues - this is normal for large sets
4. **Check Status**: Monitor job status and document status regularly

---

## Troubleshooting

### Documents Not Uploading

- Check file size limits
- Verify file format is supported
- Try uploading files individually first

### Extraction Not Finding Fields

- Review your template patterns/keywords
- Check source snippets to see what text is available
- Adjust regex patterns or keywords
- Try increasing the window size for keyword extraction

### Jobs Failing

- Check document format (some PDFs may be image-based or encrypted)
- Review error messages in the document status
- Try reprocessing individual documents
- Contact support if issues persist

### Low Confidence Scores

- This is normal - not all fields can be extracted with high confidence
- Use the confidence threshold to filter results
- Review and edit low-confidence fields manually
- Refine templates to improve extraction patterns

---

## Need Help?

- **Documentation**: Check this guide and other documentation files
- **Error Messages**: Read error messages carefully - they often indicate the issue
- **Template Testing**: Test templates on sample documents before full runs
- **Support**: For technical issues, check logs and error messages

---

## Quick Reference

| Task | Steps |
|------|-------|
| Create Project | Home → New Project → Enter details → Create |
| Upload Documents | Project → Documents Tab → Drag/Click → Upload |
| Create Template | Project → Templates Tab → New Template → Add Fields → Create |
| Run Extraction | Project → Extraction Tab → Select Template → Start Extraction |
| View Results | Project → Results Tab → Select Template → Review table |
| Generate PDF | Project → Results Tab → Select Template → Generate Master PDF |

---

**Happy Document Extracting! 🚀**

