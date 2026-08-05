import { describe, expect, it } from 'vitest'
import type { LevelData } from '../types/game'
import { draftMatchCells } from './grid'

const crossingLevel: LevelData = {
  id: 'crossing-draft',
  title: 'Testi',
  place: 'Testipaikka',
  letters: ['A', 'I', 'K', 'A', 'T', 'O'],
  grid: { rows: 4, columns: 4 },
  words: [
    { answer: 'AIKA', row: 0, column: 0, direction: 'horizontal' },
    { answer: 'AITO', row: 0, column: 0, direction: 'vertical' }
  ],
  bonusWords: []
}

describe('ristikon luonnoskorostukset', () => {
  it('korostaa löytymättömästä sanasta vain risteyksessä jo näkyvän alkukirjaimen', () => {
    const matches = draftMatchCells(crossingLevel, ['AITO'], [], 'AIKA')
    expect([...matches.entries()]).toEqual([['0:0', 'prefix']])
  })

  it('ei paljasta täysin piilossa olevan sanan ruutuja', () => {
    const matches = draftMatchCells(crossingLevel, [], [], 'AIKA')
    expect(matches.size).toBe(0)
  })

  it('korostaa ratkaistun sanan täytetyn alun ja lopulta koko sanan', () => {
    const prefix = draftMatchCells(crossingLevel, ['AIKA'], [], 'AI')
    expect([...prefix.entries()]).toEqual([['0:0', 'prefix'], ['0:1', 'prefix']])

    const wholeWord = draftMatchCells(crossingLevel, ['AIKA'], [], 'AIKA')
    expect([...wholeWord.values()]).toEqual(['word', 'word', 'word', 'word'])
  })
})
