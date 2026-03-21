const SAVE_KEY = 'iron_path_save_v1'

export function saveGame(state) {
  try {
    const toSave = { ...state, lastSaved: Date.now() }
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('Failed to save game:', e)
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load game:', e)
    return null
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
}

export function formatLastSaved(timestamp) {
  if (!timestamp) return 'Never'
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
