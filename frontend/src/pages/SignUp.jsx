import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { labelStyle, inputStyle } from './SignIn'
import { calcAge } from '../utils/calcAge'

const INITIAL = {
  firstName: '', lastName: '', username: '',
  email: '', password: '', confirmPassword: '', dob: '',
}

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm]       = useState(INITIAL)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const age = calcAge(form.dob)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!age || age < 13) { setError('You must be at least 13 years old to sign up.'); return }

    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password)

      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        first_name: form.firstName,
        last_name:  form.lastName,
        username:   form.username.toLowerCase().trim(),
        email:      form.email,
        dob:        form.dob,
        age,
        created_at: new Date().toISOString(),
      })

      await sendEmailVerification(user)
      setSuccess(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={pageStyle}>
        <div className="w-full max-w-md text-center animate-fade-up" style={cardStyle}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,98,42,0.1)', border: '2px solid rgba(212,98,42,0.4)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" className="w-8 h-8">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 title-shimmer">You're in!</h2>
          <p className="text-sm mb-6" style={{ color: '#666' }}>
            A verification email has been sent. You can sign in now.
          </p>
          <Link to="/signin" className="vent-btn-primary inline-block px-8">Go to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={pageStyle}>
      <div className="w-full max-w-lg animate-fade-up" style={cardStyle}>

        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" className="w-6 h-6">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248zM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold title-shimmer">Create your account</h1>
          </div>
          <p style={{ color: '#555', fontSize: '0.82rem' }}>Your safe space starts here.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>First Name</label>
              <input name="firstName" type="text" required autoComplete="given-name" value={form.firstName}
                onChange={handleChange} placeholder="Ada" style={inputStyle}
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input name="lastName" type="text" required autoComplete="family-name" value={form.lastName}
                onChange={handleChange} placeholder="Lovelace" style={inputStyle}
                onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Username</label>
            <input name="username" type="text" required autoComplete="username" value={form.username}
              onChange={handleChange} placeholder="ada_lovelace" style={inputStyle}
              onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" required autoComplete="email" value={form.email}
              onChange={handleChange} placeholder="ada@example.com" style={inputStyle}
              onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input name="dob" type="date" required value={form.dob}
                onChange={handleChange} style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <div style={{ ...inputStyle, color: age ? '#D4622A' : '#444', cursor: 'default' }}>
                {age ? `${age} years` : '—'}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" required autoComplete="new-password" value={form.password}
              onChange={handleChange} placeholder="Min. 8 characters" style={inputStyle}
              onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input name="confirmPassword" type="password" required autoComplete="new-password" value={form.confirmPassword}
              onChange={handleChange} placeholder="••••••••" style={inputStyle}
              onFocus={focusIn} onBlur={focusOut} />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#f87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="vent-btn-primary w-full mt-1">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm" style={{ color: '#555' }}>
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold" style={{ color: '#D4622A' }}
            onMouseEnter={(e) => { e.target.style.color = '#F0A855' }}
            onMouseLeave={(e) => { e.target.style.color = '#D4622A' }}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.'
    case 'auth/invalid-email':        return 'Invalid email address.'
    case 'auth/weak-password':        return 'Password is too weak.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    default: return 'Sign up failed. Please try again.'
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
function focusIn(e)  { e.target.style.borderColor = '#D4622A'; e.target.style.boxShadow = '0 0 0 2px rgba(212,98,42,0.2)' }
function focusOut(e) { e.target.style.borderColor = 'rgba(212,98,42,0.2)'; e.target.style.boxShadow = 'none' }
