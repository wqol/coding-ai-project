import React from 'react'
import { getBodyScale } from '../gameState.js'

export default function BodyScreen({ state, dispatch }) {
  const { strength, prs, fatigue, form, health, injured, injuryDays, day } = state
  const avgStrength = (strength.SQUAT + strength.BENCH + strength.DEADLIFT) / 3
  const scale = getBodyScale(avgStrength)
  const total = prs.SQUAT + prs.BENCH + prs.DEADLIFT

  let tierName, tierProgress
  if (scale < 1.15) { tierName = 'BEGINNER'; tierProgress = (scale - 1.0) / 0.15 }
  else if (scale < 1.3) { tierName = 'INTERMEDIATE'; tierProgress = (scale - 1.15) / 0.15 }
  else if (scale < 1.5) { tierName = 'ADVANCED'; tierProgress = (scale - 1.3) / 0.2 }
  else { tierName = 'ELITE'; tierProgress = 1 }

  const coachTip = injured
    ? { border: '#e05555', text: "You're injured. Rest until recovered.", icon: '⚠️' }
    : fatigue > 82
    ? { border: '#e05555', text: 'Fatigue critical. Rest today.', icon: '🔴' }
    : fatigue > 65
    ? { border: '#e09040', text: 'Getting tired. Consider lighter work.', icon: '🟡' }
    : { border: '#4a7dbd', text: "You're feeling good. Keep pushing!", icon: '💪' }

  return (
    <div style={{ padding: '0 24px', paddingBottom: 90, overflowY: 'auto', maxHeight: 'calc(100dvh - 76px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#e8e0d0' }}>BODY</span>
        <div style={{
          background: '#0f1018', borderRadius: 20, padding: '5px 12px',
          border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#a09080'
        }}>Day {day}</div>
      </div>

      {/* Coach Tip */}
      <div style={{
        marginTop: 20, background: '#0f1018', borderRadius: 14, padding: '14px 16px',
        borderLeft: `3px solid ${coachTip.border}`, display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{ fontSize: 18 }}>{coachTip.icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#c0b8a8' }}>{coachTip.text}</span>
      </div>

      {/* Physique Card */}
      <div style={{
        marginTop: 16, background: '#0f1018', borderRadius: 20, padding: 20,
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#504840', fontWeight: 600, letterSpacing: 1 }}>PHYSIQUE</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#d4a853' }}>{tierName}</span>
        </div>
        <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, tierProgress * 100)}%`, height: '100%', borderRadius: 3, background: '#d4a853', transition: 'width 0.3s' }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840' }}>
          Character grows as you get stronger
        </div>
      </div>

      {/* PR Tiles */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {['SQUAT', 'BENCH', 'DEADLIFT'].map(l => (
          <div key={l} style={{
            flex: 1, background: '#0f1018', borderRadius: 14, padding: '14px 0', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840', letterSpacing: 0.5 }}>
              {l === 'DEADLIFT' ? 'DEAD' : l}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#d4a853', marginTop: 4 }}>
              {prs[l] > 0 ? prs[l] : '--'}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840' }}>kg</div>
          </div>
        ))}
      </div>

      {/* Total Bar */}
      <div style={{
        marginTop: 12, background: 'rgba(212,168,83,0.08)', borderRadius: 14, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid rgba(212,168,83,0.12)'
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#a09080', fontWeight: 500 }}>COMPETITION TOTAL</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#e8e0d0' }}>{total}<span style={{ fontSize: 14, color: '#504840' }}>kg</span></span>
      </div>

      {/* Stats Block */}
      <div style={{
        marginTop: 16, background: '#0f1018', borderRadius: 20, padding: 20,
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#504840', fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>STATS</div>
        <StatRow label="STRENGTH" value={Math.round(avgStrength)} max={320} color="#d4a853" />
        <StatRow label="FORM" value={Math.round(form)} max={100} color="#7bc96f" />
        <StatRow label="FATIGUE" value={Math.round(fatigue)} max={100} color={fatigue > 70 ? '#e05555' : '#e09040'} />
        <StatRow label="HEALTH" value={Math.round(health)} max={100} color={health < 40 ? '#e05555' : '#3cb06a'} />
      </div>

      {/* Lift Strength Block */}
      <div style={{
        marginTop: 12, background: '#0f1018', borderRadius: 20, padding: 20,
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#504840', fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>LIFT STRENGTH</div>
        <StatRow label="SQUAT" value={Math.round(strength.SQUAT)} max={420} color="#d4a853" />
        <StatRow label="BENCH" value={Math.round(strength.BENCH)} max={420} color="#d4a853" />
        <StatRow label="DEAD" value={Math.round(strength.DEADLIFT)} max={420} color="#d4a853" />
      </div>

      {/* Injury Banner */}
      {injured && (
        <div style={{
          marginTop: 12, background: 'rgba(224,85,85,0.1)', borderRadius: 14, padding: '14px 18px',
          border: '1px solid rgba(224,85,85,0.2)', textAlign: 'center',
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#e05555', fontWeight: 500
        }}>
          Injured — {injuryDays} day{injuryDays !== 1 ? 's' : ''} needed
        </div>
      )}

      {/* Rest Day Button */}
      <button onClick={() => dispatch({ type: 'REST_DAY' })} style={{
        marginTop: 16, width: '100%', padding: '16px 0', borderRadius: 16,
        background: 'transparent', cursor: 'pointer',
        border: injured ? '1.5px solid rgba(224,85,85,0.4)' : '1.5px solid rgba(255,255,255,0.1)',
        color: injured ? '#e05555' : '#a09080',
        fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
      }}>Rest Day</button>
    </div>
  )
}

function StatRow({ label, value, max, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ width: 64, fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840', fontWeight: 500 }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginRight: 10 }}>
        <div style={{
          width: `${Math.min(100, (value / max) * 100)}%`, height: '100%',
          borderRadius: 3, background: color, transition: 'width 0.3s'
        }} />
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#e8e0d0', fontWeight: 500, minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
