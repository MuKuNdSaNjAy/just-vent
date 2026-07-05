import { forwardRef, useEffect } from 'react'
import MicButton from './MicButton'

const MAX_CHARS = 2000

const VentArea = forwardRef(function VentArea(
  { ventText, onChange, onTranscript, onError, speechCode, disabled, onKeyDown, compact },
  ref
) {
  const remaining   = MAX_CHARS - ventText.length
  const isNearLimit = remaining <= 100
  const wordCount   = ventText.trim() ? ventText.trim().split(/\s+/).length : 0

  // Auto-resize: grow with content, shrink back when cleared
  useEffect(() => {
    const el = ref?.current
    if (!el || !compact) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [ventText, compact, ref])

  return (
    <div className="space-y-1">
      <div className="relative">
        <textarea
          ref={ref}
          value={ventText}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={compact ? 'Keep going… (Enter to send)' : "What's on your mind? Let it all out…"}
          rows={compact ? 2 : 6}
          className="vent-textarea"
          style={compact
            ? { borderRadius: '1rem', padding: '0.65rem 3rem 0.65rem 1rem', resize: 'none', overflow: 'hidden', minHeight: '2.8rem' }
            : { paddingRight: '3.5rem' }}
        />
        {/* Mic — secondary, smaller when compact */}
        <div style={{ position: 'absolute', bottom: compact ? '0.5rem' : '0.75rem', right: '0.6rem', opacity: 0.6 }}>
          <MicButton
            speechCode={speechCode}
            onTranscript={onTranscript}
            onError={onError}
            disabled={disabled}
            small={compact}
          />
        </div>
      </div>

      {/* Progress bar */}
      {ventText.length > 0 && (
        <div style={{ height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(ventText.length / MAX_CHARS) * 100}%`,
            background: isNearLimit
              ? 'linear-gradient(90deg,#ef4444,#dc2626)'
              : 'linear-gradient(90deg,#D4622A,#E8943A)',
            borderRadius: 999,
            transition: 'width 0.1s ease, background 0.3s',
          }} />
        </div>
      )}

      <div className={`text-right text-xs transition-colors duration-200 ${
        isNearLimit ? 'text-red-400 font-medium' : 'text-pitch-500'
      }`}>
        {ventText.length > 0 && <span style={{ opacity: 0.45, marginRight: '0.4rem' }}>{wordCount}w ·</span>}
        {remaining} / {MAX_CHARS}
      </div>
    </div>
  )
})

export default VentArea
