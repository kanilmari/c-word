import type { LevelData, LevelWord } from '../types/game'
import { canBuildWord, normalizeWord } from './normalize'
import { cellsForWord } from './grid'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  level: LevelData
}

function normalizeLevel(level: LevelData): LevelData {
  return {
    ...level,
    letters: level.letters.map(normalizeWord),
    words: level.words.map((word) => ({ ...word, answer: normalizeWord(word.answer) })),
    bonusWords: level.bonusWords.map(normalizeWord),
    hintCost: level.hintCost ?? 100,
    allowRepeatedLetterNode: level.allowRepeatedLetterNode ?? false
  }
}

function isInside(word: LevelWord, rows: number, columns: number) {
  return cellsForWord(word).every(({ row, column }) => row >= 0 && column >= 0 && row < rows && column < columns)
}

export function validateLevel(rawLevel: LevelData): ValidationResult {
  const level = normalizeLevel(rawLevel)
  const errors: string[] = []
  const answers = new Set<string>()
  const occupied = new Map<string, { letter: string; direction: LevelWord['direction']; answer: string }>()

  if (!level.id.trim()) errors.push('Kentän id puuttuu.')
  if (level.grid.rows <= 0 || level.grid.columns <= 0) errors.push('Ruudukon koon täytyy olla positiivinen.')

  level.letters.forEach((letter) => {
    if ([...letter].length !== 1) errors.push(`Virheellinen kirjainpaikka: ${letter || '(tyhjä)'}.`)
  })

  for (const word of level.words) {
    if (!word.answer) errors.push('Ristikkosana ei voi olla tyhjä.')
    if (answers.has(word.answer)) errors.push(`Ristikkosana ${word.answer} on määritelty useita kertoja.`)
    answers.add(word.answer)
    if (!canBuildWord(word.answer, level.letters)) {
      errors.push(`Sanaa ${word.answer} ei voi muodostaa kentän kirjaimista.`)
    }
    if (!Number.isInteger(word.row) || !Number.isInteger(word.column) || !isInside(word, level.grid.rows, level.grid.columns)) {
      errors.push(`Sana ${word.answer} menee ruudukon ulkopuolelle.`)
      continue
    }
    for (const cell of cellsForWord(word)) {
      const previous = occupied.get(cell.key)
      if (previous && previous.letter !== cell.letter) {
        errors.push(`Sanat ${previous.answer} ja ${word.answer} törmäävät solussa ${cell.key}.`)
      } else if (previous && previous.direction === word.direction) {
        errors.push(`Sanat ${previous.answer} ja ${word.answer} limittyvät samansuuntaisesti.`)
      } else if (!previous) {
        occupied.set(cell.key, { letter: cell.letter, direction: word.direction, answer: word.answer })
      }
    }
  }

  const seenBonus = new Set<string>()
  for (const bonusWord of level.bonusWords) {
    if (answers.has(bonusWord)) errors.push(`Sana ${bonusWord} on sekä ristikkosana että bonus-sana.`)
    if (seenBonus.has(bonusWord)) errors.push(`Bonus-sana ${bonusWord} on määritelty useita kertoja.`)
    seenBonus.add(bonusWord)
    if (!canBuildWord(bonusWord, level.letters)) {
      errors.push(`Bonus-sanaa ${bonusWord} ei voi muodostaa kentän kirjaimista.`)
    }
  }

  return { valid: errors.length === 0, errors, level }
}

export function assertValidLevels(levels: readonly LevelData[]): LevelData[] {
  return levels.map((rawLevel) => {
    const result = validateLevel(rawLevel)
    if (!result.valid) throw new Error(`Virhe kentässä ${rawLevel.id}: ${result.errors.join(' ')}`)
    return result.level
  })
}
