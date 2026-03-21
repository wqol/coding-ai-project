export const LIFTS = ['SQUAT', 'BENCH', 'DEADLIFT']
export const SETS = 3
export const SCHEMES = [1, 3, 5, 8]

export function getInitialState() {
  return {
    activeTab: 'TRAIN',
    day: 1,
    fatigue: 18,
    form: 48,
    health: 100,
    injured: false,
    injuryDays: 0,
    weights: { SQUAT: 60, BENCH: 40, DEADLIFT: 80 },
    strength: { SQUAT: 65, BENCH: 45, DEADLIFT: 85 },
    prs: { SQUAT: 0, BENCH: 0, DEADLIFT: 0 },
    activeLift: 'SQUAT',
    scheme: 5,
    warmupTaps: 0,
    warmedUp: false,
    currentSet: 0,
    repsInSet: 0,
    sessionDone: false,
    pendingPR: null
  }
}

export function calcRisk(weight, strength, fatigue) {
  const ratio = (weight / (strength * 1.05)) * 0.55 + (fatigue / 100) * 0.45
  if (ratio < 0.42) return { level: 0, label: 'SAFE', color: '#3cb06a', pips: 1 }
  if (ratio < 0.60) return { level: 1, label: 'LOW', color: '#7bc96f', pips: 2 }
  if (ratio < 0.75) return { level: 2, label: 'MODERATE', color: '#e09040', pips: 3 }
  if (ratio < 0.88) return { level: 3, label: 'HIGH', color: '#e07040', pips: 4 }
  return { level: 4, label: 'DANGEROUS', color: '#e05555', pips: 5 }
}

export function getBodyScale(avgStrength) {
  return 1.0 + Math.min(1, (avgStrength - 65) / 235) * 0.65
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload }

    case 'SET_LIFT':
      return {
        ...state,
        activeLift: action.payload,
        warmupTaps: 0,
        warmedUp: false,
        currentSet: 0,
        repsInSet: 0,
        sessionDone: false
      }

    case 'SET_SCHEME':
      return { ...state, scheme: action.payload }

    case 'WARMUP_TAP': {
      const taps = Math.min(state.warmupTaps + 1, 5)
      return {
        ...state,
        warmupTaps: taps,
        warmedUp: taps >= 5,
        form: Math.min(100, state.form + 4)
      }
    }

    case 'WEIGHT_UP':
      return {
        ...state,
        weights: {
          ...state.weights,
          [state.activeLift]: Math.min(500, state.weights[state.activeLift] + 2.5)
        }
      }

    case 'WEIGHT_DOWN':
      return {
        ...state,
        weights: {
          ...state.weights,
          [state.activeLift]: Math.max(20, state.weights[state.activeLift] - 2.5)
        }
      }

    case 'TAP_REP': {
      if (state.sessionDone || state.injured) return state

      const newRepsInSet = state.repsInSet + 1
      if (newRepsInSet < state.scheme) {
        return { ...state, repsInSet: newRepsInSet }
      }

      // Set complete
      const newCurrentSet = state.currentSet + 1
      const schemeIndex = SCHEMES.indexOf(state.scheme)
      const baseGains = [1.5, 0.95, 0.68, 0.48]
      const base = baseGains[schemeIndex] || 0.68
      const warmupMult = state.warmedUp ? 1.12 : 1.0
      const fatigueMult = Math.max(0.38, 1 - state.fatigue / 190)
      const formMult = 0.65 + (state.form / 100) * 0.35
      const weight = state.weights[state.activeLift]
      const str = state.strength[state.activeLift]
      const intensityMult = weight >= str * 0.68 ? 1.0 : 0.45
      const gain = base * warmupMult * fatigueMult * formMult * intensityMult

      const newStrength = {
        ...state.strength,
        [state.activeLift]: state.strength[state.activeLift] + gain
      }

      let newPRs = state.prs
      let pendingPR = null
      if (weight > state.prs[state.activeLift]) {
        newPRs = { ...state.prs, [state.activeLift]: weight }
        pendingPR = { lift: state.activeLift, kg: weight }
      }

      const fatigueAdds = [15, 11, 8, 6]
      let fatigueAdd = fatigueAdds[schemeIndex] || 8
      if (state.warmedUp) fatigueAdd *= 0.88
      const newFatigue = Math.min(100, state.fatigue + fatigueAdd)

      const formLoss = state.warmedUp ? 0.6 : 1.4
      const newForm = Math.max(8, state.form - formLoss)

      let injured = state.injured
      let injuryDays = state.injuryDays
      let health = state.health

      const risk = calcRisk(weight, str, state.fatigue)
      if (risk.level >= 3) {
        const injuryChances = [0.14, 0.07, 0.045, 0.025]
        const chance = (injuryChances[schemeIndex] || 0.045) * risk.level / 2.2
        if (Math.random() < chance) {
          injured = true
          injuryDays = 3
          health = Math.max(0, health - 28)
        }
      }

      const sessionDone = newCurrentSet >= SETS

      return {
        ...state,
        repsInSet: 0,
        currentSet: newCurrentSet,
        strength: newStrength,
        prs: newPRs,
        pendingPR: pendingPR || state.pendingPR,
        fatigue: newFatigue,
        form: newForm,
        injured,
        injuryDays,
        health,
        sessionDone
      }
    }

    case 'CLEAR_PR':
      return { ...state, pendingPR: null }

    case 'REST_DAY':
      return {
        ...state,
        fatigue: Math.max(0, state.fatigue - 38),
        form: Math.min(100, state.form + 6),
        health: Math.min(100, state.health + 12),
        injured: state.injuryDays <= 1 ? false : state.injured,
        injuryDays: state.injuryDays <= 1 ? 0 : state.injuryDays - 1,
        day: state.day + 1,
        currentSet: 0,
        repsInSet: 0,
        sessionDone: false,
        warmupTaps: 0,
        warmedUp: false
      }

    case 'NEW_SESSION':
      return {
        ...state,
        currentSet: 0,
        repsInSet: 0,
        sessionDone: false,
        warmupTaps: 0,
        warmedUp: false
      }

    case 'LOAD_SAVE':
      return { ...getInitialState(), ...action.payload, pendingPR: null }

    default:
      return state
  }
}
