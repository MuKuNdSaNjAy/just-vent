import { useAudioRecorder } from '../hooks/useAudioRecorder'

const MAX_SECS = 120

function fmt(s) {
  const m   = Math.floor(s / 60)
  const sec = String(s % 60).padStart(2, '0')
  return `${m}:${sec}`
}

export default function MicButton({ speechCode, onTranscript, onError, disabled, small }) {
  // speechCode is 'en-IN' / 'hi-IN' etc. — Whisper wants just the base code
  const language = speechCode?.split('-')[0] ?? 'en'

  const { isRecording, isProcessing, elapsed, startRecording, stopRecording } =
    useAudioRecorder({ language, onTranscript, onError })

  const remaining = MAX_SECS - elapsed // counts down so the label matches stopRecording's title
  const sz = small ? 'w-7 h-7' : 'w-10 h-10'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={isRecording ? stopRecording : isProcessing ? undefined : startRecording}
        disabled={disabled || isProcessing}
        title={
          isProcessing ? 'Transcribing with Whisper…' :
          isRecording  ? `Stop recording (${fmt(remaining)} left)` :
                         'Record voice message (up to 2 min)'
        }
        aria-label={
          isProcessing ? 'Transcribing voice message' :
          isRecording  ? 'Stop recording' :
                         'Record voice message'
        }
        className={`flex items-center justify-center rounded-full transition-all duration-200
          disabled:cursor-not-allowed ${sz}`}
        style={
          isRecording ? {
            border: '2px solid #ef4444',
            background: 'rgba(239,68,68,0.12)',
            color: '#ef4444',
            animation: 'mic-pulse 1.4s ease-in-out infinite',
            boxShadow: '0 0 12px rgba(239,68,68,0.3)',
            opacity: 1,
          } : isProcessing ? {
            border: '2px solid rgba(212,98,42,0.35)',
            background: '#1C1210',
            color: '#D4622A',
            opacity: 0.75,
          } : {
            border: '2px solid rgba(212,98,42,0.4)',
            background: '#1C1210',
            color: '#D4622A',
            opacity: disabled ? 0.4 : 0.85,
          }
        }
        onMouseEnter={(e) => {
          if (!isRecording && !isProcessing && !disabled)
            e.currentTarget.style.borderColor = 'rgba(212,98,42,0.9)'
        }}
        onMouseLeave={(e) => {
          if (!isRecording && !isProcessing)
            e.currentTarget.style.borderColor = 'rgba(212,98,42,0.4)'
        }}
      >
        {isRecording ? (
          /* Stop square */
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : isProcessing ? (
          /* Spinner */
          <svg className={small ? 'w-3 h-3' : 'w-4 h-4'}
            style={{ animation: 'spin-gold 0.8s linear infinite' }}
            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path fill="currentColor" fillOpacity="0.85"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          /* Mic */
          <svg viewBox="0 0 24 24" fill="currentColor" className={small ? 'w-3 h-3' : 'w-4 h-4'}>
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
            <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 10z" />
          </svg>
        )}
      </button>

      {isRecording && (
        <span style={{
          fontSize: '0.78rem', color: '#ef4444',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em',
        }}>
          {fmt(remaining)}
        </span>
      )}

      {isProcessing && (
        <span style={{ fontSize: '0.72rem', color: '#D4622A', letterSpacing: '0.02em' }}>
          Transcribing…
        </span>
      )}
    </div>
  )
}
