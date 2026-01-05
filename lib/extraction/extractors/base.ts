import type { FieldDefinition, FieldResult } from '../types'

export interface ExtractedText {
  text: string
  pages?: Array<{ pageNumber: number; text: string }>
}

export interface TextExtractor {
  extract(buffer: Buffer, mimeType: string): Promise<ExtractedText>
}

export abstract class BaseExtractor {
  abstract extractField(
    text: ExtractedText,
    field: FieldDefinition
  ): Promise<FieldResult>

  protected createFieldResult(
    field: FieldDefinition,
    value: any,
    confidence: number,
    sourceSnippet?: string,
    sourcePage?: number
  ): FieldResult {
    let status: 'ok' | 'needs_review' | 'missing' = 'ok'
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      status = field.required ? 'missing' : 'ok'
      value = null
    } else if (confidence < 0.7) {
      status = 'needs_review'
    }

    return {
      fieldName: field.fieldName,
      value,
      confidence,
      sourceSnippet,
      sourcePage,
      status,
    }
  }
}
