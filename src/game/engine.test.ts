import { describe, expect, it } from 'vitest'
import { levels } from '../data/levels'
import { completedCrosswordInitials, emptyProgress, evaluateGuess, isLevelComplete } from './engine'
import { canBuildWord, normalizeWord } from './normalize'

const level = levels[0]
const crosswordWord = level.words[0].answer
const bonusWord = level.bonusWords.find((word) => word.length >= 3)!

describe('arvauksen tarkistus', () => {
  it('hyväksyy ristikkosanan', () => {
    const result = evaluateGuess(` ${crosswordWord.toLocaleLowerCase('fi-FI')} `, level, emptyProgress())
    expect(result.kind).toBe('crossword')
    expect(result.progress.solvedWords).toEqual([crosswordWord])
  })

  it('hyväksyy bonus-sanan ja antaa yhden pisteen', () => {
    const result = evaluateGuess(bonusWord, level, emptyProgress())
    expect(result.kind).toBe('bonus')
    expect(result.awardedPoints).toBe(1)
    expect(result.progress.foundBonusWords).toEqual([bonusWord])
  })

  it('palkitsee myös virallisesta sanalistasta löytyvän, siemenlistaan kuulumattoman sanan', () => {
    expect(level.bonusWords).toContain('MAATON')
    expect(evaluateGuess('maaton', level, emptyProgress()).kind).toBe('bonus')
  })

  it('ei palkitse samaa ristikkosanaa uudelleen', () => {
    const current = { ...emptyProgress(), solvedWords: [crosswordWord] }
    const result = evaluateGuess(crosswordWord, level, current)
    expect(result.kind).toBe('duplicate')
    expect(result.awardedPoints).toBe(0)
  })

  it('ei palkitse samaa bonus-sanaa uudelleen', () => {
    const current = { ...emptyProgress(), foundBonusWords: [bonusWord] }
    const result = evaluateGuess(bonusWord, level, current)
    expect(result.kind).toBe('duplicate')
    expect(result.awardedPoints).toBe(0)
  })

  it('hylkää sanan, jota kenttä ei tunne', () => {
    expect(evaluateGuess('RISA', level, emptyProgress()).kind).toBe('invalid')
  })

  it('tunnistaa valmiin kentän', () => {
    const progress = { ...emptyProgress(), solvedWords: level.words.map(({ answer }) => answer) }
    expect(isLevelComplete(level, progress)).toBe(true)
    expect(isLevelComplete(level, { ...progress, solvedWords: progress.solvedWords.slice(1) })).toBe(false)
  })

  it('merkitsee alkukirjaimen valmiiksi vasta kun kaikki sillä alkavat ristikkosanat on ratkaistu', () => {
    const mWords = level.words.filter(({ answer }) => answer.startsWith('M')).map(({ answer }) => answer)

    expect(completedCrosswordInitials(level, mWords.slice(0, -1))).not.toContain('M')
    expect(completedCrosswordInitials(level, mWords)).toContain('M')
  })

  it('ei merkitse kirjainta, jolla ei ala yhtään ristikkosanaa', () => {
    expect(level.letters).toContain('T')
    expect(completedCrosswordInitials(level, level.words.map(({ answer }) => answer))).not.toContain('T')
  })
})

describe('kirjainten käsittely', () => {
  it('tarkistaa saman kirjaimen käytettävissä olevan määrän', () => {
    expect(canBuildWord('SANOMA', level.letters)).toBe(true)
    expect(canBuildWord('SAAAAAA', level.letters)).toBe(false)
  })

  it('säilyttää Ä-, Ö- ja Å-kirjaimet erillisinä', () => {
    expect(normalizeWord('  hyötyä ')).toBe('HYÖTYÄ')
    expect(normalizeWord('åäö')).toBe('ÅÄÖ')
    expect(canBuildWord('MÄE', ['M', 'Ä', 'E'])).toBe(true)
    expect(canBuildWord('MAE', ['M', 'Ä', 'E'])).toBe(false)
  })
})
