export default function ApiStatus({ isLoading, error, onDismiss }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 animate-fade-up">
        {/* Gold spinner */}
        <svg
          className="w-5 h-5"
          style={{ animation: 'spin-gold 0.9s linear infinite', color: '#D4622A' }}
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        >
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm" style={{ color: '#B5521F' }}>Listening with care…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 animate-fade-up"
        style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)' }}
      >
        <div className="flex items-center gap-2 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
        <button onClick={onDismiss} className="text-red-600 hover:text-red-400 transition-colors" title="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    )
  }

  return null
}
