import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import type { TextExtractor, ExtractedText } from './extractors/base'

export class PDFExtractor implements TextExtractor {
  async extract(buffer: Buffer, mimeType: string): Promise<ExtractedText> {
    if (!mimeType.includes('pdf')) {
      throw new Error('Not a PDF file')
    }

    try {
      const data = await pdfParse(buffer, {
        max: 0, // Parse all pages
      })

      // Split text by pages if available
      const pages: Array<{ pageNumber: number; text: string }> = []
      if (data.numpages > 1) {
        // pdf-parse doesn't provide per-page text directly
        // This is a simplified version - for production, consider pdfjs-dist
        const textPerPage = data.text.split(/\f/).filter(t => t.trim())
        textPerPage.forEach((text, idx) => {
          pages.push({
            pageNumber: idx + 1,
            text: text.trim(),
          })
        })
      } else {
        pages.push({
          pageNumber: 1,
          text: data.text,
        })
      }

      return {
        text: data.text,
        pages: pages.length > 1 ? pages : undefined,
      }
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export class DOCXExtractor implements TextExtractor {
  async extract(buffer: Buffer, mimeType: string): Promise<ExtractedText> {
    if (!mimeType.includes('wordprocessingml') && !mimeType.includes('officedocument.wordprocessingml')) {
      throw new Error('Not a DOCX file')
    }

    try {
      const result = await mammoth.extractRawText({ buffer })
      return {
        text: result.value,
      }
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export class TextExtractorImpl implements TextExtractor {
  async extract(buffer: Buffer, mimeType: string): Promise<ExtractedText> {
    const text = buffer.toString('utf-8')
    return { text }
  }
}

export class CSVExtractor implements TextExtractor {
  async extract(buffer: Buffer, mimeType: string): Promise<ExtractedText> {
    const text = buffer.toString('utf-8')
    // For CSV, we just return the raw text - extraction logic can parse it
    return { text }
  }
}

export function getTextExtractor(mimeType: string): TextExtractor {
  if (mimeType.includes('pdf')) {
    return new PDFExtractor()
  } else if (mimeType.includes('wordprocessingml') || mimeType.includes('officedocument.wordprocessingml')) {
    return new DOCXExtractor()
  } else if (mimeType.includes('csv') || mimeType.includes('text/csv')) {
    return new CSVExtractor()
  } else if (mimeType.startsWith('text/')) {
    return new TextExtractorImpl()
  }
  
  throw new Error(`Unsupported file type: ${mimeType}`)
}
