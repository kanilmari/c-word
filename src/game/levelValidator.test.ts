import { describe, expect, it } from 'vitest'
import type { LevelData } from '../types/game'
import { levels } from '../data/levels'
import { cellsForWord } from './grid'
import { validateLevel } from './levelValidator'

function apparentWords(level: LevelData) {
  const occupied = new Map(level.words.flatMap(cellsForWord).map((cell) => [cell.key, cell.letter]))
  const words: string[] = []
  const collect = (lines: string[][]) => {
    lines.forEach((line) => {
      let word = ''
      line.forEach((letter) => {
        if (letter) word += letter
        else {
          if (word.length >= 2) words.push(word)
          word = ''
        }
      })
      if (word.length >= 2) words.push(word)
    })
  }

  collect(Array.from({ length: level.grid.rows }, (_, row) =>
    Array.from({ length: level.grid.columns }, (_, column) => occupied.get(`${row}:${column}`) ?? '')
  ))
  collect(Array.from({ length: level.grid.columns }, (_, column) =>
    Array.from({ length: level.grid.rows }, (_, row) => occupied.get(`${row}:${column}`) ?? '')
  ))
  return words.sort((left, right) => left.localeCompare(right, 'fi'))
}

describe('kentän validointi', () => {
  it('hyväksyy kaikki toimitetut esimerkkikentät', () => {
    expect(levels).toHaveLength(5)
    levels.forEach((level) => {
      expect(validateLevel(level).valid).toBe(true)
      expect(level.words.length).toBeGreaterThanOrEqual(12)
      expect(level.grid.rows).toBeGreaterThanOrEqual(9)
      expect(level.grid.columns).toBeGreaterThanOrEqual(9)
      expect(level.bonusWords.length).toBeGreaterThanOrEqual(30)
      expect(apparentWords(level)).toEqual(level.words.map(({ answer }) => answer).sort((left, right) => left.localeCompare(right, 'fi')))
    })
  })

  it('normalisoi vastaukset ja bonus-sanat isoiksi kirjaimiksi', () => {
    const raw: LevelData = {
      id: 'normalisointi',
      title: 'Testi',
      place: 'Testipaikka',
      letters: ['ä', 'i', 't'],
      grid: { rows: 1, columns: 4 },
      words: [{ answer: 'äiti', row: 0, column: 0, direction: 'horizontal' }],
      bonusWords: []
    }
    raw.letters.push('i')
    const result = validateLevel(raw)
    expect(result.valid).toBe(true)
    expect(result.level.words[0].answer).toBe('ÄITI')
  })

  it('hylkää ristiriitaisen risteyksen', () => {
    const invalid: LevelData = {
      id: 'bad-crossing',
      title: 'Testi',
      place: 'Testipaikka',
      letters: ['K', 'A', 'T', 'O'],
      grid: { rows: 3, columns: 3 },
      words: [
        { answer: 'KAT', row: 1, column: 0, direction: 'horizontal' },
        { answer: 'KOT', row: 0, column: 1, direction: 'vertical' }
      ],
      bonusWords: []
    }
    const result = validateLevel(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('törmäävät')
  })

  it('hylkää liian pitkän sanan ja liian suuren kirjainkulutuksen', () => {
    const invalid: LevelData = {
      id: 'outside',
      title: 'Testi',
      place: 'Testipaikka',
      letters: ['S', 'A', 'N'],
      grid: { rows: 1, columns: 2 },
      words: [{ answer: 'SANA', row: 0, column: 0, direction: 'horizontal' }],
      bonusWords: []
    }
    const result = validateLevel(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('ei voi muodostaa')
    expect(result.errors.join(' ')).toContain('ulkopuolelle')
  })
})
