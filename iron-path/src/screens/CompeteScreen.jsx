import React from 'react'

const meets = [
  { name: 'City Gym Open', day: 14, req: 0, prize: 'XP + Rep', prizeColor: '#7bc96f' },
  { name: 'Regional Championships', day: 30, req: 150, prize: 'Cash + Ranking', prizeColor: '#3cb06a' },
  { name: 'Nationals', day: 60, req: 300, prize: 'Large Cash', prizeColor: '#d4a853' },
  { name: 'World Open', day: 120, req: 600, prize: 'Life-Changing', prizeColor: '#d4a853' },
]

export default function CompeteScreen({ state }) {
  const { prs, day } = state
  const total = prs.SQUAT + prs.BENCH + prs.DEADLIFT

  return (
    <div style={{ padding: '0 24px', paddingBottom: 90, overflowY: 'auto', maxHeight: 'calc(100dvh - 76px)' }}>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#e8e0d0' }}>COMPETE</span>
      </div>

      {/* Total Display */}
      <div style={{
        marginTop: 20, background: 'rgba(212,168,83,0.08)', borderRadius: 20, padding: '24px 20px',
        textAlign: 'center', border: '1px solid rgba(212,168,83,0.12)'
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#a09080', letterSpacing: 1 }}>YOUR TOTAL</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: '#e8e0d0', lineHeight: 1, marginTop: 6 }}>
          {total}<span style={{ fontSize: 22, color: '#504840' }}>kg</span>
        </div>
      </div>

      {/* Meets List */}
      <div style={{
        marginTop: 16, background: '#0f1018', borderRadius: 20, padding: 16,
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        {meets.map((m, i) => {
          const locked = total < m.req && m.req > 0
          return (
            <div key={i} style={{
              padding: '14px 0', opacity: locked ? 0.4 : 1,
              borderBottom: i < meets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: '#e8e0d0' }}>{m.name}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#d4a853' }}>Day {m.day}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {m.req > 0 && (
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#a09080',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '3px 8px'
                  }}>Req: {m.req}kg</span>
                )}
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 10, color: m.prizeColor,
                  background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '3px 8px'
                }}>{m.prize}</span>
              </div>
            </div>
          )
        })}
      </div>

      {total >= 100 && (
        <div style={{
          marginTop: 14, background: 'rgba(60,176,106,0.1)', borderRadius: 14, padding: '12px 16px',
          border: '1px solid rgba(60,176,106,0.2)', textAlign: 'center',
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#3cb06a'
        }}>
          You qualify for competition entry!
        </div>
      )}
    </div>
  )
}
