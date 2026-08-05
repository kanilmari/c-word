import type { GameSave, GuessResult, LevelData, LevelProgress, PlayerSettings } from '../types/game'
import { normalizeWord } from './normalize'

export const defaultSettings: PlayerSettings = {
  inputMode: 'wheel',
  theme: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  adminMode: true
}

export const emptyProgress = (): LevelProgress => ({
  solvedWords: [],
  foundBonusWords: [],
  revealedCells: []
})

export function createInitialSave(firstLevelId: string): GameSave {
  return {
    schemaVersion: 1,
    currentLevelId: firstLevelId,
    completedLevelIds: [],
    bonusPoints: 46,
    currency: 240,
    settings: { ...defaultSettings },
    levelProgress: { [firstLevelId]: emptyProgress() },
    updatedAt: Date.now()
  }
}

export function evaluateGuess(rawGuess: string, level: LevelData, current: LevelProgress): GuessResult {
  const word = normalizeWord(rawGuess)
  const progress: LevelProgress = {
    solvedWords: [...current.solvedWords],
    foundBonusWords: [...current.foundBonusWords],
    revealedCells: [...current.revealedCells]
  }

  if (progress.solvedWords.includes(word) || progress.foundBonusWords.includes(word)) {
    return { kind: 'duplicate', word, progress, awardedPoints: 0 }
  }

  if (level.words.some(({ answer }) => answer === word)) {
    progress.solvedWords.push(word)
    return { kind: 'crossword', word, progress, awardedPoints: 0 }
  }

  if (level.bonusWords.includes(word)) {
    progress.foundBonusWords.push(word)
    return { kind: 'bonus', word, progress, awardedPoints: 1 }
  }

  return { kind: 'invalid', word, progress, awardedPoints: 0 }
}

export function isLevelComplete(level: LevelData, progress: LevelProgress): boolean {
  return level.words.every(({ answer }) => progress.solvedWords.includes(answer))
}
