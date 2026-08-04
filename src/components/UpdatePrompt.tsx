import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW()

  if (!needRefresh) return null
  return (
    <aside className="update-prompt" aria-live="polite">
      <span>Uusi versio on valmis.</span>
      <button type="button" onClick={() => void updateServiceWorker(true)}>Päivitä turvallisesti</button>
      <button type="button" className="text-button" onClick={() => setNeedRefresh(false)}>Myöhemmin</button>
    </aside>
  )
}
