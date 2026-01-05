import { BaseExtractor } from './base'
import type { FieldDefinition, FieldResult, ExtractedText } from './types'

export class RegexExtractor extends BaseExtractor {
  async extractField(
    text: ExtractedText,
    field: FieldDefinition
  ): Promise<FieldResult> {
    if (!field.pattern) {
      return this.createFieldResult(field, null, 0, undefined, undefined)
    }

    const flags = field.flags || 'gi'
    const regex = new RegExp(field.pattern, flags)
    
    let match: RegExpMatchArray | null = null
    let sourceText = text.text
    let pageNumber: number | undefined

    // Try to find match in full text first
    match = sourceText.match(regex)

    // If we have pages, try to find match with page context
    if (!match && text.pages) {
      for (const page of text.pages) {
        const pageMatch = page.text.match(regex)
        if (pageMatch) {
          match = pageMatch
          sourceText = page.text
          pageNumber = page.pageNumber
          break
        }
      }
    }

    if (!match || !match[0]) {
      return this.createFieldResult(field, null, 0, undefined, undefined)
    }

    const value = match[1] || match[0] // Use capture group if available
    const startIndex = Math.max(0, (match.index || 0) - 50)
    const endIndex = Math.min(sourceText.length, (match.index || 0) + match[0].length + 50)
    const snippet = sourceText.substring(startIndex, endIndex).trim()

    // Confidence based on whether we found a match
    const confidence = match[0] ? 0.8 : 0

    return this.createFieldResult(
      field,
      this.parseValue(value, field.type),
      confidence,
      snippet,
      pageNumber
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
