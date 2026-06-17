import { useState, useEffect, useRef } from 'react'

const PHASES = [
  { name: 'Inhale',  seconds: 4, instruction: 'Breathe in slowly through your nose',    scale: 1.25 },
  { name: 'Hold',    seconds: 7, instruction: 'Hold your breath gently',                 scale: 1.25 },
  { name: 'Exhale',  seconds: 8, instruction: 'Let it all out slowly through your mouth', scale: 1 },
]

export default function BreathingExercise({ onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [tick, setTick]         = useState(0)
  const [running, setRunning]   = useState(false)
  const [cycles, setCycles]     = useState(0)
  const intervalRef             = useRef(null)
  const phase    = PHASES[phaseIdx]
  const progress = tick / phase.seconds
  const circumference = 2 * Math.PI * 80

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTick((t) => {
        if (t + 1 >= phase.seconds) {
          const next = (phaseIdx + 1) % PHASES.length
          if (next === 0) setCycles((c) => c + 1)
          setPhaseIdx(next)
          return 0
        }
        return t + 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phaseIdx, phase.seconds])

  function reset() {
    setRunning(false)
    setPhaseIdx(0)
    setTick(0)
    setCycles(0)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(9,6,8,0.94)', backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '1.75rem',
    }}>
      <div>
        <p style={{ color: '#D4622A', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
          4-7-8 Breathing
        </p>
        <p style={{ color: '#2a2a2a', fontSize: '0.72rem', textAlign: 'center' }}>
          {cycles > 0 ? `${cycles} cycle${cycles > 1 ? 's' : ''} complete` : 'A calming exercise for your nervous system'}
        </p>
      </div>

      {/* Animated ring */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(212,98,42,0.07)" strokeWidth="4" />
          <circle
            cx="100" cy="100" r="80" fill="none"
            stroke="rgba(212,98,42,0.6)" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Pulsing inner circle */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'rgba(212,98,42,0.06)',
            border: '1px solid rgba(212,98,42,0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${running ? phase.scale : 1})`,
            transition: `transform ${phase.seconds}s ease-in-out`,
          }}>
            <p style={{ color: '#D4622A', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.1 }}>{phase.name}</p>
            <p style={{ color: '#4a4a4a', fontSize: '0.82rem' }}>{phase.seconds - tick}s</p>
          </div>
        </div>
      </div>

      <p style={{ color: '#3a3a3a', fontSize: '0.8rem', maxWidth: 260, textAlign: 'center', lineHeight: 1.7 }}>
        {phase.instruction}
      </p>

      {/* Phase dots */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {PHASES.map((p, i) => (
          <div key={p.name} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i === phaseIdx ? '#D4622A' : 'rgba(212,98,42,0.2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            padding: '0.6rem 2rem', borderRadius: '999px',
            background: running ? 'transparent' : 'linear-gradient(135deg,#E8943A,#D4622A)',
            border: running ? '1px solid rgba(212,98,42,0.3)' : 'none',
            color: running ? '#D4622A' : '#0e0e0e',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        {(running || cycles > 0) && (
          <button
            onClick={reset}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '999px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
              color: '#333', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Reset
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            padding: '0.6rem 1.2rem', borderRadius: '999px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
            color: '#333', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
