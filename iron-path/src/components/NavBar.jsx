import React from 'react'

const tabs = [
  { key: 'TRAIN', label: 'TRAIN', icon: TrainIcon },
  { key: 'BODY', label: 'BODY', icon: BodyIcon },
  { key: 'EARN', label: 'EARN', icon: EarnIcon },
  { key: 'SHOP', label: 'SHOP', icon: ShopIcon },
  { key: 'COMPETE', label: 'COMPETE', icon: CompeteIcon },
]

function TrainIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="11" x2="19" y2="11" />
      <circle cx="5" cy="11" r="1.5" />
      <circle cx="17" cy="11" r="1.5" />
      <rect x="6.5" y="7.5" width="2" height="7" rx="0.5" />
      <rect x="13.5" y="7.5" width="2" height="7" rx="0.5" />
    </svg>
  )
}

function BodyIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="5" r="2" />
      <line x1="11" y1="7" x2="11" y2="14" />
      <line x1="7" y1="9.5" x2="15" y2="9.5" />
      <line x1="11" y1="14" x2="8" y2="19" />
      <line x1="11" y1="14" x2="14" y2="19" />
    </svg>
  )
}

function EarnIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="11" y1="7" x2="11" y2="15" />
      <line x1="9" y1="9" x2="13" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </svg>
  )
}

function ShopIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h10l-1 10H7L6 7z" />
      <path d="M9 7V5a2 2 0 0 1 4 0v2" />
    </svg>
  )
}

function CompeteIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M7 6H5a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h1" />
      <path d="M15 6h2a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-1" />
      <line x1="11" y1="13" x2="11" y2="16" />
      <line x1="8" y1="16" x2="14" y2="16" />
    </svg>
  )
}

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 390,
  height: 76,
  background: '#0f1018',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  zIndex: 100,
}

export default function NavBar({ activeTab, dispatch }) {
  return (
    <div style={navStyle}>
      {tabs.map(tab => {
        const active = activeTab === tab.key
        const color = active ? '#d4a853' : '#504840'
        return (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: active ? 'rgba(212,168,83,0.08)' : 'transparent',
              border: 'none',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            <tab.icon color={color} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 9,
              fontWeight: 500,
              textTransform: 'uppercase',
              color,
              letterSpacing: 0.5,
            }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
