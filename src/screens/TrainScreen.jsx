import { useState } from 'react'
import LiftCanvas from '../components/LiftCanvas'
import {
  LIFTS, LIFT_LABELS, LIFT_ICONS,
  REPS_PER_SET, getRiskLevel,
} from '../gameState'

const RISK_COLORS = {
  safe: '#4caf80',
  moderate: '#f0c040',
  high: '#e07840',
  extreme: '#e05252',
}

const RISK_LABELS = {
  safe: 'Safe',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  extreme: 'EXTREME RISK',
}

function RepDots({ reps, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: i < reps ? '#d4a853' : '#1e2030',
            border: `1.5px solid ${i < reps ? '#d4a853' : '#2a2d40'}`,
            transition: 'background 0.15s',
          }}
        />
      ))}
    </div>
  )
}

function FatigueBar({ fatigue }) {
  const pct = Math.round(fatigue)
  const color = fatigue < 40 ? '#4caf80' : fatigue < 70 ? '#f0c040' : '#e05252'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#666', width: 52, textAlign: 'right' }}>FATIGUE</span>
      <div style={{
        flex: 1, height: 6, background: '#1e2030', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: 3, transition: 'width 0.3s, background 0.3s',
        }} />
      </div>
      <span style={{ fontSize: 11, color, width: 30, textAlign: 'left' }}>{pct}%</span>
    </div>
  )
}

export default function TrainScreen({ state, dispatch }) {
  const { activeLift, fatigue } = state
  const liftState = state.lifts[activeLift]
  const risk = getRiskLevel(liftState, fatigue)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Lift selector tabs */}
      <div style={{
        display: 'flex',
        background: '#0f1117',
        borderBottom: '1px solid #1e2030',
        flexShrink: 0,
      }}>
        {LIFTS.map(id => {
          const active = id === activeLift
          const ls = state.lifts[id]
          return (
            <button
              key={id}
              onClick={() => dispatch({ type: 'SET_LIFT', lift: id })}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #d4a853' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 18 }}>{LIFT_ICONS[id]}</span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: active ? '#d4a853' : '#555',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {id}
              </span>
              {ls.injured && (
                <span style={{ fontSize: 9, color: '#e05252' }}>INJURED</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Canvas area */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <LiftCanvas state={state} lift={activeLift} />
        {liftState.injured && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(224,82,82,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#e05252',
              background: 'rgba(8,9,13,0.8)',
              padding: '4px 12px', borderRadius: 6,
              border: '1px solid #e05252',
            }}>
              INJURED — REST TO RECOVER
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 12px',
        background: '#0d0e14',
        borderTop: '1px solid #1e2030',
        borderBottom: '1px solid #1e2030',
        flexShrink: 0,
      }}>
        <StatChip label="WEIGHT" value={`${liftState.currentWeight}kg`} accent />
        <StatChip label="STRENGTH" value={Math.floor(liftState.strength)} />
        <StatChip label="PR" value={`${liftState.pr}kg`} />
        <StatChip label="SETS" value={liftState.totalSets || 0} />
      </div>

      {/* Scrollable lower section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Fatigue bar */}
        <FatigueBar fatigue={fatigue} />

        {/* Weight adjust */}
        <div style={{
          background: '#0f1117', borderRadius: 10, padding: '10px 14px',
          border: '1px solid #1e2030',
        }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Working Weight
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WeightButton label="-10" onClick={() => dispatch({ type: 'CHANGE_WEIGHT', lift: activeLift, delta: -10 })} />
            <WeightButton label="-2.5" onClick={() => dispatch({ type: 'CHANGE_WEIGHT', lift: activeLift, delta: -2.5 })} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 26, color: '#f0e6d0', letterSpacing: '0.04em' }}>
                {liftState.currentWeight}
              </span>
              <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>kg</span>
            </div>
            <WeightButton label="+2.5" onClick={() => dispatch({ type: 'CHANGE_WEIGHT', lift: activeLift, delta: 2.5 })} plus />
            <WeightButton label="+10" onClick={() => dispatch({ type: 'CHANGE_WEIGHT', lift: activeLift, delta: 10 })} plus />
          </div>

          {/* Risk indicator */}
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', borderRadius: 6,
            background: `${RISK_COLORS[risk]}18`,
            border: `1px solid ${RISK_COLORS[risk]}40`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: RISK_COLORS[risk],
              boxShadow: `0 0 6px ${RISK_COLORS[risk]}`,
            }} />
            <span style={{ fontSize: 11, color: RISK_COLORS[risk], fontWeight: 600 }}>
              {RISK_LABELS[risk]}
            </span>
          </div>
        </div>

        {/* Rep counter + button */}
        <div style={{
          background: '#0f1117', borderRadius: 10, padding: '12px 14px',
          border: '1px solid #1e2030',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {liftState.reps}/{REPS_PER_SET} Reps — Set {(liftState.totalSets || 0) + 1}
          </div>
          <RepDots reps={liftState.reps} total={REPS_PER_SET} />

          <button
            onClick={() => !liftState.injured && dispatch({ type: 'DO_REP', lift: activeLift })}
            disabled={liftState.injured}
            style={{
              width: '100%',
              padding: '16px 0',
              background: liftState.injured
                ? '#1e2030'
                : 'linear-gradient(135deg, #c49440 0%, #d4a853 50%, #e8c068 100%)',
              border: 'none',
              borderRadius: 12,
              fontFamily: 'Bebas Neue',
              fontSize: 22,
              letterSpacing: '0.08em',
              color: liftState.injured ? '#444' : '#08090d',
              cursor: liftState.injured ? 'not-allowed' : 'pointer',
              transition: 'transform 0.08s, opacity 0.15s',
              boxShadow: liftState.injured ? 'none' : '0 4px 20px rgba(212,168,83,0.3)',
              userSelect: 'none',
            }}
            onMouseDown={e => !liftState.injured && (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={e => !liftState.injured && (e.currentTarget.style.transform = 'scale(0.97)')}
            onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {liftState.injured ? '⚠ INJURED' : `${LIFT_LABELS[activeLift].toUpperCase()} — REP`}
          </button>
        </div>

        {/* Rest day */}
        <button
          onClick={() => dispatch({ type: 'REST_DAY' })}
          style={{
            width: '100%', padding: '12px 0',
            background: '#0f1117',
            border: '1px solid #2a2d40',
            borderRadius: 10,
            color: '#888', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          😴 Take Rest Day  (+recover fatigue)
        </button>
      </div>
    </div>
  )
}

function StatChip({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: accent ? '#d4a853' : '#f0e6d0', letterSpacing: '0.04em' }}>
        {value}
      </span>
    </div>
  )
}

function WeightButton({ label, onClick, plus }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 8px',
        background: plus ? '#0d1a0f' : '#1a0d0d',
        border: `1px solid ${plus ? '#2a4030' : '#402a2a'}`,
        borderRadius: 6,
        color: plus ? '#4caf80' : '#e05252',
        fontSize: 11, fontWeight: 700,
        cursor: 'pointer',
        minWidth: 38, textAlign: 'center',
      }}
    >
      {label}
    </button>
  )
}
