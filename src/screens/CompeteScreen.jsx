import { COMP_TIERS, LIFTS, getCompTotal } from '../gameState'

const TIER_COLORS = {
  local: '#4caf80',
  regional: '#5b8dd9',
  national: '#d4a853',
  world: '#e05252',
}

export default function CompeteScreen({ state, dispatch }) {
  const compTotal = getCompTotal(state.lifts)
  const prTotal = LIFTS.reduce((s, id) => s + state.lifts[id].pr, 0)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>

      {/* Header */}
      <div style={{ padding: '16px 0 8px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#d4a853', letterSpacing: '0.06em', margin: 0 }}>
          COMPETITIONS
        </h2>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Day {state.day}</div>
      </div>

      {/* Total display */}
      <div style={{
        background: 'linear-gradient(135deg, #12141e 0%, #0d1018 100%)',
        borderRadius: 14, border: '1px solid #2a2d40',
        padding: '16px', marginBottom: 14,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Current Working Total
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 52, color: '#d4a853', letterSpacing: '0.04em', lineHeight: 1 }}>
          {compTotal.toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>kg</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
          PR Total: <span style={{ color: '#f0e6d0' }}>{prTotal.toFixed(1)} kg</span>
        </div>
        {state.stats.bestTotal > 0 && (
          <div style={{ fontSize: 11, color: '#555' }}>
            Best Competition Total: <span style={{ color: '#d4a853' }}>{state.stats.bestTotal.toFixed(1)} kg</span>
          </div>
        )}
      </div>

      {/* Competition tiers */}
      <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Available Meets
      </div>

      {COMP_TIERS.map(tier => {
        const canEnter = compTotal >= tier.minTotal && state.money >= tier.entryFee
        const tooWeak = compTotal < tier.minTotal
        const noMoney = state.money < tier.entryFee && !tooWeak
        const color = TIER_COLORS[tier.id]

        return (
          <div
            key={tier.id}
            style={{
              background: '#0d0e14',
              borderRadius: 12,
              border: `1px solid ${canEnter ? color + '40' : '#1e2030'}`,
              padding: '14px',
              marginBottom: 10,
              opacity: tooWeak ? 0.5 : 1,
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color, letterSpacing: '0.05em' }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  Min total: <span style={{ color: '#888' }}>{tier.minTotal > 0 ? `${tier.minTotal} kg` : 'None'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4caf80' }}>
                  ${tier.prize.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>
                  {tier.entryFee > 0 ? `Entry: $${tier.entryFee}` : 'Free entry'}
                </div>
              </div>
            </div>

            {/* Progress bar to min total */}
            {tier.minTotal > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ height: 4, background: '#1e2030', borderRadius: 2 }}>
                  <div style={{
                    width: `${Math.min(100, (compTotal / tier.minTotal) * 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}60, ${color})`,
                    borderRadius: 2,
                    transition: 'width 0.4s',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                  {compTotal >= tier.minTotal
                    ? '✓ Qualified'
                    : `${(tier.minTotal - compTotal).toFixed(1)} kg to qualify`}
                </div>
              </div>
            )}

            <button
              onClick={() => canEnter && dispatch({ type: 'COMPETE', tierId: tier.id })}
              disabled={!canEnter}
              style={{
                width: '100%',
                padding: '10px',
                background: canEnter
                  ? `linear-gradient(135deg, ${color}20, ${color}30)`
                  : '#1e2030',
                border: `1px solid ${canEnter ? color + '60' : '#2a2d40'}`,
                borderRadius: 8,
                color: canEnter ? color : '#444',
                fontSize: 13, fontWeight: 700,
                cursor: canEnter ? 'pointer' : 'not-allowed',
                letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              {tooWeak
                ? `Need ${(tier.minTotal - compTotal).toFixed(0)} kg more`
                : noMoney
                ? `Need $${tier.entryFee - state.money} more`
                : `COMPETE — Win $${tier.prize.toLocaleString()}`}
            </button>
          </div>
        )
      })}

      {/* Competition history */}
      {state.competitions.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8, marginBottom: 8 }}>
            Competition History
          </div>
          {[...state.competitions].reverse().slice(0, 10).map(comp => (
            <div
              key={comp.id}
              style={{
                background: '#0f1117',
                borderRadius: 10,
                border: '1px solid #1e2030',
                padding: '10px 12px',
                marginBottom: 6,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#c8c0b0', fontWeight: 600 }}>{comp.tierName}</div>
                <div style={{ fontSize: 10, color: '#555' }}>Day {comp.day} • Total: {comp.total.toFixed(1)} kg</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: comp.placement === '1st Place' ? '#d4a853' : '#888', fontWeight: 700 }}>
                  {comp.placement}
                </div>
                <div style={{ fontSize: 11, color: '#4caf80' }}>+${comp.prize}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
