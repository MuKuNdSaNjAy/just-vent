import { useEffect } from 'react'

export default function LogoutModal({ onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="w-full max-w-sm animate-fade-up text-center"
        style={{
          background: 'linear-gradient(160deg,#140D0B 0%,#120605 100%)',
          border: '1px solid rgba(212,98,42,0.22)',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 8px 48px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 1rem',
          background: 'rgba(212,98,42,0.08)',
          border: '1.5px solid rgba(212,98,42,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" style={{ width: 24, height: 24 }}>
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
          Ready to leave?
        </h2>
        <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          You'll be signed out and returned to the sign-in page.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel} className="vent-btn-ghost flex-1">Stay here</button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
            style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
          >
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  )
}
