import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { unlockAchievement } from '../lib/achievements'
import { burstConfetti } from '../lib/confetti'

const BRICK_COLORS = ['#6c5ce7', '#ff6b57', '#ffc23c', '#06d6a0']
const COLS = 7
const ROWS = 4

type Phase = 'idle' | 'playing' | 'won' | 'lost'

export default function ArkanoidWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const phaseRef = useRef<Phase>('idle')
  const [bricksLeft, setBricksLeft] = useState(COLS * ROWS)

  useEffect(() => { phaseRef.current = phase }, [phase])

  const startGame = () => {
    setPhase('playing')
    unlockAchievement({
      id: 'arkanoid-start',
      emoji: '🕹️',
      title: 'Game on!',
      message: 'You started an actual playable Arkanoid.',
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')!
    const W = 340, H = 220
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    // Responsive display size — the internal WxH simulation stays fixed so
    // physics never changes, but the canvas scales to fit narrow screens
    // instead of overflowing (which was clipping the right edge on mobile).
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    ctx.scale(dpr, dpr)

    const brickW = W / COLS
    const brickH = 16
    const brickPad = 3

    type Brick = { x: number; y: number; alive: boolean; color: string }
    let bricks: Brick[] = []

    const resetBricks = () => {
      bricks = []
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          bricks.push({
            x: c * brickW,
            y: r * brickH + 10,
            alive: true,
            color: BRICK_COLORS[r % BRICK_COLORS.length],
          })
        }
      }
      setBricksLeft(COLS * ROWS)
    }
    resetBricks()

    const paddle = { w: 60, h: 10, x: W / 2 - 30 }
    const ball = { x: W / 2, y: H - 40, vx: 1.5, vy: -2.1, r: 5 }

    const resetBall = () => {
      ball.x = W / 2; ball.y = H - 40
      ball.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5
      ball.vy = -2.1
      paddle.x = W / 2 - 30
    }

    let mouseX = W / 2
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * W
    }
    const onTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      if (t) mouseX = ((t.clientX - rect.left) / rect.width) * W
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onTouch, { passive: true })

    // Keyboard control — arrow keys nudge the same target the paddle eases toward
    const keys = { left: false, right: false }
    const KEY_SPEED = 7
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return
      if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault() }
      if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault() }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.left = false
      if (e.key === 'ArrowRight') keys.right = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const visState = { visible: true }
    const io = new IntersectionObserver(([entry]) => { visState.visible = entry.isIntersecting }, { threshold: 0.1 })
    io.observe(container)

    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // paper backdrop
      ctx.fillStyle = '#fdf9ef'
      ctx.fillRect(0, 0, W, H)

      // bricks
      for (const b of bricks) {
        if (!b.alive) continue
        ctx.fillStyle = b.color
        ctx.strokeStyle = '#171310'
        ctx.lineWidth = 2
        ctx.fillRect(b.x + brickPad, b.y, brickW - brickPad * 2, brickH - brickPad)
        ctx.strokeRect(b.x + brickPad, b.y, brickW - brickPad * 2, brickH - brickPad)
      }

      if (phaseRef.current === 'playing' && visState.visible) {
        // keyboard nudges the pointer target directly, so mouse and arrow keys blend smoothly
        if (keys.left) mouseX = Math.max(0, mouseX - KEY_SPEED)
        if (keys.right) mouseX = Math.min(W, mouseX + KEY_SPEED)

        // paddle follows pointer
        paddle.x += (mouseX - paddle.w / 2 - paddle.x) * 0.25
        paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x))

        ball.x += ball.vx
        ball.y += ball.vy

        if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1
        if (ball.y < ball.r) ball.vy *= -1

        // paddle collision
        if (
          ball.y + ball.r > H - 18 &&
          ball.y + ball.r < H - 18 + paddle.h &&
          ball.x > paddle.x &&
          ball.x < paddle.x + paddle.w &&
          ball.vy > 0
        ) {
          ball.vy *= -1
          const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)
          ball.vx = hit * 2.1
        }

        // brick collision
        for (const b of bricks) {
          if (!b.alive) continue
          if (
            ball.x > b.x && ball.x < b.x + brickW &&
            ball.y - ball.r < b.y + brickH - brickPad && ball.y + ball.r > b.y
          ) {
            b.alive = false
            ball.vy *= -1
            setBricksLeft((n) => n - 1)
            break
          }
        }

        if (bricks.every((b) => !b.alive)) {
          phaseRef.current = 'won'
          setPhase('won')
          const rect = canvas.getBoundingClientRect()
          burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 90)
          unlockAchievement({
            id: 'arkanoid-win',
            emoji: '🏆',
            title: 'Brick breaker!',
            message: 'You actually cleared the board. Nice.',
          })
        }

        if (ball.y > H + 20) {
          phaseRef.current = 'lost'
          setPhase('lost')
        }
      }

      // paddle
      ctx.fillStyle = '#171310'
      ctx.fillRect(paddle.x, H - 18, paddle.w, paddle.h)

      // ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b57'
      ctx.strokeStyle = '#171310'
      ctx.lineWidth = 2
      ctx.fill()
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onTouch)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      io.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'idle' ? 'reset' : 'run'])

  const replay = () => {
    setPhase('idle')
    setTimeout(startGame, 0)
  }

  return (
    <div ref={containerRef} className="relative rounded-xl overflow-hidden border-2 border-text-1 select-none" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} className="block w-full" />

      {phase === 'playing' && (
        <div className="absolute top-1.5 left-1.5 font-mono text-[0.65rem] font-bold bg-surface/90 px-2 py-0.5 rounded-md border border-text-1/20">
          {bricksLeft} bricks left
        </div>
      )}

      {phase !== 'playing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-[2px] text-center px-4">
          {phase === 'idle' && (
            <>
              <p className="font-mono text-xs text-text-2 font-bold">psst — this is actually playable</p>
              <p className="font-mono text-[0.65rem] text-text-2">mouse or ← → arrow keys</p>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={startGame}
                className="sticker-btn bg-accent text-white font-display font-bold text-sm px-5 py-2 rounded-full"
              >
                ▶ Play Arkanoid
              </motion.button>
            </>
          )}
          {phase === 'won' && (
            <>
              <p className="font-display font-bold text-lg text-text-1">🏆 Board cleared!</p>
              <motion.button whileTap={{ scale: 0.94 }} onClick={replay} className="sticker-btn bg-green text-text-1 font-display font-bold text-sm px-5 py-2 rounded-full">
                Play again
              </motion.button>
            </>
          )}
          {phase === 'lost' && (
            <>
              <p className="font-display font-bold text-lg text-text-1">Ball dropped — try again?</p>
              <motion.button whileTap={{ scale: 0.94 }} onClick={replay} className="sticker-btn bg-pink text-white font-display font-bold text-sm px-5 py-2 rounded-full">
                Retry
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
