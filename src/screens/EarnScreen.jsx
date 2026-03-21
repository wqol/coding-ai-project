import { LIFTS, LIFT_LABELS, LIFT_ICONS } from '../gameState'

function StatRow({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid #12141e',
    }}>
      <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontFamily: 'Bebas Neue', color: '#f0e6d0', letterSpacing: '0.04em' }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#555' }}>{sub}</div>}
      </div>
    </div>
  )
}

function MoneyBreakdown({ state }) {
  const setsTotal = state.stats.totalSets
  const fromSets = setsTotal * 1 // rough estimate
  const fromComps = state.competitions.reduce((s, c) => s + c.prize, 0)

  return (
    <div style={{
      background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
      padding: 14, marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Income Sources
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <IncomeCard icon="💪" label="Training" amount={state.stats.totalEarned - fromComps} />
        <IncomeCard icon="🏆" label="Competitions" amount={fromComps} />
        <IncomeCard icon="😴" label="Passive" amount={state.restDaysTaken * 5} />
      </div>
    </div>
  )
}

function IncomeCard({ icon, label, amount }) {
  return (
    <div style={{
      flex: 1, background: '#0f1117', borderRadius: 10,
      padding: '10px 6px', textAlign: 'center',
      border: '1px solid #1e2030',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: '#4caf80', letterSpacing: '0.04em' }}>
        ${Math.max(0, Math.floor(amount))}
      </div>
      <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function EarnScreen({ state }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>

      {/* Header */}
      <div style={{ padding: '16px 0 8px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#d4a853', letterSpacing: '0.06em', margin: 0 }}>
          EARNINGS
        </h2>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Financial overview</div>
      </div>

      {/* Balance */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1a0d 0%, #0d1a10 100%)',
        borderRadius: 14, border: '1px solid #2a4030',
        padding: 20, marginBottom: 14,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#4caf8060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Current Balance
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 56, color: '#4caf80', letterSpacing: '0.04em', lineHeight: 1 }}>
          ${Math.floor(state.money).toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: '#4caf8080', marginTop: 4 }}>
          Total Earned: ${Math.floor(state.stats.totalEarned).toLocaleString()}
        </div>
      </div>

      {/* Income breakdown */}
      <MoneyBreakdown state={state} />

      {/* Detailed stats */}
      <div style={{
        background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
        padding: 14, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Training Stats
        </div>
        <StatRow label="Total Reps" value={state.stats.totalReps.toLocaleString()} />
        <StatRow label="Total Sets" value={state.stats.totalSets.toLocaleString()} />
        <StatRow label="Rest Days" value={state.restDaysTaken} />
        <StatRow label="Days Active" value={state.totalDays} />
        <StatRow label="Competitions" value={state.stats.totalCompetitions} />
      </div>

      {/* Per-lift breakdown */}
      <div style={{
        background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
        padding: 14, marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Per-Lift Volume
        </div>
        {LIFTS.map(id => {
          const ls = state.lifts[id]
          return (
            <div key={id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid #12141e',
            }}>
              <span style={{ fontSize: 13, color: '#888' }}>
                {LIFT_ICONS[id]} {LIFT_LABELS[id]}
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#f0e6d0' }}>
                  {(ls.totalSets || 0)} sets · {(ls.totalReps || 0)} reps
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>
                  STR {Math.floor(ls.strength)} · PRing {ls.pr}kg
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Equipment bonuses */}
      {state.inventory.length > 0 && (
        <div style={{
          background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
          padding: 14,
        }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Active Equipment
          </div>
          {state.inventory.map(id => (
            <div key={id} style={{
              fontSize: 12, color: '#c8c0b0', padding: '4px 0',
              borderBottom: '1px solid #12141e',
            }}>
              ✓ {id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
          ))}
          {Object.entries(state.consumables).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12, color: '#d4a853', padding: '4px 0' }}>
              ⚡ {k.replace(/([A-Z])/g, ' $1').replace('Sessions', '').trim()} — {v} sessions left
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
