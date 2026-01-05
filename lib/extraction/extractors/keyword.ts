import { BaseExtractor } from './base'
import type { FieldDefinition, FieldResult } from '../types'
import type { ExtractedText } from './base'

export class KeywordExtractor extends BaseExtractor {
  async extractField(
    text: ExtractedText,
    field: FieldDefinition
  ): Promise<FieldResult> {
    if (!field.keywords || field.keywords.length === 0) {
      return this.createFieldResult(field, null, 0, undefined, undefined)
    }

    const windowSize = field.windowSize || 200
    let bestMatch: { value: string; snippet: string; pageNumber?: number } | null = null

    const searchTexts = text.pages
      ? text.pages.map((p) => ({ text: p.text, pageNumber: p.pageNumber }))
      : [{ text: text.text, pageNumber: undefined }]

    for (const { text: sourceText, pageNumber } of searchTexts) {
      for (const keyword of field.keywords) {
        const keywordLower = keyword.toLowerCase()
        const index = sourceText.toLowerCase().indexOf(keywordLower)
        
        if (index !== -1) {
          const start = Math.max(0, index - windowSize)
          const end = Math.min(sourceText.length, index + keyword.length + windowSize)
          const snippet = sourceText.substring(start, end).trim()
          
          // Extract value after keyword (simple heuristic: next non-whitespace token)
          const afterKeyword = sourceText.substring(index + keyword.length).trim()
          const match = afterKeyword.match(/^[:\-\s]*([^\n\r,;]{1,100})/i)
          const value = match ? match[1].trim() : afterKeyword.substring(0, 100).trim()

          if (!bestMatch || value.length > bestMatch.value.length) {
            bestMatch = { value, snippet, pageNumber }
          }
        }
      }
    }

    if (!bestMatch) {
      return this.createFieldResult(field, null, 0, undefined, undefined)
    }

    return this.createFieldResult(
      field,
      this.parseValue(bestMatch.value, field.type),
      0.75, // Medium confidence for keyword matching
      bestMatch.snippet,
      bestMatch.pageNumber
    )
  }

  private parseValue(value: string, type: FieldDefinition['type']): any {
    const trimmed = value.trim()
    
    switch (type) {
      case 'number':
        const num = parseFloat(trimmed)
        return isNaN(num) ? null : num
      case 'boolean':
        return /^(true|yes|1)$/i.test(trimmed)
      case 'date':
        const date = new Date(trimmed)
        return isNaN(date.getTime()) ? null : date.toISOString()
      default:
        return trimmed
    }
  }
}
