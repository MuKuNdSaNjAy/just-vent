export default function ResponseArea({ response }) {
  if (!response) return null

  return (
    <div className="response-card space-y-3">
      <div className="flex items-center gap-2">
        {/* Gold heart icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#d4991a" className="w-5 h-5 shrink-0">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" />
        </svg>
        <span className="text-sm font-semibold" style={{ color: '#d4991a' }}>Here for you</span>
        {/* Thin gold line */}
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,153,26,0.4), transparent)' }} />
      </div>

      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
    </div>
  )
}
