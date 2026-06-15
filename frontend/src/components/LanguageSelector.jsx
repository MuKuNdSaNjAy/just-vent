import { LANGUAGES } from '../utils/languages'

export default function LanguageSelector({ language, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="lang-select" className="text-xs font-medium uppercase tracking-widest" style={{ color: '#D4622A' }}>
        Language
      </label>
      <select
        id="lang-select"
        value={language.code}
        onChange={(e) => {
          const selected = LANGUAGES.find((l) => l.code === e.target.value)
          if (selected) onChange(selected)
        }}
        className="rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-all duration-200"
        style={{
          background: '#140D0B',
          border: '1px solid rgba(212,98,42,0.3)',
          color: '#D4622A',
          outline: 'none',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(212,98,42,0.8)' }}
        onBlur={(e)  => { e.target.style.borderColor = 'rgba(212,98,42,0.3)' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ background: '#140D0B', color: '#D4622A' }}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
