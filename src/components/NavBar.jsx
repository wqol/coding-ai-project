const TABS = [
  { id: 'train', label: 'Train', icon: TrainIcon },
  { id: 'body', label: 'Body', icon: BodyIcon },
  { id: 'compete', label: 'Compete', icon: TrophyIcon },
  { id: 'earn', label: 'Earn', icon: MoneyIcon },
  { id: 'shop', label: 'Shop', icon: ShopIcon },
]

function TrainIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a853' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 10h16M4 14h16"/>
      <circle cx="2" cy="12" r="1.5" fill={active ? '#d4a853' : '#666'} stroke="none"/>
      <circle cx="22" cy="12" r="1.5" fill={active ? '#d4a853' : '#666'} stroke="none"/>
    </svg>
  )
}

function BodyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a853' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5"/>
      <path d="M12 8v8M8 10l-2 4M16 10l2 4M9 20l3-4 3 4"/>
    </svg>
  )
}

function TrophyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a853' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h10a4 4 0 004-4V3h-2"/>
      <path d="M5 3h14v6a7 7 0 01-14 0V3z"/>
    </svg>
  )
}

function MoneyIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a853' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 6v2M12 16v2M9 9.5c0-1.1.9-2 2-2h2a2 2 0 010 4h-2a2 2 0 000 4h2a2 2 0 002-2"/>
    </svg>
  )
}

function ShopIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a853' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

export default function NavBar({ activeTab, dispatch }) {
  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: '#0f1117',
      borderTop: '1px solid #1e2030',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 100,
    }}>
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: id })}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0 10px',
              position: 'relative',
              transition: 'opacity 0.15s',
            }}
          >
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: 2,
                background: '#d4a853',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <Icon active={active} />
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: active ? '#d4a853' : '#555',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
