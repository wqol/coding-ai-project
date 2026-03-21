import { useRef, useEffect } from 'react'
import { getBodyTier, getTotalStrength } from '../gameState'

// Draw a stickman doing a lift pose
function drawStickman(ctx, cx, cy, scale, lift, repFraction, injured) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  const color = injured ? '#e05252' : '#f0e6d0'
  const accentColor = injured ? '#ff6b6b' : '#d4a853'

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Breathing animation
  const breathe = Math.sin(Date.now() / 600) * 1.5

  if (lift === 'squat') {
    drawSquatPose(ctx, repFraction, breathe, color, accentColor)
  } else if (lift === 'bench') {
    drawBenchPose(ctx, repFraction, breathe, color, accentColor)
  } else {
    drawDeadliftPose(ctx, repFraction, breathe, color, accentColor)
  }

  ctx.restore()
}

function drawSquatPose(ctx, rep, breathe, color, accent) {
  // rep: 0 = standing, 1 = at bottom
  const squat = Math.sin(rep * Math.PI) // 0->1->0

  const headY = -80 + squat * 25 + breathe
  const hipY = -30 + squat * 20
  const kneeY = 10 + squat * 15
  const footY = 40

  // Head
  ctx.beginPath()
  ctx.arc(0, headY, 10, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.moveTo(0, headY + 10)
  ctx.lineTo(0, hipY)
  ctx.strokeStyle = color
  ctx.stroke()

  // Arms holding bar
  const armSpread = 28 + squat * 5
  ctx.beginPath()
  ctx.moveTo(-armSpread, hipY - 10)
  ctx.lineTo(0, headY + 15)
  ctx.moveTo(armSpread, hipY - 10)
  ctx.lineTo(0, headY + 15)
  ctx.strokeStyle = color
  ctx.stroke()

  // Barbell
  ctx.beginPath()
  ctx.moveTo(-armSpread - 18, hipY - 10)
  ctx.lineTo(armSpread + 18, hipY - 10)
  ctx.strokeStyle = accent
  ctx.lineWidth = 5
  ctx.stroke()

  // Plates
  ctx.lineWidth = 8
  ;[-armSpread - 18, armSpread + 18].forEach(x => {
    ctx.beginPath()
    ctx.moveTo(x, hipY - 20)
    ctx.lineTo(x, hipY)
    ctx.stroke()
  })

  ctx.lineWidth = 3
  ctx.strokeStyle = color

  // Legs
  ctx.beginPath()
  ctx.moveTo(0, hipY)
  ctx.lineTo(-16, kneeY)
  ctx.lineTo(-16, footY)
  ctx.moveTo(0, hipY)
  ctx.lineTo(16, kneeY)
  ctx.lineTo(16, footY)
  ctx.stroke()
}

function drawBenchPose(ctx, rep, breathe, color, accent) {
  const press = Math.sin(rep * Math.PI)

  // Lying figure
  ctx.save()
  ctx.translate(0, 10)

  // Bench
  ctx.beginPath()
  ctx.rect(-40, 10, 80, 8)
  ctx.fillStyle = '#2a2a3a'
  ctx.fill()

  // Body (lying)
  ctx.strokeStyle = color
  ctx.lineWidth = 3

  // Torso horizontal
  ctx.beginPath()
  ctx.moveTo(-32, 0)
  ctx.lineTo(20, 0)
  ctx.stroke()

  // Head
  ctx.beginPath()
  ctx.arc(30, 0, 9, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // Legs up
  ctx.beginPath()
  ctx.moveTo(-32, 0)
  ctx.lineTo(-38, -15)
  ctx.lineTo(-32, -30)
  ctx.moveTo(-32, 0)
  ctx.lineTo(-24, -15)
  ctx.lineTo(-18, -30)
  ctx.stroke()

  // Arms pressing
  const armH = -20 - press * 18
  ctx.beginPath()
  ctx.moveTo(-10, 0)
  ctx.lineTo(-22, armH)
  ctx.moveTo(10, 0)
  ctx.lineTo(22, armH)
  ctx.stroke()

  // Bar
  ctx.beginPath()
  ctx.moveTo(-30, armH)
  ctx.lineTo(30, armH)
  ctx.strokeStyle = accent
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.lineWidth = 8
  ;[-30, 30].forEach(x => {
    ctx.beginPath()
    ctx.moveTo(x, armH - 8)
    ctx.lineTo(x, armH + 8)
    ctx.stroke()
  })

  ctx.restore()
}

function drawDeadliftPose(ctx, rep, breathe, color, accent) {
  const pull = Math.sin(rep * Math.PI) // 0=hinged, 1=standing

  const hipY = -20 - pull * 35 + breathe
  const shoulderY = hipY - 30 - pull * 5
  const headY = shoulderY - 12
  const kneeY = 15 - pull * 15
  const footY = 38

  // Head
  ctx.beginPath()
  ctx.arc(0, headY, 9, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // Spine
  ctx.beginPath()
  ctx.moveTo(0, headY + 9)
  ctx.lineTo(0, hipY)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.stroke()

  // Arms down to bar
  const armExtend = (1 - pull) * 8
  ctx.beginPath()
  ctx.moveTo(-12, shoulderY)
  ctx.lineTo(-16 - armExtend, hipY + 30)
  ctx.moveTo(12, shoulderY)
  ctx.lineTo(16 + armExtend, hipY + 30)
  ctx.stroke()

  // Bar
  const barY = hipY + 30 + (1 - pull) * 15
  ctx.beginPath()
  ctx.moveTo(-35, barY)
  ctx.lineTo(35, barY)
  ctx.strokeStyle = accent
  ctx.lineWidth = 5
  ctx.stroke()

  // Plates
  ctx.lineWidth = 8
  ;[-35, 35].forEach(x => {
    ctx.beginPath()
    ctx.moveTo(x, barY - 9)
    ctx.lineTo(x, barY + 9)
    ctx.stroke()
  })

  ctx.lineWidth = 3
  ctx.strokeStyle = color

  // Legs
  ctx.beginPath()
  ctx.moveTo(-8, hipY)
  ctx.lineTo(-12, kneeY)
  ctx.lineTo(-12, footY)
  ctx.moveTo(8, hipY)
  ctx.lineTo(12, kneeY)
  ctx.lineTo(12, footY)
  ctx.stroke()
}

export default function LiftCanvas({ state, lift }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const liftState = state.lifts[lift]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Background gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.7)
      bg.addColorStop(0, '#12141e')
      bg.addColorStop(1, '#08090d')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Ground line
      ctx.beginPath()
      ctx.moveTo(w * 0.1, h * 0.72)
      ctx.lineTo(w * 0.9, h * 0.72)
      ctx.strokeStyle = '#1e2030'
      ctx.lineWidth = 1
      ctx.stroke()

      const totalStrength = getTotalStrength(state.lifts)
      const tier = getBodyTier(totalStrength)
      const scale = tier.scale * 0.85

      const repFraction = liftState.reps / 5

      drawStickman(ctx, w / 2, h * 0.6, scale, lift, repFraction, liftState.injured)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [state.lifts, lift, liftState.reps, liftState.injured])

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={200}
      style={{ width: '100%', height: 200, display: 'block' }}
    />
  )
}
