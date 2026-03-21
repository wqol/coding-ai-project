import React, { useRef, useEffect } from 'react'
import { getBodyScale } from '../gameState.js'

export default function LiftCanvas({ lift, avgStrength, pressing, sessionDone }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const pressRef = useRef(pressing)
  const doneRef = useRef(sessionDone)
  const strengthRef = useRef(avgStrength)
  const tRef = useRef(0)

  useEffect(() => { pressRef.current = pressing }, [pressing])
  useEffect(() => { doneRef.current = sessionDone }, [sessionDone])
  useEffect(() => { strengthRef.current = avgStrength }, [avgStrength])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 358, H = 200

    function draw() {
      const scale = getBodyScale(strengthRef.current)
      const lw = (0.75 + scale * 0.35)
      const pr = pressRef.current
      const t = pr ? Math.min(tRef.current + 0.08, 1) : Math.max(tRef.current - 0.06, 0)
      tRef.current = t

      ctx.clearRect(0, 0, W, H)

      // Floor shadow
      const shadowW = 60 * scale
      ctx.fillStyle = 'rgba(212,168,83,0.08)'
      ctx.beginPath()
      ctx.ellipse(W / 2, H - 18, shadowW, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      const cx = W / 2
      const bodyColor = '#e8e0d0'
      const armColor = '#d4a853'
      const barColor = '#888'
      const plateColor = '#d4a853'

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (lift === 'SQUAT') {
        drawSquat(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H)
      } else if (lift === 'BENCH') {
        drawBench(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H)
      } else {
        drawDeadlift(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [lift])

  return <canvas ref={canvasRef} width={358} height={200} style={{ width: '100%', height: '100%' }} />
}

function drawSquat(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H) {
  const baseY = H - 28
  const torsoLen = 50 * scale
  const legLen = 40 * scale
  const headR = 10 * scale

  // squat depth: t=0 standing, t=1 squatting
  const squat = t
  const hipDrop = squat * legLen * 0.7
  const kneeBend = squat * 25 * scale

  const hipY = baseY - legLen + hipDrop
  const shoulderY = hipY - torsoLen + squat * 8 * scale
  const headY = shoulderY - headR - 4

  // Legs
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 5 * lw
  // left leg
  const kneeY = (hipY + baseY) / 2
  ctx.beginPath()
  ctx.moveTo(cx - 8 * scale, hipY)
  ctx.quadraticCurveTo(cx - 8 * scale - kneeBend, kneeY, cx - 10 * scale, baseY)
  ctx.stroke()
  // right leg
  ctx.beginPath()
  ctx.moveTo(cx + 8 * scale, hipY)
  ctx.quadraticCurveTo(cx + 8 * scale + kneeBend, kneeY, cx + 10 * scale, baseY)
  ctx.stroke()

  // Torso
  ctx.lineWidth = 6 * lw
  ctx.beginPath()
  ctx.moveTo(cx, hipY)
  ctx.lineTo(cx, shoulderY)
  ctx.stroke()

  // Arms gripping bar (wide)
  const barWidth = 70 * scale
  ctx.strokeStyle = armColor
  ctx.lineWidth = 4 * lw
  ctx.beginPath()
  ctx.moveTo(cx, shoulderY)
  ctx.lineTo(cx - barWidth / 2, shoulderY + 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, shoulderY)
  ctx.lineTo(cx + barWidth / 2, shoulderY + 2)
  ctx.stroke()

  // Barbell on shoulders
  ctx.strokeStyle = barColor
  ctx.lineWidth = 3 * lw
  ctx.beginPath()
  ctx.moveTo(cx - barWidth / 2 - 15, shoulderY)
  ctx.lineTo(cx + barWidth / 2 + 15, shoulderY)
  ctx.stroke()

  // Plates
  const pw = 5 * scale
  const ph = 18 * scale
  ctx.fillStyle = plateColor
  ctx.fillRect(cx - barWidth / 2 - 15 - pw, shoulderY - ph / 2, pw, ph)
  ctx.fillRect(cx + barWidth / 2 + 15, shoulderY - ph / 2, pw, ph)

  // Head
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()
}

function drawBench(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H) {
  const baseY = H - 40
  const benchW = 80 * scale
  const benchH = 10 * scale

  // Bench
  ctx.fillStyle = '#1a1c28'
  ctx.fillRect(cx - benchW / 2, baseY, benchW, benchH)
  // Bench legs
  ctx.strokeStyle = '#1a1c28'
  ctx.lineWidth = 3 * lw
  ctx.beginPath()
  ctx.moveTo(cx - benchW / 2 + 5, baseY + benchH)
  ctx.lineTo(cx - benchW / 2 + 5, baseY + benchH + 20)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + benchW / 2 - 5, baseY + benchH)
  ctx.lineTo(cx + benchW / 2 - 5, baseY + benchH + 20)
  ctx.stroke()

  // Body lying on bench
  const bodyY = baseY - 4
  const headR = 8 * scale

  // Torso (horizontal)
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 7 * lw
  ctx.beginPath()
  ctx.moveTo(cx - 20 * scale, bodyY)
  ctx.lineTo(cx + 25 * scale, bodyY)
  ctx.stroke()

  // Head (right side)
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.arc(cx + 25 * scale + headR, bodyY, headR, 0, Math.PI * 2)
  ctx.fill()

  // Legs hanging off bench
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 5 * lw
  ctx.beginPath()
  ctx.moveTo(cx - 20 * scale, bodyY)
  ctx.lineTo(cx - 30 * scale, baseY + benchH + 18)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - 20 * scale, bodyY)
  ctx.lineTo(cx - 22 * scale, baseY + benchH + 18)
  ctx.stroke()

  // Arms pressing bar
  const armLen = 30 * scale
  const barY = bodyY - armLen * t - 8
  ctx.strokeStyle = armColor
  ctx.lineWidth = 4 * lw
  ctx.beginPath()
  ctx.moveTo(cx - 10 * scale, bodyY - 3)
  ctx.lineTo(cx - 15 * scale, barY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 10 * scale, bodyY - 3)
  ctx.lineTo(cx + 15 * scale, barY)
  ctx.stroke()

  // Barbell
  const barWidth = 75 * scale
  ctx.strokeStyle = barColor
  ctx.lineWidth = 3 * lw
  ctx.beginPath()
  ctx.moveTo(cx - barWidth / 2, barY)
  ctx.lineTo(cx + barWidth / 2, barY)
  ctx.stroke()

  // Plates
  const pw = 5 * scale
  const ph = 16 * scale
  ctx.fillStyle = plateColor
  ctx.fillRect(cx - barWidth / 2 - pw, barY - ph / 2, pw, ph)
  ctx.fillRect(cx + barWidth / 2, barY - ph / 2, pw, ph)
}

function drawDeadlift(ctx, cx, scale, lw, t, bodyColor, armColor, barColor, plateColor, H) {
  const baseY = H - 28
  const torsoLen = 50 * scale
  const legLen = 42 * scale
  const headR = 10 * scale

  // t=0 hinged, t=1 locked out
  const hinge = 1 - t
  const hipY = baseY - legLen + hinge * 15 * scale
  const leanAngle = hinge * 0.7
  const shoulderX = cx + Math.sin(leanAngle) * torsoLen * 0.5
  const shoulderY = hipY - Math.cos(leanAngle) * torsoLen
  const headY = shoulderY - headR - 4
  const headX = shoulderX + Math.sin(leanAngle) * (headR + 4)

  // Legs
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 5 * lw
  ctx.beginPath()
  ctx.moveTo(cx - 8 * scale, hipY)
  ctx.lineTo(cx - 8 * scale, baseY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + 8 * scale, hipY)
  ctx.lineTo(cx + 8 * scale, baseY)
  ctx.stroke()

  // Torso
  ctx.lineWidth = 6 * lw
  ctx.beginPath()
  ctx.moveTo(cx, hipY)
  ctx.lineTo(shoulderX, shoulderY)
  ctx.stroke()

  // Head
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.arc(headX, headY, headR, 0, Math.PI * 2)
  ctx.fill()

  // Bar position (floor when hinged, hip height when locked out)
  const barY = baseY - t * (baseY - hipY)

  // Arms
  ctx.strokeStyle = armColor
  ctx.lineWidth = 4 * lw
  ctx.beginPath()
  ctx.moveTo(shoulderX - 5 * scale, shoulderY)
  ctx.lineTo(cx - 12 * scale, barY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(shoulderX + 5 * scale, shoulderY)
  ctx.lineTo(cx + 12 * scale, barY)
  ctx.stroke()

  // Barbell
  const barWidth = 70 * scale
  ctx.strokeStyle = barColor
  ctx.lineWidth = 3 * lw
  ctx.beginPath()
  ctx.moveTo(cx - barWidth / 2, barY)
  ctx.lineTo(cx + barWidth / 2, barY)
  ctx.stroke()

  // Plates
  const pw = 5 * scale
  const ph = 18 * scale
  ctx.fillStyle = plateColor
  ctx.fillRect(cx - barWidth / 2 - pw, barY - ph / 2, pw, ph)
  ctx.fillRect(cx + barWidth / 2, barY - ph / 2, pw, ph)
}
