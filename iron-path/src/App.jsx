import React, { useReducer, useEffect, useRef, useState } from 'react'
import { gameReducer, getInitialState } from './gameState.js'
import { saveGame, loadGame } from './storage.js'
import NavBar from './components/NavBar.jsx'
import TrainScreen from './screens/TrainScreen.jsx'
import BodyScreen from './screens/BodyScreen.jsx'
import CompeteScreen from './screens/CompeteScreen.jsx'
import EarnScreen from './screens/EarnScreen.jsx'
import ShopScreen from './screens/ShopScreen.jsx'

const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; user-select: none; }
  html, body { background: #08090d; overflow: hidden; height: 100%; }
  body { font-family: 'Inter', sans-serif; }
  @keyframes prIn { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
`

const tabs = ['TRAIN', 'BODY', 'EARN', 'SHOP', 'COMPETE']

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState)
  const [prOverlay, setPrOverlay] = useState(null)
  const saveTimer = useRef(null)
  const loaded = useRef(false)

  // Load save on mount
  useEffect(() => {
    loadGame().then(saved => {
      if (saved) dispatch({ type: 'LOAD_SAVE', payload: saved })
      loaded.current = true
    })
  }, [])

  // Debounced save
  useEffect(() => {
    if (!loaded.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveGame(state), 3000)
  }, [state])

  // PR overlay
  useEffect(() => {
    if (state.pendingPR) {
      setPrOverlay(state.pendingPR)
      dispatch({ type: 'CLEAR_PR' })
    }
  }, [state.pendingPR])

  const { activeTab } = state

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        width: 390, maxWidth: '100vw', height: '100dvh', margin: '0 auto',
        background: '#08090d', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{ height: 'calc(100dvh - 76px)', overflowY: 'auto', overflowX: 'hidden' }}>
          {tabs.map(tab => (
            <div key={tab} style={{
              display: activeTab === tab ? 'block' : 'none',
              opacity: activeTab === tab ? 1 : 0,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              transform: activeTab === tab ? 'translateY(0)' : 'translateY(20px)',
            }}>
              {tab === 'TRAIN' && <TrainScreen state={state} dispatch={dispatch} />}
              {tab === 'BODY' && <BodyScreen state={state} dispatch={dispatch} />}
              {tab === 'COMPETE' && <CompeteScreen state={state} dispatch={dispatch} />}
              {tab === 'EARN' && <EarnScreen />}
              {tab === 'SHOP' && <ShopScreen />}
            </div>
          ))}
        </div>

        <NavBar activeTab={activeTab} dispatch={dispatch} />

        {/* PR Overlay */}
        {prOverlay && (
          <div onClick={() => setPrOverlay(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
            cursor: 'pointer'
          }}>
            <div style={{
              background: '#0f1018', borderRadius: 24, padding: '40px 48px', textAlign: 'center',
              border: '1px solid rgba(212,168,83,0.2)',
              boxShadow: '0 0 60px rgba(212,168,83,0.1)',
              animation: 'prIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div style={{ fontSize: 48 }}>🏆</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#d4a853', marginTop: 12 }}>
                PERSONAL RECORD
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#a09080', marginTop: 6 }}>
                {prOverlay.lift}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: '#e8e0d0', marginTop: 8 }}>
                {prOverlay.kg}<span style={{ fontSize: 22, color: '#504840' }}>kg</span>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#504840', marginTop: 14 }}>
                Tap anywhere to dismiss
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
