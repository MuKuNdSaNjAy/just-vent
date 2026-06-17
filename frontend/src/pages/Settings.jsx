import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { signOut } from 'firebase/auth'
import { auth, db, functions } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { getSessionCount } from '../hooks/useSessionCount'

/* ── Shared primitives ── */
const field = {
  width: '100%', background: '#0e0e0e',
  border: '1px solid rgba(212,98,42,0.2)', borderRadius: '0.7rem',
  padding: '0.62rem 0.95rem', color: '#f0f0f0', fontSize: '0.88rem',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
}
const lbl = {
  display: 'block', fontSize: '0.69rem', fontWeight: 600,
  color: '#555', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.35rem',
}
const sectionTitle = { color: '#f0f0f0', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }
const sectionSub   = { color: '#4a4a4a', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1.4rem' }
const saveBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '0.7rem', padding: '0.55rem 1.5rem',
  fontSize: '0.85rem', fontWeight: 600, color: '#0e0e0e',
  background: 'linear-gradient(135deg,#E8943A,#D4622A)',
  boxShadow: '0 2px 10px rgba(212,98,42,0.3)',
  border: 'none', cursor: 'pointer', transition: 'opacity 0.15s, transform 0.15s',
}

function fi(e) { e.target.style.borderColor = '#D4622A'; e.target.style.boxShadow = '0 0 0 2px rgba(212,98,42,0.18)' }
function fo(e) { e.target.style.borderColor = 'rgba(212,98,42,0.2)'; e.target.style.boxShadow = 'none' }

function calcAge(dob) {
  if (!dob) return null
  const t = new Date(), b = new Date(dob)
  let a = t.getFullYear() - b.getFullYear()
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
  return a
}

function StatusBadge({ msg }) {
  if (!msg) return null
  return (
    <p style={{
      fontSize: '0.81rem', padding: '0.45rem 0.8rem', borderRadius: '0.5rem',
      color:       msg.ok ? '#86efac' : '#f87171',
      background:  msg.ok ? 'rgba(134,239,172,0.07)' : 'rgba(239,68,68,0.07)',
      border: `1px solid ${msg.ok ? 'rgba(134,239,172,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {msg.text}
    </p>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
      <svg style={{ width: 30, height: 30, animation: 'spin-gold 0.9s linear infinite', color: '#D4622A' }}
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

/* ────────────────── Profile tab ────────────────── */
function ProfileTab({ user }) {
  const [p, setP]           = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setP(snap.data())
      else setP({ first_name: '', last_name: '', username: '', email: user.email ?? '', dob: '', age: null })
      setLoading(false)
    })
  }, [user.uid])

  async function save(e) {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        first_name: p.first_name, last_name: p.last_name,
        username: p.username.toLowerCase().trim(),
        dob: p.dob, age: calcAge(p.dob),
      })
      setMsg({ ok: true, text: 'Profile saved successfully.' })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  function set(k, v) { setP(prev => ({ ...prev, [k]: v })); setMsg(null) }

  if (loading) return <Spinner />

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: 520 }}>
      <div><p style={sectionTitle}>Profile</p><p style={sectionSub}>Manage your personal information.</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div>
          <label style={lbl}>First Name</label>
          <input value={p.first_name} onChange={e => set('first_name', e.target.value)} style={field} onFocus={fi} onBlur={fo} required />
        </div>
        <div>
          <label style={lbl}>Last Name</label>
          <input value={p.last_name} onChange={e => set('last_name', e.target.value)} style={field} onFocus={fi} onBlur={fo} required />
        </div>
      </div>

      <div>
        <label style={lbl}>Username</label>
        <input value={p.username} onChange={e => set('username', e.target.value)} style={field} onFocus={fi} onBlur={fo} required />
      </div>

      <div>
        <label style={lbl}>Email</label>
        <input value={p.email} readOnly style={{ ...field, color: '#444', cursor: 'not-allowed' }} />
        <p style={{ fontSize: '0.69rem', color: '#383838', marginTop: 4 }}>Email changes require re-verification and cannot be done here.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        <div>
          <label style={lbl}>Date of Birth</label>
          <input type="date" value={p.dob} onChange={e => set('dob', e.target.value)} style={{ ...field, colorScheme: 'dark' }} onFocus={fi} onBlur={fo} required />
        </div>
        <div>
          <label style={lbl}>Age</label>
          <div style={{ ...field, color: calcAge(p.dob) ? '#D4622A' : '#333', cursor: 'default' }}>
            {calcAge(p.dob) ? `${calcAge(p.dob)} years` : '—'}
          </div>
        </div>
      </div>

      <StatusBadge msg={msg} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{ ...saveBtn, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

/* ────────────────── Security tab ────────────────── */
function SecurityTab() {
  const [f, setF]   = useState({ newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState(null)

  async function save(e) {
    e.preventDefault(); setMsg(null)
    if (f.newPass.length < 8) { setMsg({ ok: false, text: 'Minimum 8 characters.' }); return }
    if (f.newPass !== f.confirm) { setMsg({ ok: false, text: 'Passwords do not match.' }); return }
    setSaving(true)
    try {
      await updatePassword(auth.currentUser, f.newPass)
      setMsg({ ok: true, text: 'Password updated.' })
    } catch (err) {
      const text = err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign back in before changing your password.'
        : err.message
      setMsg({ ok: false, text })
    } finally {
      setSaving(false)
    }
    setF({ newPass: '', confirm: '' })
  }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: 420 }}>
      <div><p style={sectionTitle}>Change Password</p><p style={sectionSub}>Use a strong password of at least 8 characters.</p></div>
      <div>
        <label style={lbl}>New Password</label>
        <input type="password" value={f.newPass} onChange={e => { setF(p => ({ ...p, newPass: e.target.value })); setMsg(null) }}
          placeholder="Min. 8 characters" style={field} onFocus={fi} onBlur={fo} required />
      </div>
      <div>
        <label style={lbl}>Confirm Password</label>
        <input type="password" value={f.confirm} onChange={e => { setF(p => ({ ...p, confirm: e.target.value })); setMsg(null) }}
          placeholder="Repeat password" style={field} onFocus={fi} onBlur={fo} required />
      </div>
      <StatusBadge msg={msg} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{ ...saveBtn, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}

/* ────────────────── Preferences tab ────────────────── */
const KEYS = { theme: 'jv-theme', notifyEmail: 'jv-notify-email', notifyBrowser: 'jv-notify-browser', saveHistory: 'jv-save-history' }

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 12, flexShrink: 0,
      background: on ? 'linear-gradient(90deg,#E8943A,#D4622A)' : '#1C1210',
      border: on ? 'none' : '1px solid #2e2e2e',
      position: 'relative', cursor: 'pointer', transition: 'background 0.25s',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 22 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)', transition: 'left 0.2s',
      }} />
    </button>
  )
}

function PrefRow({ label: l, sub, on, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1.1rem', background: '#0c0c0c',
      border: '1px solid rgba(212,98,42,0.09)', borderRadius: '0.75rem',
    }}>
      <div>
        <p style={{ color: '#d0d0d0', fontSize: '0.87rem', fontWeight: 500 }}>{l}</p>
        {sub && <p style={{ color: '#444', fontSize: '0.74rem', marginTop: 2 }}>{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function PreferencesTab() {
  const [prefs, setPrefs] = useState(() => ({
    theme:         localStorage.getItem(KEYS.theme) === 'soft',
    notifyEmail:   localStorage.getItem(KEYS.notifyEmail) !== 'false',
    notifyBrowser: localStorage.getItem(KEYS.notifyBrowser) === 'true',
    saveHistory:   localStorage.getItem(KEYS.saveHistory) !== 'false',
  }))

  function setPref(key, val) {
    setPrefs(p => ({ ...p, [key]: val }))
    localStorage.setItem(KEYS[key], String(val))
    if (key === 'theme') document.documentElement.setAttribute('data-theme', val ? 'soft' : '')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500 }}>
      <div><p style={sectionTitle}>Preferences</p><p style={sectionSub}>Personalise your Just Vent experience.</p></div>

      <p style={{ ...lbl, color: '#3a3a3a' }}>Appearance</p>
      <PrefRow label="Soft theme" sub="Muted gold instead of bright gold accents" on={prefs.theme} onChange={v => setPref('theme', v)} />

      <p style={{ ...lbl, color: '#3a3a3a', marginTop: 8 }}>Notifications</p>
      <PrefRow label="Email digests"       sub="Weekly summary to your inbox"               on={prefs.notifyEmail}   onChange={v => setPref('notifyEmail', v)} />
      <PrefRow label="Browser notifications" sub="Notify when your vent gets a response"   on={prefs.notifyBrowser} onChange={v => setPref('notifyBrowser', v)} />

      <p style={{ ...lbl, color: '#3a3a3a', marginTop: 8 }}>Privacy</p>
      <PrefRow label="Save vent history"   sub="Store your vents locally on this device"   on={prefs.saveHistory}   onChange={v => setPref('saveHistory', v)} />
    </div>
  )
}

/* ────────────────── Stats tab ────────────────── */
function StatsTab() {
  const sessions = getSessionCount()

  const statCard = (label, value, sub) => (
    <div style={{
      padding: '1.25rem 1.5rem', background: '#0c0c0c',
      border: '1px solid rgba(212,98,42,0.1)', borderRadius: '0.9rem',
      display: 'flex', flexDirection: 'column', gap: '0.3rem',
    }}>
      <p style={{ color: '#555', fontSize: '0.7rem', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: '#D4622A', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#333', fontSize: '0.72rem' }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 480 }}>
      <div>
        <p style={sectionTitle}>Your Stats</p>
        <p style={sectionSub}>A snapshot of your journey with Just Vent.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {statCard('Sessions completed', sessions, sessions === 0 ? 'Finish your first session to start tracking' : 'Keep going — you\'re doing great')}
        {statCard('Streak', '—', 'Coming soon')}
      </div>
      <div style={{
        padding: '1rem', background: 'rgba(212,98,42,0.03)',
        border: '1px solid rgba(212,98,42,0.08)', borderRadius: '0.75rem',
        fontSize: '0.78rem', color: '#3a3a3a', lineHeight: 1.65,
      }}>
        Stats are stored locally on this device and never sent to our servers. Your privacy is protected.
      </div>
    </div>
  )
}

/* ────────────────── Danger Zone tab ────────────────── */
function DangerTab({ user }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState(null)
  const unlocked = confirm === 'DELETE'

  async function deleteAccount() {
    setDeleting(true); setMsg(null)
    try {
      const deleteUser = httpsCallable(functions, 'deleteUser')
      await deleteUser()
      await signOut(auth)
      navigate('/signin')
    } catch (err) {
      setMsg({ ok: false, text: err.message }); setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 480 }}>
      <div><p style={{ ...sectionTitle, color: '#f87171' }}>Danger Zone</p><p style={sectionSub}>These actions are permanent and cannot be undone.</p></div>

      <div style={{ padding: '1.35rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.9rem' }}>
        <p style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Delete your account</p>
        <p style={{ color: '#555', fontSize: '0.79rem', lineHeight: 1.65, marginBottom: '1rem' }}>
          Your profile, preferences and all data will be permanently removed.
          Type <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'monospace' }}>DELETE</span> to confirm.
        </p>
        <input
          value={confirm} onChange={e => { setConfirm(e.target.value); setMsg(null) }}
          placeholder="Type DELETE to confirm"
          style={{ ...field, borderColor: unlocked ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.18)', marginBottom: '0.85rem' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(239,68,68,0.6)'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.12)' }}
          onBlur={e  => { e.target.style.borderColor = unlocked ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.18)'; e.target.style.boxShadow = 'none' }}
        />
        <StatusBadge msg={msg} />
        <button onClick={deleteAccount} disabled={!unlocked || deleting} style={{
          width: '100%', padding: '0.62rem',
          borderRadius: '0.65rem', border: '1px solid rgba(239,68,68,0.3)',
          background: unlocked ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.04)',
          color: unlocked ? '#f87171' : '#444',
          fontSize: '0.85rem', fontWeight: 600,
          cursor: unlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          marginTop: msg ? '0.75rem' : 0,
        }}>
          {deleting ? 'Deleting…' : 'Permanently delete account'}
        </button>
      </div>
    </div>
  )
}

/* ────────────────── Page shell ────────────────── */
const TABS = [
  { id: 'profile',     label: 'Profile' },
  { id: 'security',    label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'stats',       label: 'Stats' },
  { id: 'danger',      label: 'Danger Zone' },
]

export default function Settings() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [tab, setTab] = useState('profile')

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Page body — below fixed navbar */}
      <div style={{ flex: 1, display: 'flex', paddingTop: 58 }}>

        {/* ── Left sidebar ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid rgba(212,98,42,0.08)',
          padding: '2rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
          position: 'sticky', top: 58, height: 'calc(100vh - 58px)',
          overflowY: 'auto',
        }}>
          <p style={{ fontSize: '0.68rem', color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            Settings
          </p>

          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.58rem 0.85rem', borderRadius: '0.65rem',
              border: 'none',
              background: tab === t.id ? 'rgba(212,98,42,0.1)' : 'transparent',
              borderLeft: `2px solid ${tab === t.id ? '#D4622A' : 'transparent'}`,
              color: tab === t.id ? '#D4622A' : t.id === 'danger' ? '#f87171' : '#777',
              fontSize: '0.85rem', fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = 'rgba(212,98,42,0.05)' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}
            >
              {t.label}
            </button>
          ))}

          {/* Back link */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button onClick={() => navigate('/')} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem', background: 'none', border: 'none',
              color: '#3a3a3a', fontSize: '0.8rem', cursor: 'pointer',
              borderRadius: '0.5rem', transition: 'color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4622A' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#3a3a3a' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
                <path fillRule="evenodd" d="M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0z" clipRule="evenodd" />
              </svg>
              Back to home
            </button>
          </div>
        </aside>

        {/* ── Content area ── */}
        <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
          <div className="animate-fade-up" key={tab}>
            {tab === 'profile'     && <ProfileTab     user={user} />}
            {tab === 'security'    && <SecurityTab />}
            {tab === 'preferences' && <PreferencesTab />}
            {tab === 'stats'       && <StatsTab />}
            {tab === 'danger'      && <DangerTab      user={user} />}
          </div>
        </main>

      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(212,98,42,0.07)',
        padding: '0.9rem 1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#252525', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
          © {new Date().getFullYear()}{' '}
          <span style={{ color: '#D4622A', fontWeight: 600 }}>mukund_sanjay</span>
          {' '}· All rights reserved
        </p>
      </footer>
    </div>
  )
}
