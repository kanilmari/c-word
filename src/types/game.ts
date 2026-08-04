export type Direction = 'horizontal' | 'vertical'
export type InputMode = 'wheel' | 'keyboard'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface LevelWord {
  answer: string
  row: number
  column: number
  direction: Direction
}

export interface LevelData {
  id: string
  title: string
  place: string
  letters: string[]
  grid: { rows: number; columns: number }
  words: LevelWord[]
  bonusWords: string[]
  hintCost?: number
  allowRepeatedLetterNode?: boolean
}

export interface GridCell {
  key: string
  row: number
  column: number
  letter: string
  words: string[]
}

export interface LevelProgress {
  solvedWords: string[]
  foundBonusWords: string[]
  revealedCells: string[]
}

export interface PlayerSettings {
  inputMode: InputMode
  theme: ThemeMode
  soundEnabled: boolean
  hapticsEnabled: boolean
  adminMode: boolean
}

export interface GameSave {
  schemaVersion: 1
  currentLevelId: string
  completedLevelIds: string[]
  bonusPoints: number
  currency: number
  settings: PlayerSettings
  levelProgress: Record<string, LevelProgress>
  updatedAt: number
}

export type GuessKind = 'crossword' | 'bonus' | 'duplicate' | 'invalid'

export interface GuessResult {
  kind: GuessKind
  word: string
  progress: LevelProgress
  awardedPoints: number
}

export interface HintResult {
  success: boolean
  reason?: 'not-enough-points' | 'nothing-to-reveal'
  revealedCell?: string
  remainingPoints: number
  progress: LevelProgress
}
