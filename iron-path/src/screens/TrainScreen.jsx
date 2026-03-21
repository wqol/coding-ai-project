import React, { useState, useRef, useCallback } from 'react'
import LiftCanvas from '../components/LiftCanvas.jsx'
import { LIFTS, SETS, SCHEMES, calcRisk } from '../gameState.js'

const liftLabels = { SQUAT: 'SQUAT', BENCH: 'BENCH', DEADLIFT: 'DEAD' }

export default function TrainScreen({ state, dispatch }) {
  const { activeLift, weights, strength, fatigue, scheme, warmupTaps, warmedUp, currentSet, repsInSet, sessionDone, injured, form } = state
  const [pressing, setPressing] = useState(false)
  const [floats, setFloats] = useState([])
  const floatId = useRef(0)
  const weight = weights[activeLift]
  const str = strength[activeLift]
  const risk = calcRisk(weight, str, fatigue)
  const avgStrength = (strength.SQUAT + strength.BENCH + strength.DEADLIFT) / 3
  const schemeIndex = SCHEMES.indexOf(scheme)
  const repsLeft = scheme - repsInSet

  const handleTap = useCallback(() => {
    if (sessionDone || injured) return
    setPressing(true)
    setTimeout(() => setPressing(false), 120)
    dispatch({ type: 'TAP_REP' })
    const id = ++floatId.current
    setFloats(f => [...f, { id, x: 170 + Math.random() * 40, y: 0 }])
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 800)
  }, [sessionDone, injured, dispatch])

  return (
    <div style={{ padding: '0 24px', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#e8e0d0' }}>TRAIN</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0f1018', borderRadius: 20, padding: '5px 12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: fatigue < 50 ? '#3cb06a' : fatigue < 70 ? '#e09040' : '#e05555'
          }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#a09080' }}>
            {Math.round(fatigue)}% fatigue
          </span>
        </div>
      </div>

      {/* Lift Selector */}
      <div style={{
        marginTop: 20, display: 'flex', background: '#0f1018',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 3
      }}>
        {LIFTS.map(l => (
          <button key={l} onClick={() => dispatch({ type: 'SET_LIFT', payload: l })} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
            background: activeLift === l ? '#1e2030' : 'transparent',
            color: activeLift === l ? '#d4a853' : '#504840',
          }}>{liftLabels[l]}</button>
        ))}
      </div>

      {/* Canvas Area */}
      <div style={{
        marginTop: 18, background: '#0f1018', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 24, height: 200, position: 'relative', overflow: 'hidden'
      }}>
        <LiftCanvas lift={activeLift} avgStrength={avgStrength} pressing={pressing} sessionDone={sessionDone} />
        <div style={{
          position: 'absolute', bottom: 8, left: 14, right: 14,
          display: 'flex', justifyContent: 'space-between'
        }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {activeLift}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            Max ~{Math.round(str)}kg
          </span>
        </div>
      </div>

      {/* Weight Selector */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <button onClick={() => dispatch({ type: 'WEIGHT_DOWN' })} style={{
          width: 48, height: 48, borderRadius: '50%', background: '#0f1018',
          border: '1px solid rgba(255,255,255,0.08)', color: '#e8e0d0',
          fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>−</button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#e8e0d0', lineHeight: 1 }}>
            {weight}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#504840', marginLeft: 4 }}>kg</span>
        </div>
        <button onClick={() => dispatch({ type: 'WEIGHT_UP' })} style={{
          width: 48, height: 48, borderRadius: '50%', background: '#0f1018',
          border: '1px solid rgba(255,255,255,0.08)', color: '#e8e0d0',
          fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>+</button>
      </div>

      {/* Risk Row */}
      <div style={{
        marginTop: 14, background: '#0f1018', borderRadius: 12, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 2,
              background: i < risk.pips ? risk.color : 'rgba(255,255,255,0.06)'
            }} />
          ))}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: risk.color }}>
          {risk.label}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840' }}>
          injury risk
        </span>
      </div>

      {/* Rep Scheme */}
      <div style={{
        marginTop: 14, display: 'flex', background: '#0f1018',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 3
      }}>
        {SCHEMES.map(s => (
          <button key={s} onClick={() => dispatch({ type: 'SET_SCHEME', payload: s })} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
            background: scheme === s ? 'rgba(212,168,83,0.12)' : 'transparent',
            color: scheme === s ? '#d4a853' : '#504840',
          }}>{s}s</button>
        ))}
      </div>

      {/* Warm Up Bar */}
      <div onClick={() => !warmedUp && dispatch({ type: 'WARMUP_TAP' })} style={{
        marginTop: 12, background: '#0f1018', borderRadius: 12, padding: '12px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: warmedUp ? 'default' : 'pointer'
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
          color: warmedUp ? '#3cb06a' : '#a09080'
        }}>
          {warmedUp ? 'WARMED UP' : `WARM UP ${warmupTaps}/5`}
        </span>
        <div style={{
          width: 80, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden'
        }}>
          <div style={{
            width: `${(warmupTaps / 5) * 100}%`, height: '100%', borderRadius: 3,
            background: warmedUp ? '#3cb06a' : '#d4a853', transition: 'width 0.2s'
          }} />
        </div>
      </div>

      {/* Set Blocks */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => {
          const done = i < currentSet
          const active = i === currentSet && !sessionDone
          return (
            <div key={i} style={{
              flex: 1, background: done ? 'rgba(212,168,83,0.1)' : '#0f1018',
              borderRadius: 14, padding: '12px 0', textAlign: 'center',
              border: active ? '1px solid rgba(212,168,83,0.4)' : '1px solid rgba(255,255,255,0.04)',
              boxShadow: active ? '0 0 12px rgba(212,168,83,0.08)' : 'none'
            }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840', marginBottom: 4 }}>
                SET {i + 1}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: done ? '#d4a853' : '#e8e0d0' }}>
                {done ? '✓' : active ? `${repsInSet}/${scheme}` : `0/${scheme}`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tap Button / Session Done */}
      {sessionDone ? (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{
            background: '#0f1018', borderRadius: 20, padding: 24,
            border: '1px solid rgba(212,168,83,0.15)'
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#d4a853' }}>
              SESSION COMPLETE
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#a09080', marginTop: 6 }}>
              {SETS}×{scheme} @ {weight}kg
            </div>
          </div>
          <button onClick={() => dispatch({ type: 'NEW_SESSION' })} style={{
            marginTop: 14, width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #d4a853, #b8903e)', color: '#08090d',
            fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>New Session</button>
        </div>
      ) : (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {/* Floating +1 texts */}
          {floats.map(f => (
            <span key={f.id} style={{
              position: 'absolute', left: f.x, top: 40,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#d4a853',
              pointerEvents: 'none', animation: 'floatUp 0.8s ease forwards'
            }}>+1</span>
          ))}
          <button onClick={handleTap} style={{
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #1c1f2e, #0f1018)',
            border: '1.5px solid rgba(212,168,83,0.25)',
            boxShadow: '0 0 40px rgba(212,168,83,0.06)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            transition: 'transform 0.1s',
            transform: pressing ? 'scale(0.9)' : 'scale(1)'
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: '#504840', textTransform: 'uppercase', letterSpacing: 1 }}>
              {activeLift}
            </span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#d4a853', lineHeight: 1 }}>
              TAP
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#504840' }}>
              {repsLeft} reps left
            </span>
          </button>
        </div>
      )}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
      `}</style>
    </div>
  )
}
