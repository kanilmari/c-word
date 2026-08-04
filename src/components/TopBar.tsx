import { SettingsIcon, SparkIcon } from './icons'

interface TopBarProps {
  bonusPoints: number
  hintCost: number
  currency: number
  adminMode: boolean
  onOpenSettings: () => void
}

export function TopBar({ bonusPoints, hintCost, currency, adminMode, onOpenSettings }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="score-pill score-pill--bonus" aria-label={`Bonuspisteet ${bonusPoints} / ${hintCost}`}>
        <SparkIcon />
        <span>{bonusPoints}</span><small>/ {hintCost}</small>
      </div>
      <div className="score-pill" aria-label={`Pelivaluutta ${currency}`}>
        <span className="coin-mark">C</span>
        <span>{currency}</span>
      </div>
      {adminMode && <span className="admin-badge">YLLÄPITÄJÄ</span>}
      <button className="icon-button top-bar__settings" type="button" onClick={onOpenSettings} aria-label="Avaa asetukset">
        <SettingsIcon />
      </button>
    </header>
  )
}
