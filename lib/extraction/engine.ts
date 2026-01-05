import type { FieldDefinition, FieldResult } from './types'
import type { ExtractedText } from './extractors/base'
import { RegexExtractor } from './extractors/regex'
import { KeywordExtractor } from './extractors/keyword'
import { LLMExtractor } from './extractors/llm'
import { BaseExtractor } from './extractors/base'

export class ExtractionEngine {
  private extractors: Map<string, BaseExtractor>

  constructor(llmProvider?: import('./extractors/llm').LLMProvider) {
    this.extractors = new Map()
    this.extractors.set('regex', new RegexExtractor())
    this.extractors.set('keyword+window', new KeywordExtractor())
    this.extractors.set('llm', new LLMExtractor(llmProvider))
  }

  async extractFields(
    text: ExtractedText,
    fields: FieldDefinition[]
  ): Promise<FieldResult[]> {
    const results: FieldResult[] = []

    for (const field of fields) {
      const extractor = this.extractors.get(field.extractionMethod)
      if (!extractor) {
        results.push({
          fieldName: field.fieldName,
          value: null,
          confidence: 0,
          status: 'missing',
        })
        continue
      }

      try {
        const result = await extractor.extractField(text, field)
        results.push(result)
      } catch (error) {
        console.error(`Extraction failed for field ${field.fieldName}:`, error)
        results.push({
          fieldName: field.fieldName,
          value: null,
          confidence: 0,
          status: 'missing',
        })
      }
    }

    return results
  }
}
