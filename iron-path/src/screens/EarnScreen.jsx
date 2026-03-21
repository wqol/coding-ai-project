import React from 'react'

const items = [
  { name: 'Work Shifts', desc: 'Early game income', icon: '🏗️' },
  { name: 'YouTube Channel', desc: 'Mid game passive income', icon: '📹' },
  { name: 'BDS Sponsorship', desc: 'Late game sponsorship deals', icon: '🤝' },
]

export default function EarnScreen() {
  return (
    <div style={{ padding: '0 24px', paddingBottom: 90 }}>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#e8e0d0' }}>EARN</span>
      </div>

      <div style={{
        marginTop: 20, background: '#0f1018', borderRadius: 20, padding: '32px 20px',
        textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ fontSize: 40 }}>💼</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#d4a853', marginTop: 12 }}>PHASE 2 COMING SOON</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#a09080', marginTop: 8, lineHeight: 1.5 }}>
          Earn money through work shifts, YouTube content, and sponsorship deals to fund your lifting career.
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: '#0f1018', borderRadius: 14, padding: '14px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5,
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: '#e8e0d0' }}>{item.name}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#504840', marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
