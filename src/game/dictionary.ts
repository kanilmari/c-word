import type { LevelData } from '../types/game'
import { normalizeWord } from './normalize'

export interface WordDictionary {
  contains(word: string, level: LevelData): boolean | Promise<boolean>
}

export const localLevelDictionary: WordDictionary = {
  contains(word, level) {
    const normalized = normalizeWord(word)
    return level.words.some(({ answer }) => answer === normalized) || level.bonusWords.includes(normalized)
  }
}
