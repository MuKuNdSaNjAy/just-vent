import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../services/firebase'

const googleProvider = new GoogleAuthProvider()

export default function SignIn() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleEmailSignIn(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={pageStyle}>
      <div className="w-full max-w-md animate-fade-up" style={cardStyle}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" className="w-7 h-7">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248zM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold title-shimmer">Just Vent</h1>
          </div>
          <p style={{ color: '#6b6b6b', fontSize: '0.85rem' }}>Welcome back. Let it out.</p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold mb-6 transition-all duration-200 active:scale-95 disabled:opacity-40"
          style={googleBtnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.7)'; e.currentTarget.style.background = 'rgba(212,98,42,0.07)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,98,42,0.25)'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(212,98,42,0.15)' }} />
          <span style={{ color: '#4a4a4a', fontSize: '0.75rem', letterSpacing: '0.1em' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(212,98,42,0.15)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#D4622A'; e.target.style.boxShadow = '0 0 0 2px rgba(212,98,42,0.2)' }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(212,98,42,0.2)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" required autoComplete="current-password" value={form.password} onChange={handleChange}
              placeholder="••••••••" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#D4622A'; e.target.style.boxShadow = '0 0 0 2px rgba(212,98,42,0.2)' }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(212,98,42,0.2)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#f87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="vent-btn-primary w-full mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: '#555' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold transition-colors duration-150" style={{ color: '#D4622A' }}
            onMouseEnter={(e) => { e.target.style.color = '#F0A855' }}
            onMouseLeave={(e) => { e.target.style.color = '#D4622A' }}
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.'
    case 'auth/too-many-requests':  return 'Too many attempts. Try again later.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default: return 'Sign in failed. Please try again.'
  }
}

const pageStyle = {
  background: '#020202',
  backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,98,42,0.07) 0%, transparent 70%)',
}
const cardStyle = {
  background: 'linear-gradient(160deg, #140D0B 0%, #120605 100%)',
  border: '1px solid rgba(212,98,42,0.18)',
  borderRadius: '1.5rem',
  padding: '2.5rem',
  boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 32px rgba(212,98,42,0.04)',
}
const googleBtnStyle = {
  border: '1px solid rgba(212,98,42,0.25)',
  background: 'transparent',
  color: '#c8c8c8',
  borderRadius: '0.75rem',
}
export const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: '500',
  color: '#888', marginBottom: '0.4rem',
  letterSpacing: '0.05em', textTransform: 'uppercase',
}
export const inputStyle = {
  width: '100%', background: '#0e0e0e',
  border: '1px solid rgba(212,98,42,0.2)',
  borderRadius: '0.75rem', padding: '0.65rem 1rem',
  color: '#f0f0f0', fontSize: '0.9rem',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
}
