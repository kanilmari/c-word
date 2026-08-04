import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialSave } from '../game/engine'
import { DexieSaveRepository } from './repository'

describe('IndexedDB-tallennus', () => {
  const repository = new DexieSaveRepository()

  beforeEach(async () => {
    await repository.clear()
  })

  it('tallentaa ja palauttaa keskeneräisen pelitilan asetuksineen', async () => {
    const save = createInitialSave('level-001')
    save.bonusPoints = 73
    save.settings.inputMode = 'keyboard'
    save.levelProgress['level-001'].solvedWords = ['SAARI']
    save.levelProgress['level-001'].revealedCells = ['1:0']

    await repository.save(save)
    const restored = await repository.load()

    expect(restored).toMatchObject({
      schemaVersion: 1,
      currentLevelId: 'level-001',
      bonusPoints: 73,
      settings: { inputMode: 'keyboard', adminMode: true },
      levelProgress: {
        'level-001': {
          solvedWords: ['SAARI'],
          revealedCells: ['1:0']
        }
      }
    })
  })
})
