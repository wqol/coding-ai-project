// ─── Constants ────────────────────────────────────────────────────────────────

export const LIFTS = ['squat', 'bench', 'deadlift']

export const LIFT_LABELS = {
  squat: 'Squat',
  bench: 'Bench Press',
  deadlift: 'Deadlift',
}

export const LIFT_ICONS = {
  squat: '🦵',
  bench: '💪',
  deadlift: '🏋️',
}

// Base starting weights (kg)
const BASE_WEIGHT = { squat: 60, bench: 40, deadlift: 80 }

// How many reps per set
export const REPS_PER_SET = 5

// Fatigue constants
const FATIGUE_PER_SET = 8          // fatigue added per completed set
const FATIGUE_RECOVERY_PER_DAY = 40 // fatigue recovered per rest day
const MAX_FATIGUE = 100

// Strength gain per set (base)
const STRENGTH_GAIN_BASE = 1.5

// Weight increment per strength level
const WEIGHT_PER_STRENGTH = 2.5

// Risk thresholds
const RISK_SAFE = 0.8      // weight/strength ratio below this = safe
const RISK_MODERATE = 1.0
const RISK_HIGH = 1.2

// Injury chance at high risk (per set attempt)
const INJURY_CHANCE_MODERATE = 0.03
const INJURY_CHANCE_HIGH = 0.12

// Shop items
export const SHOP_ITEMS = [
  {
    id: 'chalk',
    name: 'Gym Chalk',
    description: '+10% grip strength, reduces bench/deadlift injury risk',
    cost: 50,
    icon: '🤍',
    effect: { gripBonus: 0.1 },
  },
  {
    id: 'belt',
    name: 'Lifting Belt',
    description: '+15% squat/deadlift strength, reduces injury risk',
    cost: 120,
    icon: '🥋',
    effect: { beltBonus: 0.15 },
  },
  {
    id: 'preworkout',
    name: 'Pre-Workout',
    description: 'Double strength gains for 3 sessions',
    cost: 80,
    icon: '⚡',
    effect: { preworkoutSessions: 3 },
    consumable: true,
  },
  {
    id: 'sleeves',
    name: 'Knee Sleeves',
    description: '+10% squat strength, -20% squat injury risk',
    cost: 90,
    icon: '🦿',
    effect: { sleevesBonus: 0.1 },
  },
  {
    id: 'wraps',
    name: 'Wrist Wraps',
    description: '+10% bench strength, -20% bench injury risk',
    cost: 90,
    icon: '🩹',
    effect: { wrapsBonus: 0.1 },
  },
  {
    id: 'protein',
    name: 'Protein Shake',
    description: '+50% strength gains for next 5 sessions',
    cost: 40,
    icon: '🥤',
    effect: { proteinSessions: 5 },
    consumable: true,
  },
  {
    id: 'gym_membership',
    name: 'Gym Membership',
    description: 'Unlock auto-training: earn reps while away',
    cost: 500,
    icon: '🏟️',
    effect: { autoTrain: true },
  },
  {
    id: 'coach',
    name: 'Personal Coach',
    description: 'Optimal programming: +25% all strength gains',
    cost: 1000,
    icon: '👨‍🏫',
    effect: { coachBonus: 0.25 },
  },
]

// Competition tiers
export const COMP_TIERS = [
  { id: 'local', name: 'Local Meet', entryFee: 0, prize: 100, minTotal: 0 },
  { id: 'regional', name: 'Regional Championship', entryFee: 25, prize: 500, minTotal: 300 },
  { id: 'national', name: 'National Championship', entryFee: 100, prize: 2000, minTotal: 600 },
  { id: 'world', name: 'World Championship', entryFee: 500, prize: 10000, minTotal: 1000 },
]

// Body stats tiers (for visual feedback)
export const BODY_TIERS = [
  { minStrength: 0, label: 'Beginner', scale: 1.0 },
  { minStrength: 50, label: 'Novice', scale: 1.05 },
  { minStrength: 150, label: 'Intermediate', scale: 1.12 },
  { minStrength: 300, label: 'Advanced', scale: 1.2 },
  { minStrength: 500, label: 'Elite', scale: 1.3 },
  { minStrength: 800, label: 'Pro', scale: 1.42 },
  { minStrength: 1200, label: 'Legend', scale: 1.55 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTotalStrength(lifts) {
  return LIFTS.reduce((sum, l) => sum + lifts[l].strength, 0)
}

export function getCompTotal(lifts) {
  return LIFTS.reduce((sum, l) => sum + lifts[l].currentWeight, 0)
}

export function getBodyTier(totalStrength) {
  let tier = BODY_TIERS[0]
  for (const t of BODY_TIERS) {
    if (totalStrength >= t.minStrength) tier = t
  }
  return tier
}

export function getLiftWeight(liftState) {
  return BASE_WEIGHT[liftState.id] + liftState.strength * WEIGHT_PER_STRENGTH
}

function getRiskRatio(liftState, fatigue) {
  const maxCapacity = liftState.strength * 10 + 100
  const fatigueMultiplier = 1 + (fatigue / MAX_FATIGUE) * 0.5
  return (liftState.currentWeight / maxCapacity) * fatigueMultiplier
}

export function getRiskLevel(liftState, fatigue) {
  const ratio = getRiskRatio(liftState, fatigue)
  if (ratio < RISK_SAFE) return 'safe'
  if (ratio < RISK_MODERATE) return 'moderate'
  if (ratio < RISK_HIGH) return 'high'
  return 'extreme'
}

function checkInjury(liftState, fatigue) {
  const ratio = getRiskRatio(liftState, fatigue)
  if (ratio < RISK_MODERATE) return false
  const chance = ratio < RISK_HIGH ? INJURY_CHANCE_MODERATE : INJURY_CHANCE_HIGH
  return Math.random() < chance
}

// ─── Initial State ─────────────────────────────────────────────────────────────

function makeLiftState(id) {
  return {
    id,
    strength: 0,
    reps: 0,          // current reps in set
    sets: 0,          // total completed sets
    currentWeight: BASE_WEIGHT[id],
    pr: BASE_WEIGHT[id],
    injured: false,
    injuryDaysLeft: 0,
    totalReps: 0,
    totalSets: 0,
  }
}

export const INITIAL_STATE = {
  lifts: {
    squat: makeLiftState('squat'),
    bench: makeLiftState('bench'),
    deadlift: makeLiftState('deadlift'),
  },
  fatigue: 0,
  money: 20,
  day: 1,
  totalDays: 1,
  activeTab: 'train',
  activeLift: 'squat',
  restDaysTaken: 0,
  competitions: [],
  inventory: [],          // owned non-consumable item ids
  consumables: {},        // { itemId: remainingSessions }
  notifications: [],
  stats: {
    totalReps: 0,
    totalSets: 0,
    totalCompetitions: 0,
    totalEarned: 0,
    bestTotal: 0,
  },
  lastSaved: null,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state, action) {
  switch (action.type) {
    case 'DO_REP':
      return doRep(state, action.lift)
    case 'CHANGE_WEIGHT':
      return changeWeight(state, action.lift, action.delta)
    case 'REST_DAY':
      return takeRestDay(state)
    case 'COMPETE':
      return compete(state, action.tierId)
    case 'BUY_ITEM':
      return buyItem(state, action.itemId)
    case 'SET_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_LIFT':
      return { ...state, activeLift: action.lift }
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((_, i) => i !== action.index),
      }
    case 'TICK':
      return tick(state)
    case 'LOAD':
      return action.state
    default:
      return state
  }
}

// ─── Action Handlers ──────────────────────────────────────────────────────────

function doRep(state, liftId) {
  const lift = { ...state.lifts[liftId] }

  if (lift.injured) {
    return addNotification(state, `${LIFT_LABELS[liftId]} is injured! Rest to recover.`, 'error')
  }

  if (state.fatigue >= MAX_FATIGUE) {
    return addNotification(state, 'Too fatigued! Take a rest day.', 'warning')
  }

  lift.reps += 1
  lift.totalReps = (lift.totalReps || 0) + 1

  let newState = {
    ...state,
    lifts: { ...state.lifts, [liftId]: lift },
    stats: { ...state.stats, totalReps: state.stats.totalReps + 1 },
  }

  // Complete a set
  if (lift.reps >= REPS_PER_SET) {
    newState = completeSet(newState, liftId)
  }

  return newState
}

function completeSet(state, liftId) {
  const lift = { ...state.lifts[liftId] }
  lift.reps = 0
  lift.sets = (lift.sets || 0) + 1
  lift.totalSets = (lift.totalSets || 0) + 1

  // Check injury
  if (checkInjury(lift, state.fatigue)) {
    lift.injured = true
    lift.injuryDaysLeft = 3 + Math.floor(Math.random() * 3)
    const newState = {
      ...state,
      lifts: { ...state.lifts, [liftId]: lift },
      fatigue: Math.min(MAX_FATIGUE, state.fatigue + FATIGUE_PER_SET * 1.5),
      stats: { ...state.stats, totalSets: state.stats.totalSets + 1 },
    }
    return addNotification(newState, `INJURY! ${LIFT_LABELS[liftId]} strained. Rest ${lift.injuryDaysLeft} days.`, 'error')
  }

  // Strength gain
  let gain = STRENGTH_GAIN_BASE
  // Apply consumables
  const consumables = { ...state.consumables }
  if (consumables.preworkout > 0) {
    gain *= 2
    consumables.preworkout -= 1
  }
  if (consumables.protein > 0) {
    gain *= 1.5
    consumables.protein -= 1
  }
  // Apply owned items
  const inv = state.inventory
  if (inv.includes('coach')) gain *= 1.25
  if (inv.includes('belt') && (liftId === 'squat' || liftId === 'deadlift')) gain *= 1.15
  if (inv.includes('sleeves') && liftId === 'squat') gain *= 1.1
  if (inv.includes('wraps') && liftId === 'bench') gain *= 1.1

  lift.strength = parseFloat((lift.strength + gain).toFixed(2))
  lift.currentWeight = parseFloat((BASE_WEIGHT[liftId] + lift.strength * WEIGHT_PER_STRENGTH).toFixed(1))

  // Track PR
  if (lift.currentWeight > lift.pr) {
    lift.pr = lift.currentWeight
  }

  const newFatigue = Math.min(MAX_FATIGUE, state.fatigue + FATIGUE_PER_SET)
  const moneyEarned = 1 + Math.floor(lift.sets / 10)

  const newState = {
    ...state,
    lifts: { ...state.lifts, [liftId]: lift },
    fatigue: newFatigue,
    money: state.money + moneyEarned,
    consumables,
    stats: {
      ...state.stats,
      totalSets: state.stats.totalSets + 1,
      totalEarned: state.stats.totalEarned + moneyEarned,
    },
  }

  return newState
}

function changeWeight(state, liftId, delta) {
  const lift = { ...state.lifts[liftId] }
  const minWeight = BASE_WEIGHT[liftId]
  const newWeight = Math.max(minWeight, parseFloat((lift.currentWeight + delta).toFixed(1)))
  lift.currentWeight = newWeight
  return { ...state, lifts: { ...state.lifts, [liftId]: lift } }
}

function takeRestDay(state) {
  const newFatigue = Math.max(0, state.fatigue - FATIGUE_RECOVERY_PER_DAY)

  // Heal injuries
  const newLifts = { ...state.lifts }
  const healed = []
  for (const id of LIFTS) {
    const lift = { ...newLifts[id] }
    if (lift.injured) {
      lift.injuryDaysLeft = Math.max(0, lift.injuryDaysLeft - 1)
      if (lift.injuryDaysLeft === 0) {
        lift.injured = false
        healed.push(LIFT_LABELS[id])
      }
    }
    newLifts[id] = lift
  }

  let newState = {
    ...state,
    lifts: newLifts,
    fatigue: newFatigue,
    day: state.day + 1,
    totalDays: state.totalDays + 1,
    restDaysTaken: state.restDaysTaken + 1,
    money: state.money + 5, // small passive income on rest
  }

  // Auto-train if gym membership
  if (state.inventory.includes('gym_membership')) {
    for (const id of LIFTS) {
      if (!newState.lifts[id].injured) {
        newState = completeSet(newState, id)
      }
    }
  }

  if (healed.length > 0) {
    newState = addNotification(newState, `${healed.join(', ')} recovered!`, 'success')
  }

  return addNotification(newState, `Rest day taken. Fatigue: ${Math.round(newFatigue)}%`, 'info')
}

function compete(state, tierId) {
  const tier = COMP_TIERS.find(t => t.id === tierId)
  if (!tier) return state

  const total = getCompTotal(state.lifts)
  if (total < tier.minTotal) {
    return addNotification(state, `Need ${tier.minTotal}kg total to enter ${tier.name}`, 'error')
  }
  if (state.money < tier.entryFee) {
    return addNotification(state, `Need $${tier.entryFee} entry fee`, 'error')
  }

  // Simple competition: chance of winning based on strength vs tier difficulty
  const difficulty = tier.minTotal === 0 ? 200 : tier.minTotal * 2
  const winChance = Math.min(0.9, Math.max(0.1, total / difficulty))
  const won = Math.random() < winChance
  const prize = won ? tier.prize : Math.floor(tier.prize * 0.1) // consolation prize

  const placement = won ? '1st Place' : (Math.random() < 0.4 ? '2nd Place' : '3rd Place')

  const newTotal = total
  const bestTotal = Math.max(state.stats.bestTotal, newTotal)

  const compRecord = {
    id: Date.now(),
    tierId,
    tierName: tier.name,
    total,
    placement,
    prize,
    day: state.day,
  }

  let newState = {
    ...state,
    money: state.money - tier.entryFee + prize,
    competitions: [...state.competitions, compRecord],
    stats: {
      ...state.stats,
      totalCompetitions: state.stats.totalCompetitions + 1,
      totalEarned: state.stats.totalEarned + prize,
      bestTotal,
    },
  }

  const msg = won
    ? `🏆 ${placement} at ${tier.name}! Won $${prize}!`
    : `${placement} at ${tier.name}. Prize: $${prize}`

  return addNotification(newState, msg, won ? 'success' : 'info')
}

function buyItem(state, itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId)
  if (!item) return state

  if (state.money < item.cost) {
    return addNotification(state, `Not enough money! Need $${item.cost}`, 'error')
  }

  // Already owned non-consumable
  if (!item.consumable && state.inventory.includes(itemId)) {
    return addNotification(state, `Already own ${item.name}`, 'warning')
  }

  let newInventory = state.inventory
  let newConsumables = { ...state.consumables }

  if (item.consumable) {
    const key = Object.keys(item.effect)[0]
    newConsumables[key] = (newConsumables[key] || 0) + item.effect[key]
  } else {
    newInventory = [...newInventory, itemId]
  }

  const newState = {
    ...state,
    money: state.money - item.cost,
    inventory: newInventory,
    consumables: newConsumables,
    stats: { ...state.stats, totalEarned: state.stats.totalEarned },
  }

  return addNotification(newState, `Bought ${item.name}!`, 'success')
}

function tick(state) {
  // Passive idle tick - small fatigue recovery over time
  if (state.fatigue <= 0) return state
  return { ...state, fatigue: Math.max(0, state.fatigue - 0.1) }
}

// ─── Notification Helper ───────────────────────────────────────────────────────

function addNotification(state, message, type = 'info') {
  const note = { id: Date.now() + Math.random(), message, type, time: Date.now() }
  return {
    ...state,
    notifications: [...state.notifications.slice(-4), note],
  }
}
