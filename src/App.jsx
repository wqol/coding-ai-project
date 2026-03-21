import { useReducer, useEffect, useCallback } from 'react'
import { gameReducer, INITIAL_STATE } from './gameState'
import { saveGame, loadGame } from './storage'
import NavBar from './components/NavBar'
import TrainScreen from './screens/TrainScreen'
import BodyScreen from './screens/BodyScreen'
import CompeteScreen from './screens/CompeteScreen'
import EarnScreen from './screens/EarnScreen'
import ShopScreen from './screens/ShopScreen'

const SCREENS = {
  train: TrainScreen,
  body: BodyScreen,
  compete: CompeteScreen,
  earn: EarnScreen,
  shop: ShopScreen,
}

const NOTIFICATION_COLORS = {
  success: { bg: '#0a1a0d', border: '#4caf8060', text: '#4caf80' },
  error: { bg: '#1a0d0d', border: '#e0525260', text: '#e05252' },
  warning: { bg: '#1a1400', border: '#f0c04060', text: '#f0c040' },
  info: { bg: '#0d0e14', border: '#5b8dd960', text: '#5b8dd9' },
}

function Notification({ note, onDismiss }) {
  const colors = NOTIFICATION_COLORS[note.type] || NOTIFICATION_COLORS.info
  return (
    <div
      onClick={onDismiss}
      style={{
        padding: '8px 12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 12,
        color: colors.text,
        cursor: 'pointer',
        animation: 'slideIn 0.2s ease-out',
        lineHeight: 1.4,
      }}
    >
      {note.message}
    </div>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (init) => {
    const saved = loadGame()
    return saved || init
  })

  // Auto-save every 10s
  useEffect(() => {
    const id = setInterval(() => saveGame(state), 10000)
    return () => clearInterval(id)
  }, [state])

  // Save on tab hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) saveGame(state)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [state])

  // Idle tick — recover fatigue over time
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 3000)
    return () => clearInterval(id)
  }, [])

  // Auto-dismiss old notifications
  useEffect(() => {
    if (state.notifications.length === 0) return
    const id = setTimeout(() => {
      if (state.notifications.length > 0) {
        dispatch({ type: 'DISMISS_NOTIFICATION', index: 0 })
      }
    }, 3500)
    return () => clearTimeout(id)
  }, [state.notifications])

  const ActiveScreen = SCREENS[state.activeTab] || TrainScreen

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000',
    }}>
      {/* Phone frame */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        height: '100%',
        maxHeight: 932,
        background: '#08090d',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Status bar */}
        <div style={{
          height: 44,
          background: '#0a0b10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          borderBottom: '1px solid #1e2030',
        }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#d4a853', letterSpacing: '0.1em' }}>
            IRON PATH
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'Bebas Neue', fontSize: 16,
              color: '#4caf80', letterSpacing: '0.04em',
            }}>
              ${Math.floor(state.money).toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>Day {state.day}</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <ActiveScreen state={state} dispatch={dispatch} />
        </div>

        {/* Bottom nav */}
        <NavBar activeTab={state.activeTab} dispatch={dispatch} />

        {/* Notifications overlay */}
        {state.notifications.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 78,
            left: 12,
            right: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 200,
            pointerEvents: 'none',
          }}>
            {state.notifications.map((note, i) => (
              <div key={note.id} style={{ pointerEvents: 'auto' }}>
                <Notification
                  note={note}
                  onDismiss={() => dispatch({ type: 'DISMISS_NOTIFICATION', index: i })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2d40; border-radius: 2px; }
      `}</style>
    </div>
  )
}
