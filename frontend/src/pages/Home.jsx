import { useRef, useEffect, useState, useCallback } from 'react'
import { useVentState }      from '../hooks/useVentState'
import VentArea              from '../components/VentArea'
import LanguageSelector      from '../components/LanguageSelector'
import ApiStatus             from '../components/ApiStatus'
import VirtualKeyboard       from '../components/VirtualKeyboard'
import BreathingExercise     from '../components/BreathingExercise'

const MOODS = [
  { emoji: '😔', label: 'Low' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😶', label: 'Numb' },
  { emoji: '😞', label: 'Overwhelmed' },
  { emoji: '😕', label: 'Confused' },
  { emoji: '😌', label: 'Hopeful' },
  { emoji: '😴', label: 'Drained' },
]

const TONES = [
  { value: 'listen',      label: 'Just listen',       icon: '🤫' },
  { value: 'warm',        label: 'Be warmer',          icon: '🤗' },
  { value: 'perspective', label: 'Some perspective',   icon: '💭' },
]

export default function Home() {
  const {
    messages, ventText, setVentText,
    language, setLanguage,
    isLoading, error,
    mood, setMood,
    tone, setTone,
    showCrisis, setShowCrisis,
    isDone,
    appendTranscript, submitVent, requestAdvice, finishSession, clearAll,
  } = useVentState()

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const hasMessages = messages.length > 0
  const hasAiReply  = messages.some((m) => m.role === 'ai')

  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false)
  const [micError, setMicError]                       = useState(null)
  const [showBreathing, setShowBreathing]             = useState(false)

  // Auto-show keyboard when a non-English language is selected
  useEffect(() => {
    setShowVirtualKeyboard(language.code !== 'en')
  }, [language.code])

  const insertAtCursor = useCallback((char) => {
    const el = inputRef.current
    if (!el) { setVentText((t) => t + char); return }
    const start = el.selectionStart ?? el.value.length
    const end   = el.selectionEnd   ?? el.value.length
    const next  = el.value.slice(0, start) + char + el.value.slice(end)
    setVentText(next)
    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + char.length
    }, 0)
  }, [setVentText])

  const handleBackspace = useCallback(() => {
    const el = inputRef.current
    if (!el) { setVentText((t) => t.slice(0, -1)); return }
    const start = el.selectionStart ?? 0
    const end   = el.selectionEnd   ?? 0
    let next, cursor
    if (start !== end) {
      next   = el.value.slice(0, start) + el.value.slice(end)
      cursor = start
    } else if (start > 0) {
      next   = el.value.slice(0, start - 1) + el.value.slice(start)
      cursor = start - 1
    } else {
      return
    }
    setVentText(next)
    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = cursor
    }, 0)
  }, [setVentText])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setMicError(null)
      submitVent()
    }
  }

  function handleSend() {
    setMicError(null)
    submitVent()
  }

  function pickMood(m) {
    setMood(m)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 58 }}>
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      {/* ── Hero ── */}
      {!hasMessages && (
        <header className="text-center animate-fade-up" style={{ padding: '2.5rem 1.25rem 1rem' }}>
          <h1 className="title-shimmer" style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Just Vent
          </h1>
          <p style={{ color: '#4a4a4a', fontSize: '0.9rem', letterSpacing: '0.02em', marginBottom: '1rem' }}>
            No judgment. No advice unless you want it. Just a space to breathe.
          </p>

          {/* "Just listening" indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 0.9rem', borderRadius: '999px',
              background: 'rgba(212,98,42,0.07)',
              border: '1px solid rgba(212,98,42,0.18)',
              fontSize: '0.72rem', color: '#9B4820', letterSpacing: '0.05em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4622A', opacity: 0.8, animation: 'mic-pulse 2s ease-in-out infinite' }} />
              Just listening — no advice, no judgment
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
            <div style={{ height: 1, width: 56, background: 'linear-gradient(90deg,transparent,rgba(212,98,42,0.35))' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D4622A', opacity: 0.5 }} />
            <div style={{ height: 1, width: 56, background: 'linear-gradient(270deg,transparent,rgba(212,98,42,0.35))' }} />
          </div>

          {/* Breathing exercise trigger */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.85rem' }}>
            <button
              onClick={() => setShowBreathing(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.9rem', borderRadius: '999px',
                background: 'transparent',
                border: '1px solid rgba(212,98,42,0.1)',
                fontSize: '0.72rem', color: '#3a3a3a', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.3)'; e.currentTarget.style.color = '#9B4820' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.1)'; e.currentTarget.style.color = '#3a3a3a' }}
            >
              🫁 Need to calm down first?
            </button>
          </div>

          {/* Tone selector */}
          <div style={{ marginTop: '1.75rem' }}>
            <p style={{ color: '#3a3a3a', fontSize: '0.78rem', marginBottom: '0.65rem', letterSpacing: '0.04em' }}>
              How would you like me to respond?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.45rem 0.9rem', borderRadius: '999px',
                    border: '1px solid',
                    borderColor: tone === t.value ? 'rgba(212,98,42,0.6)' : 'rgba(212,98,42,0.12)',
                    background: tone === t.value ? 'rgba(212,98,42,0.12)' : 'transparent',
                    color: tone === t.value ? '#D4622A' : '#555',
                    fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s',
                    fontWeight: tone === t.value ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (tone !== t.value) { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.3)'; e.currentTarget.style.color = '#999' } }}
                  onMouseLeave={(e) => { if (tone !== t.value) { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.12)'; e.currentTarget.style.color = '#555' } }}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood check-in */}
          <div style={{ marginTop: '1.75rem' }}>
            <p style={{ color: '#3a3a3a', fontSize: '0.78rem', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              How are you feeling right now?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => pickMood(m)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: '1px solid',
                    borderColor: mood?.label === m.label ? 'rgba(212,98,42,0.7)' : 'rgba(212,98,42,0.12)',
                    background: mood?.label === m.label ? 'rgba(212,98,42,0.12)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    transform: mood?.label === m.label ? 'scale(1.08)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => { if (mood?.label !== m.label) e.currentTarget.style.borderColor = 'rgba(212,98,42,0.35)' }}
                  onMouseLeave={(e) => { if (mood?.label !== m.label) e.currentTarget.style.borderColor = 'rgba(212,98,42,0.12)' }}
                >
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.62rem', color: mood?.label === m.label ? '#D4622A' : '#444', letterSpacing: '0.03em' }}>{m.label}</span>
                </button>
              ))}
            </div>
            {mood && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#5C2A14' }}>
                {mood.emoji} Feeling {mood.label.toLowerCase()} — I hear you. Take your time.
              </p>
            )}
          </div>
        </header>
      )}

      {/* ── Compact status bar (shown during conversation) ── */}
      {hasMessages && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.6rem 0 0' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.2rem 0.7rem', borderRadius: '999px',
            background: 'rgba(212,98,42,0.05)',
            border: '1px solid rgba(212,98,42,0.1)',
            fontSize: '0.65rem', color: '#5C2A14', letterSpacing: '0.05em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4622A', opacity: 0.6 }} />
            {TONES.find((t) => t.value === tone)?.label ?? 'Just listening'}
            {mood && <span style={{ opacity: 0.6 }}>· {mood.emoji} {mood.label}</span>}
          </span>
        </div>
      )}

      {/* ── Crisis banner ── */}
      {showCrisis && (
        <div style={{
          margin: '0.75rem auto 0', maxWidth: 680, width: 'calc(100% - 2.5rem)',
          background: 'rgba(180,30,30,0.08)',
          border: '1px solid rgba(220,60,60,0.25)',
          borderRadius: '0.9rem',
          padding: '0.85rem 1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: '#e87070', fontWeight: 600, marginBottom: '0.3rem' }}>
                You don't have to face this alone
              </p>
              <p style={{ fontSize: '0.75rem', color: '#b06060', lineHeight: 1.6 }}>
                If you're in crisis, please reach out to a helpline:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[
                  { name: 'iCall (TISS)', number: '9152987821' },
                  { name: 'Vandrevala', number: '1860-2662-345' },
                  { name: 'AASRA', number: '9820466627' },
                ].map((h) => (
                  <a
                    key={h.name}
                    href={`tel:${h.number.replace(/-/g, '')}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.65rem', borderRadius: '999px',
                      background: 'rgba(220,60,60,0.1)',
                      border: '1px solid rgba(220,60,60,0.25)',
                      color: '#e87070', fontSize: '0.72rem', textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    📞 {h.name} · {h.number}
                  </a>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowCrisis(false)}
              style={{
                flexShrink: 0, background: 'none', border: 'none',
                color: '#804040', cursor: 'pointer', fontSize: '1rem', padding: '0.1rem 0.2rem',
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >×</button>
          </div>
        </div>
      )}

      {/* ── Chat messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.25rem 0.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble key={i} text={msg.text} />
              : <AiBubble   key={i} text={msg.text} />
          )}
          {isLoading && <TypingIndicator />}
          {error && (
            <div style={{ maxWidth: 480 }}>
              <ApiStatus isLoading={false} error={error} onDismiss={clearAll} />
            </div>
          )}

          {/* Closure card — shown after isDone and final AI message loaded */}
          {isDone && !isLoading && (
            <div style={{
              marginTop: '0.5rem',
              background: 'rgba(212,98,42,0.04)',
              border: '1px solid rgba(212,98,42,0.12)',
              borderRadius: '1rem',
              padding: '1.25rem 1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕊️</div>
              <p style={{ color: '#9B4820', fontSize: '0.8rem', lineHeight: 1.6 }}>
                This conversation is complete. Whenever you need to, you can always start a new one.
              </p>
              <button
                onClick={clearAll}
                style={{
                  marginTop: '0.85rem',
                  padding: '0.45rem 1.2rem', borderRadius: '999px',
                  background: 'linear-gradient(135deg,#E8943A,#D4622A)',
                  border: 'none', color: '#0e0e0e',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(212,98,42,0.3)',
                }}
              >
                Start a new conversation
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      {!isDone && (
        <div style={{
          position: 'sticky', bottom: 0,
          background: 'rgba(9,6,8,0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(212,98,42,0.09)',
        }}>

          {/* Virtual keyboard — slides in above the padded content */}
          {showVirtualKeyboard && language.code !== 'en' && (
            <VirtualKeyboard
              langCode={language.code}
              onKey={insertAtCursor}
              onBackspace={handleBackspace}
              onClose={() => setShowVirtualKeyboard(false)}
            />
          )}

          <div style={{ padding: '0.9rem 1.25rem 1rem' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

            {/* Action row — perspective + I'm done (shown after first AI reply) */}
            {hasAiReply && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={requestAdvice}
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.85rem', borderRadius: '999px',
                    border: '1px solid rgba(212,98,42,0.2)',
                    background: 'transparent', color: '#7A3018',
                    fontSize: '0.72rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.5)'; e.currentTarget.style.color = '#D4622A' } }}
                  onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.2)'; e.currentTarget.style.color = '#7A3018' } }}
                >
                  💭 I'd like some perspective
                </button>

                <button
                  onClick={finishSession}
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.85rem', borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent', color: '#444',
                    fontSize: '0.72rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.15s', marginLeft: 'auto',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#aaa' } }}
                  onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#444' } }}
                >
                  I'm done for now
                </button>
              </div>
            )}

            {/* Top row: language + keyboard toggle + new conversation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LanguageSelector language={language} onChange={setLanguage} />
                {/* Keyboard toggle — only shown for non-English languages */}
                {language.code !== 'en' && (
                  <button
                    onClick={() => setShowVirtualKeyboard((v) => !v)}
                    title={showVirtualKeyboard ? 'Hide keyboard' : 'Show virtual keyboard'}
                    style={{
                      width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '0.45rem',
                      border: '1px solid',
                      borderColor: showVirtualKeyboard ? 'rgba(212,98,42,0.5)' : 'rgba(212,98,42,0.18)',
                      background: showVirtualKeyboard ? 'rgba(212,98,42,0.1)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontSize: '0.9rem',
                    }}
                    onMouseEnter={(e) => { if (!showVirtualKeyboard) e.currentTarget.style.borderColor = 'rgba(212,98,42,0.4)' }}
                    onMouseLeave={(e) => { if (!showVirtualKeyboard) e.currentTarget.style.borderColor = 'rgba(212,98,42,0.18)' }}
                  >
                    ⌨️
                  </button>
                )}
              </div>
              {hasMessages && (
                <button
                  onClick={clearAll}
                  disabled={isLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.75rem', borderRadius: '0.6rem',
                    border: '1px solid rgba(212,98,42,0.2)',
                    background: 'transparent', color: '#7A3018',
                    fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.5)'; e.currentTarget.style.color = '#D4622A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.2)'; e.currentTarget.style.color = '#7A3018' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 11, height: 11 }}>
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9z" clipRule="evenodd" />
                  </svg>
                  New conversation
                </button>
              )}
            </div>

            {/* Mic error strip */}
            {micError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem',
                padding: '0.45rem 0.75rem', borderRadius: '0.6rem',
                background: 'rgba(220,60,60,0.07)', border: '1px solid rgba(220,60,60,0.2)',
                fontSize: '0.72rem', color: '#e87070', lineHeight: 1.5,
              }}>
                <span>🎙 {micError}</span>
                <button
                  onClick={() => setMicError(null)}
                  style={{ flexShrink: 0, background: 'none', border: 'none', color: '#e87070', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: 0 }}
                >×</button>
              </div>
            )}

            {/* Input row */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <VentArea
                  ref={inputRef}
                  ventText={ventText}
                  onChange={setVentText}
                  onTranscript={appendTranscript}
                  onError={(msg) => setMicError(msg)}
                  speechCode={language.speechCode}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  compact
                />
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isLoading || !ventText.trim()}
                title="Send (Enter)"
                style={{
                  flexShrink: 0, width: 42, height: 42, borderRadius: '50%',
                  background: isLoading || !ventText.trim()
                    ? 'rgba(255,255,255,0.04)'
                    : 'linear-gradient(135deg,#E8943A,#D4622A)',
                  border: '1px solid',
                  borderColor: isLoading || !ventText.trim() ? 'rgba(255,255,255,0.06)' : 'transparent',
                  cursor: isLoading || !ventText.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isLoading || !ventText.trim() ? 'none' : '0 2px 14px rgba(212,98,42,0.4)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLoading || !ventText.trim() ? '#333' : '#0E0A08'} style={{ width: 17, height: 17 }}>
                  <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
                </svg>
              </button>
            </div>

            <p style={{ fontSize: '0.65rem', color: '#252525', textAlign: 'center' }}>
              <kbd style={kbdStyle}>Enter</kbd> send &nbsp;·&nbsp; <kbd style={kbdStyle}>Shift+Enter</kbd> new line
            </p>
          </div>
          </div>{/* /padding wrapper */}
        </div>
      )}

      {!hasMessages && (
        <footer style={{ borderTop: '1px solid rgba(212,98,42,0.07)', padding: '0.9rem', textAlign: 'center' }}>
          <p style={{ color: '#2a2a2a', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()}{' '}
            <span style={{ color: '#D4622A', fontWeight: 600 }}>mukund_sanjay</span>
            {' '}· All rights reserved
          </p>
        </footer>
      )}
    </div>
  )
}

/* ── Bubbles ── */

function UserBubble({ text }) {
  if (text.startsWith('💭')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '72%',
          background: 'rgba(212,98,42,0.06)',
          border: '1px dashed rgba(212,98,42,0.25)',
          borderRadius: '1.1rem 1.1rem 0.2rem 1.1rem',
          padding: '0.55rem 0.9rem',
          color: '#8B3A1A',
          fontSize: '0.82rem', lineHeight: 1.55, fontStyle: 'italic',
        }}>
          {text}
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: '72%',
        background: 'linear-gradient(135deg, #200D07, #150D0A)',
        border: '1px solid rgba(212,98,42,0.4)',
        borderRadius: '1.1rem 1.1rem 0.2rem 1.1rem',
        padding: '0.7rem 1rem',
        color: '#F5CEB0',
        fontSize: '0.92rem', lineHeight: 1.65,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  )
}

function AiBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.55rem', alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(212,98,42,0.1)', border: '1px solid rgba(212,98,42,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" style={{ width: 14, height: 14 }}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" />
        </svg>
      </div>
      <div style={{
        maxWidth: '72%',
        background: '#100A08',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.2rem 1.1rem 1.1rem 1.1rem',
        padding: '0.7rem 1rem',
        color: '#c8c8c8',
        fontSize: '0.92rem', lineHeight: 1.7,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.55rem', alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(212,98,42,0.1)', border: '1px solid rgba(212,98,42,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" style={{ width: 14, height: 14 }}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" />
        </svg>
      </div>
      <div style={{
        background: '#100A08', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.2rem 1.1rem 1.1rem 1.1rem',
        padding: '0.8rem 1rem',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#D4622A', opacity: 0.6,
            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            display: 'inline-block',
          }} />
        ))}
      </div>
    </div>
  )
}

const kbdStyle = {
  background: '#1A0E0C', border: '1px solid #2A1612',
  borderRadius: 3, padding: '0 4px',
  fontSize: '0.62rem', color: '#444',
}
