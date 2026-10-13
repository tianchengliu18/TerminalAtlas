export type Platform = 'macos' | 'linux' | 'common'
export type SafetyLevel = 'read_only' | 'modifies_data' | 'high_risk'
export type LearningStatus = 'new' | 'mastered' | 'often_forgotten'
export type Theme = 'frost' | 'midnight' | 'graphite' | 'paper' | 'terminal'
export type RotationMode = 'weighted' | 'sequential' | 'random'
export type Density = 'compact' | 'standard' | 'detailed'

export interface CommandFlag { token: string; descriptionZh: string; descriptionEn?: string }
export interface CommandExample { titleZh: string; commandLine: string; explanationZh: string; platforms: Platform[]; safety: SafetyLevel }
export interface CommandEntry {
  id: string; command: string; meaningEn?: string; etymologyNote?: string; platformNote?: string
  titleZh: string; summaryZh: string; syntax: string; category: string; tags: string[]
  searchAliasesZh: string[]; platforms: Platform[]; safety: SafetyLevel
  flags: CommandFlag[]; combinations: { expression: string; explanationZh: string; tokens: string[] }[]
  examples: CommandExample[]; relatedCommandIds: string[]; markdownBody: string
  source: { provider: 'original' | 'tldr-pages' | 'user'; url?: string; upstreamPath?: string; revision?: string; license: string; modified: boolean }
}
export interface UserCommandState {
  commandId: string; isFrequent: boolean; learningStatus: LearningStatus
  isFavorite: boolean; isPinned: boolean; timesShown: number; lastShownAt?: string
  notesMarkdown: string; updatedAt: string
}
export interface AmbientSettings {
  rotationMinutes: number; cardsPerRotation: number; rotationMode: RotationMode
  category: string; stateFilter: 'all' | 'frequent' | 'forgotten' | 'favorites'
  cardDensity: Density; pauseOnHover: boolean; showProgress: boolean; opacity: number
  showEnglish: boolean; showChinese: boolean; showFlags: boolean; showExample: boolean
  autoStart: boolean; includePinned: boolean; x: number; y: number; width: number
}
export interface Preferences {
  theme: Theme; reducedTransparency: boolean; highContrast: boolean
  showEnglishMeaning: boolean; showChineseMeaning: boolean; showFlags: boolean
  showExample: boolean; showPlatform: boolean; showRisk: boolean
}
export interface PersonalData {
  version: 2; states: Record<string, UserCommandState>; overrides: Record<string, CommandEntry>
  customCommands: Record<string, CommandEntry>; ambient: AmbientSettings; preferences: Preferences
  batchIds: string[]; previousBatchIds: string[]; nextRotationAt: number; sequenceIndex: number
}
