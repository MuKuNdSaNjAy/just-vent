import { forwardRef } from 'react'
import MicButton from './MicButton'

const MAX_CHARS = 1000

const VentArea = forwardRef(function VentArea(
  { ventText, onChange, onTranscript, onError, speechCode, disabled, onKeyDown, compact },
  ref
) {
  const remaining   = MAX_CHARS - ventText.length
  const isNearLimit = remaining <= 100

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
          style={compact ? { borderRadius: '1rem', padding: '0.65rem 3rem 0.65rem 1rem' } : { paddingRight: '3.5rem' }}
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

      <div className={`text-right text-xs transition-colors duration-200 ${
        isNearLimit ? 'text-red-400 font-medium' : 'text-pitch-500'
      }`}>
        {remaining} / {MAX_CHARS}
      </div>
    </div>
  )
})

export default VentArea
