import { LIFTS, LIFT_LABELS, LIFT_ICONS, getBodyTier, getTotalStrength, BODY_TIERS } from '../gameState'

function MuscleBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'Bebas Neue', color: '#f0e6d0', letterSpacing: '0.04em' }}>
          {Math.floor(value)}
        </span>
      </div>
      <div style={{ height: 6, background: '#1e2030', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 3,
          transition: 'width 0.4s',
        }} />
      </div>
    </div>
  )
}

function BodySilhouette({ scale, tier }) {
  // SVG stickman that grows with scale
  const s = scale
  return (
    <svg
      viewBox="-60 -100 120 200"
      width={120 * s}
      height={200 * s}
      style={{ transition: 'width 0.5s, height 0.5s' }}
    >
      {/* Glow behind figure */}
      <ellipse cx="0" cy="80" rx="40" ry="8" fill="#d4a853" opacity="0.12" />

      {/* Head */}
      <circle cx="0" cy="-80" r={11 + (s - 1) * 6} fill="#f0e6d0" />

      {/* Neck */}
      <rect x="-4" y="-69" width="8" height="8" fill="#f0e6d0" />

      {/* Torso — wider with scale */}
      <rect
        x={-(16 + (s - 1) * 18)}
        y="-61"
        width={32 + (s - 1) * 36}
        height={50 + (s - 1) * 10}
        rx={8 + (s - 1) * 4}
        fill="#f0e6d0"
        opacity="0.95"
      />

      {/* Arms */}
      <rect
        x={-(28 + (s - 1) * 28)}
        y="-58"
        width={12 + (s - 1) * 8}
        height={44 + (s - 1) * 8}
        rx={5}
        fill="#f0e6d0"
        opacity="0.9"
      />
      <rect
        x={16 + (s - 1) * 20}
        y="-58"
        width={12 + (s - 1) * 8}
        height={44 + (s - 1) * 8}
        rx={5}
        fill="#f0e6d0"
        opacity="0.9"
      />

      {/* Legs */}
      <rect
        x={-(14 + (s - 1) * 6)}
        y="-11"
        width={11 + (s - 1) * 6}
        height={60 + (s - 1) * 10}
        rx={5}
        fill="#f0e6d0"
        opacity="0.9"
      />
      <rect
        x={3 + (s - 1) * 0}
        y="-11"
        width={11 + (s - 1) * 6}
        height={60 + (s - 1) * 10}
        rx={5}
        fill="#f0e6d0"
        opacity="0.9"
      />

      {/* Tier label glow */}
      {s > 1.1 && (
        <text
          x="0" y="-98" textAnchor="middle"
          fontSize="9" fill="#d4a853" opacity="0.8"
          fontFamily="Bebas Neue" letterSpacing="2"
        >
          {tier.label.toUpperCase()}
        </text>
      )}
    </svg>
  )
}

export default function BodyScreen({ state }) {
  const totalStrength = getTotalStrength(state.lifts)
  const tier = getBodyTier(totalStrength)
  const nextTierIdx = BODY_TIERS.findIndex(t => t.minStrength > totalStrength)
  const nextTier = nextTierIdx >= 0 ? BODY_TIERS[nextTierIdx] : null

  const progressToNext = nextTier
    ? ((totalStrength - tier.minStrength) / (nextTier.minStrength - tier.minStrength)) * 100
    : 100

  const maxStrengthPerLift = 1500

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 16px 16px' }}>

      {/* Header */}
      <div style={{ padding: '16px 0 8px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: '#d4a853', letterSpacing: '0.06em', margin: 0 }}>
          ATHLETE PROFILE
        </h2>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Day {state.day} • {state.totalDays} days training</div>
      </div>

      {/* Body figure + tier */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0',
        background: '#0d0e14',
        borderRadius: 14,
        border: '1px solid #1e2030',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Physique Class
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: '#d4a853', letterSpacing: '0.06em', lineHeight: 1 }}>
          {tier.label}
        </div>

        <BodySilhouette scale={tier.scale} tier={tier} />

        {/* Progress to next tier */}
        {nextTier && (
          <div style={{ width: '80%', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#555' }}>→ {nextTier.label}</span>
              <span style={{ fontSize: 10, color: '#888' }}>{Math.floor(progressToNext)}%</span>
            </div>
            <div style={{ height: 4, background: '#1e2030', borderRadius: 2 }}>
              <div style={{
                width: `${progressToNext}%`, height: '100%',
                background: 'linear-gradient(90deg, #8a6020, #d4a853)',
                borderRadius: 2, transition: 'width 0.4s',
              }} />
            </div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 3, textAlign: 'right' }}>
              {Math.ceil(nextTier.minStrength - totalStrength)} strength needed
            </div>
          </div>
        )}
      </div>

      {/* Strength breakdown */}
      <div style={{
        background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
        padding: '14px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Strength Stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MuscleBar label={`${LIFT_ICONS.squat} Squat`} value={state.lifts.squat.strength} max={maxStrengthPerLift} color="#5b8dd9" />
          <MuscleBar label={`${LIFT_ICONS.bench} Bench`} value={state.lifts.bench.strength} max={maxStrengthPerLift} color="#d4a853" />
          <MuscleBar label={`${LIFT_ICONS.deadlift} Deadlift`} value={state.lifts.deadlift.strength} max={maxStrengthPerLift} color="#4caf80" />
        </div>
      </div>

      {/* PRs */}
      <div style={{
        background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
        padding: '14px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Personal Records
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {LIFTS.map(id => (
            <div key={id} style={{
              flex: 1, background: '#0f1117', borderRadius: 10,
              padding: '10px 6px', textAlign: 'center',
              border: '1px solid #1e2030',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{LIFT_ICONS[id]}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: '#d4a853', letterSpacing: '0.04em' }}>
                {state.lifts[id].pr}
              </div>
              <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase' }}>kg pr</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: '#0f1117', borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#888' }}>Competition Total</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: '#f0e6d0', letterSpacing: '0.04em' }}>
            {LIFTS.reduce((s, id) => s + state.lifts[id].pr, 0).toFixed(1)} kg
          </span>
        </div>
      </div>

      {/* Injury status */}
      <div style={{
        background: '#0d0e14', borderRadius: 14, border: '1px solid #1e2030',
        padding: '14px',
      }}>
        <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Injury Status
        </div>
        {LIFTS.map(id => {
          const ls = state.lifts[id]
          return (
            <div key={id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid #12141e',
            }}>
              <span style={{ fontSize: 13, color: '#c8c0b0' }}>
                {LIFT_ICONS[id]} {LIFT_LABELS[id]}
              </span>
              {ls.injured ? (
                <span style={{
                  fontSize: 11, color: '#e05252', fontWeight: 600,
                  background: '#e0525218', padding: '2px 8px', borderRadius: 10,
                  border: '1px solid #e0525240',
                }}>
                  Injured — {ls.injuryDaysLeft}d
                </span>
              ) : (
                <span style={{
                  fontSize: 11, color: '#4caf80', fontWeight: 600,
                  background: '#4caf8018', padding: '2px 8px', borderRadius: 10,
                  border: '1px solid #4caf8040',
                }}>
                  Healthy
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
