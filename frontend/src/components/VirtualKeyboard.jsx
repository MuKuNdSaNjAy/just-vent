const LAYOUTS = {
  hi: {
    label: 'हिंदी',
    rows: [
      { title: 'Vowels',     keys: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ'] },
      { title: 'Marks',      keys: ['ा','ि','ी','ु','ू','े','ै','ो','ौ','्','ं','ः','ँ'] },
      { title: 'Consonants', keys: ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'] },
      { title: '',           keys: ['ट','ठ','ड','ढ','ण','त','थ','द','ध','न'] },
      { title: '',           keys: ['प','फ','ब','भ','म','य','र','ल','व','श'] },
      { title: '',           keys: ['ष','स','ह','ळ','क्ष','त्र','ज्ञ','।','॥','ॐ'] },
    ],
  },
  ta: {
    label: 'தமிழ்',
    rows: [
      { title: 'Vowels',     keys: ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ'] },
      { title: 'Marks',      keys: ['ா','ி','ீ','ு','ூ','ெ','ே','ை','ொ','ோ','ௌ','்'] },
      { title: 'Consonants', keys: ['க','ங','ச','ஞ','ட','ண','த','ந','ன','ப','ம','ய'] },
      { title: '',           keys: ['ர','ல','வ','ழ','ள','ற','ஜ','ஷ','ஸ','ஹ'] },
    ],
  },
  te: {
    label: 'తెలుగు',
    rows: [
      { title: 'Vowels',     keys: ['అ','ఆ','ఇ','ఈ','ఉ','ఊ','ఋ','ఎ','ఏ','ఐ','ఒ','ఓ','ఔ'] },
      { title: 'Marks',      keys: ['ా','ి','ీ','ు','ూ','ృ','ె','ే','ై','ొ','ో','ౌ','్'] },
      { title: 'Consonants', keys: ['క','ఖ','గ','ఘ','చ','ఛ','జ','ఝ','ట','ఠ','డ','ఢ','ణ'] },
      { title: '',           keys: ['త','థ','ద','ధ','న','ప','ఫ','బ','భ','మ','య','ర','ల'] },
      { title: '',           keys: ['వ','శ','ష','స','హ','ళ','క్ష','జ్ఞ','।','॥'] },
    ],
  },
}

export const KEYBOARD_LANGS = Object.keys(LAYOUTS)

export default function VirtualKeyboard({ langCode, onKey, onBackspace, onClose }) {
  const layout = LAYOUTS[langCode]
  if (!layout) return null

  return (
    <div
      style={{
        background: 'rgba(9,6,8,0.98)',
        borderTop: '1px solid rgba(212,98,42,0.2)',
        borderBottom: '1px solid rgba(212,98,42,0.08)',
        padding: '0.6rem 1rem 0.7rem',
        animation: 'kbd-slide-up 0.18s ease-out',
      }}
    >
      <style>{`
        @keyframes kbd-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '0.65rem', color: '#5C2A14', letterSpacing: '0.06em' }}>
          {layout.label} keyboard
        </span>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#444',
            cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
            padding: '0 0.2rem',
          }}
          aria-label="Close keyboard"
        >×</button>
      </div>

      {/* Key rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {layout.rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
            {row.title && (
              <span style={{
                alignSelf: 'center',
                fontSize: '0.58rem', color: '#333',
                minWidth: 48, letterSpacing: '0.05em',
                display: ri === 0 ? 'block' : 'none',
              }}>
                {row.title}
              </span>
            )}
            {row.keys.map((char) => (
              <button
                key={char}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(char)}
                style={{
                  minWidth: 32, height: 34,
                  padding: '0 6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.4rem',
                  color: '#E8C4A8',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.1s, border-color 0.1s',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212,98,42,0.14)'
                  e.currentTarget.style.borderColor = 'rgba(212,98,42,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {char}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar: space bar + backspace key */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem' }}>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onKey(' ')}
          style={{
            flex: 1, height: 32,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.4rem',
            color: '#555', fontSize: '0.68rem', letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
        >
          SPACE
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBackspace}
          style={{
            width: 52, height: 32,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.4rem',
            color: '#888', fontSize: '1rem',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(180,60,60,0.12)'; e.currentTarget.style.color = '#e08080' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#888' }}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
