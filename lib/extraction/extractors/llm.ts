import { BaseExtractor } from './base'
import type { FieldDefinition, FieldResult } from '../types'
import type { ExtractedText } from './base'

export interface LLMProvider {
  extractField(text: string, field: FieldDefinition): Promise<{
    value: any
    confidence: number
    snippet?: string
  }>
}

// Stub implementation - replace with actual LLM provider
export class StubLLMProvider implements LLMProvider {
  async extractField(text: string, field: FieldDefinition): Promise<{
    value: any
    confidence: number
    snippet?: string
  }> {
    // TODO: Implement actual LLM extraction
    // Example: Use OpenAI API, Anthropic, etc.
    console.warn(`LLM extraction not implemented for field: ${field.fieldName}`)
    
    return {
      value: null,
      confidence: 0,
    }
  }
}

export class LLMExtractor extends BaseExtractor {
  private provider: LLMProvider

  constructor(provider?: LLMProvider) {
    super()
    this.provider = provider || new StubLLMProvider()
  }

  async extractField(
    text: ExtractedText,
    field: FieldDefinition
  ): Promise<FieldResult> {
    const result = await this.provider.extractField(text.text, field)
    
    return this.createFieldResult(
      field,
      result.value,
      result.confidence,
      result.snippet,
      text.pages?.[0]?.pageNumber
    )
  }
}
