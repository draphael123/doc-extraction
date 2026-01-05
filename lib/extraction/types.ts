export type FieldType = 'string' | 'number' | 'date' | 'boolean'

export type ExtractionMethod = 'regex' | 'keyword+window' | 'llm'

export interface FieldDefinition {
  fieldName: string
  description: string
  type: FieldType
  required: boolean
  extractionMethod: ExtractionMethod
  // For regex
  pattern?: string
  flags?: string
  // For keyword+window
  keywords?: string[]
  windowSize?: number
  // For LLM
  useLLM?: boolean
}

export interface ExtractionTemplate {
  id: string
  name: string
  description?: string
  fields: FieldDefinition[]
}

export interface FieldResult {
  fieldName: string
  value: any
  confidence: number // 0-1
  sourceSnippet?: string
  sourcePage?: number
  status: 'ok' | 'needs_review' | 'missing'
}

export interface ExtractionResult {
  documentId: string
  templateId: string
  fieldResults: FieldResult[]
  status: 'pending' | 'ok' | 'needs_review' | 'missing'
}
