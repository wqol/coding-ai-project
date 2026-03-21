const SAVE_KEY = 'ironpath_v1'

export async function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) } catch(e) {}
}

export async function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY)
    return data ? JSON.parse(data) : null
  } catch(e) { return null }
}
