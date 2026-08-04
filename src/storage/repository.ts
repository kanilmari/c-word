import Dexie, { type EntityTable } from 'dexie'
import type { GameSave } from '../types/game'

interface SaveRow extends GameSave {
  key: 'current'
}

export interface SaveRepository {
  load(): Promise<GameSave | undefined>
  save(state: GameSave): Promise<void>
  clear(): Promise<void>
}

class GameDatabase extends Dexie {
  saves!: EntityTable<SaveRow, 'key'>

  constructor(name = 'c-word-db') {
    super(name)
    this.version(1).stores({ saves: '&key, updatedAt' })
  }
}

export class DexieSaveRepository implements SaveRepository {
  constructor(private readonly database = new GameDatabase()) {}

  async load(): Promise<GameSave | undefined> {
    const row = await this.database.saves.get('current')
    if (!row) return undefined
    const { key: _key, ...save } = row
    return save
  }

  async save(state: GameSave): Promise<void> {
    await this.database.saves.put({ ...structuredClone(state), key: 'current', updatedAt: Date.now() })
  }

  async clear(): Promise<void> {
    await this.database.saves.clear()
  }
}

export const saveRepository: SaveRepository = new DexieSaveRepository()
