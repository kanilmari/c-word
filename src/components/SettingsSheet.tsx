import type { InputMode, PlayerSettings, ThemeMode } from '../types/game'
import { CloseIcon } from './icons'

interface SettingsSheetProps {
  settings: PlayerSettings
  onChange: (settings: Partial<PlayerSettings>) => void
  onClose: () => void
}

export function SettingsSheet({ settings, onChange, onClose }: SettingsSheetProps) {
  return (
    <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="sheet-heading">
          <div><span className="eyebrow">PELIASETUKSET</span><h2 id="settings-title">Tee pelistä omasi</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Sulje asetukset"><CloseIcon /></button>
        </div>

        <fieldset className="segmented-setting">
          <legend>Syöttötapa</legend>
          <div className="segmented-control">
            {([['wheel', 'Kirjainkehä'], ['keyboard', 'Näppäimistö']] as [InputMode, string][]).map(([value, label]) => (
              <button key={value} type="button" className={settings.inputMode === value ? 'is-active' : ''} onClick={() => onChange({ inputMode: value })}>{label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="segmented-setting">
          <legend>Teema</legend>
          <div className="segmented-control segmented-control--three">
            {([['system', 'Laite'], ['light', 'Vaalea'], ['dark', 'Tumma']] as [ThemeMode, string][]).map(([value, label]) => (
              <button key={value} type="button" className={settings.theme === value ? 'is-active' : ''} onClick={() => onChange({ theme: value })}>{label}</button>
            ))}
          </div>
        </fieldset>

        <label className="toggle-setting toggle-setting--admin">
          <span><strong>Ylläpitäjätila</strong><small>Vapaa kenttänavigointi ja maksuttomat kirjainvihjeet</small></span>
          <input type="checkbox" checked={settings.adminMode} onChange={(event) => onChange({ adminMode: event.target.checked })} />
        </label>
        <label className="toggle-setting">
          <span><strong>Äänet</strong><small>Kevyt palaute onnistumisista</small></span>
          <input type="checkbox" checked={settings.soundEnabled} onChange={(event) => onChange({ soundEnabled: event.target.checked })} />
        </label>
        <label className="toggle-setting">
          <span><strong>Värinä</strong><small>Tuntopalaute tuetuilla laitteilla</small></span>
          <input type="checkbox" checked={settings.hapticsEnabled} onChange={(event) => onChange({ hapticsEnabled: event.target.checked })} />
        </label>
      </section>
    </div>
  )
}
