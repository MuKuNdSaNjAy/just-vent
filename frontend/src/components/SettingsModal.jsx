import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword, signOut } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

/* ─────────────────────────────────────────────
   Shared style constants
───────────────────────────────────────────── */
const overlay = {
  position: 'fixed', inset: 0, zIndex: 60,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
  background: 'rgba(0,0,0,0.82)',
  backdropFilter: 'blur(6px)',
}
const shell = {
  width: '100%', maxWidth: 680,
  maxHeight: '90vh',
  display: 'flex', flexDirection: 'column',
  background: 'linear-gradient(160deg,#140D0B 0%,#120605 100%)',
  border: '1px solid rgba(212,98,42,0.2)',
  borderRadius: '1.5rem',
  boxShadow: '0 12px 60px rgba(0,0,0,0.85)',
  overflow: 'hidden',
  animation: 'fade-up 0.35s ease-out both',
}
const field = {
  width: '100%',
  background: '#0e0e0e',
  border: '1px solid rgba(212,98,42,0.2)',
  borderRadius: '0.65rem',
  padding: '0.6rem 0.9rem',
  color: '#f0f0f0',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
const label = {
  display: 'block',
  fontSize: '0.7rem', fontWeight: 600,
  color: '#666',
  letterSpacing: '0.06em', textTransform: 'uppercase',
  marginBottom: '0.35rem',
}
const saveBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '0.4rem',
  borderRadius: '0.75rem', padding: '0.55rem 1.4rem',
  fontSize: '0.85rem', fontWeight: 600,
  color: '#0e0e0e',
  background: 'linear-gradient(135deg,#E8943A,#D4622A)',
  boxShadow: '0 2px 10px rgba(212,98,42,0.3)',
  border: 'none', cursor: 'pointer',
  transition: 'all 0.15s',
}
const sectionHead = { color: '#f0f0f0', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }
const sectionSub  = { color: '#555', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.5 }

function calcAge(dob) {
  if (!dob) return null
  const today = new Date(), birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() - birth.getMonth() < 0 ||
     (today.getMonth() - birth.getMonth() === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function fi(e) { e.target.style.borderColor = '#D4622A'; e.target.style.boxShadow = '0 0 0 2px rgba(212,98,42,0.18)' }
function fo(e) { e.target.style.borderColor = 'rgba(212,98,42,0.2)'; e.target.style.boxShadow = 'none' }

/* ─────────────────────────────────────────────
   Tab: Profile
───────────────────────────────────────────── */
function ProfileTab({ user }) {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState(null) // { type: 'ok'|'err', text }

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      setProfile(snap.exists() ? snap.data() : { first_name: '', last_name: '', username: '', email: user.email ?? '', dob: '', age: null })
      setLoading(false)
    })
  }, [user.uid])

  async function save(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        first_name: profile.first_name,
        last_name:  profile.last_name,
        username:   profile.username.toLowerCase().trim(),
        dob:        profile.dob,
        age:        calcAge(profile.dob),
      })
      setMsg({ type: 'ok', text: 'Profile saved!' })
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  function set(k, v) { setProfile((p) => ({ ...p, [k]: v })); setMsg(null) }

  if (loading) return <Spinner />

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={sectionHead}>Profile</p>
        <p style={sectionSub}>Update your personal information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={label}>First Name</label>
          <input value={profile.first_name} onChange={(e) => set('first_name', e.target.value)}
            style={field} onFocus={fi} onBlur={fo} required />
        </div>
        <div>
          <label style={label}>Last Name</label>
          <input value={profile.last_name} onChange={(e) => set('last_name', e.target.value)}
            style={field} onFocus={fi} onBlur={fo} required />
        </div>
      </div>

      <div>
        <label style={label}>Username</label>
        <input value={profile.username} onChange={(e) => set('username', e.target.value)}
          style={field} onFocus={fi} onBlur={fo} required />
      </div>

      <div>
        <label style={label}>Email</label>
        <input value={profile.email} readOnly
          style={{ ...field, color: '#555', cursor: 'not-allowed' }} />
        <p style={{ fontSize: '0.7rem', color: '#444', marginTop: 4 }}>Email cannot be changed here.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={label}>Date of Birth</label>
          <input type="date" value={profile.dob} onChange={(e) => set('dob', e.target.value)}
            style={{ ...field, colorScheme: 'dark' }} onFocus={fi} onBlur={fo} required />
        </div>
        <div>
          <label style={label}>Age</label>
          <div style={{ ...field, color: calcAge(profile.dob) ? '#D4622A' : '#444', cursor: 'default' }}>
            {calcAge(profile.dob) ? `${calcAge(profile.dob)} years` : '—'}
          </div>
        </div>
      </div>

      <StatusMsg msg={msg} />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────
   Tab: Security
───────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm] = useState({ newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); setMsg(null) }

  async function save(e) {
    e.preventDefault()
    if (form.newPass.length < 8) { setMsg({ type: 'err', text: 'Password must be at least 8 characters.' }); return }
    if (form.newPass !== form.confirm) { setMsg({ type: 'err', text: 'Passwords do not match.' }); return }
    setSaving(true)
    try {
      await updatePassword(auth.currentUser, form.newPass)
      setMsg({ type: 'ok', text: 'Password updated successfully.' })
      setForm({ newPass: '', confirm: '' })
    } catch (err) {
      const text = err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign back in before changing your password.'
        : err.message
      setMsg({ type: 'err', text })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={sectionHead}>Change Password</p>
        <p style={sectionSub}>Choose a strong password of at least 8 characters.</p>
      </div>

      <div>
        <label style={label}>New Password</label>
        <input type="password" value={form.newPass} onChange={(e) => set('newPass', e.target.value)}
          placeholder="Min. 8 characters" style={field} onFocus={fi} onBlur={fo} required />
      </div>

      <div>
        <label style={label}>Confirm New Password</label>
        <input type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)}
          placeholder="Repeat password" style={field} onFocus={fi} onBlur={fo} required />
      </div>

      <StatusMsg msg={msg} />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────
   Tab: Preferences
───────────────────────────────────────────── */
const PREF_KEYS = {
  theme:         'jv-theme',
  notifyEmail:   'jv-notify-email',
  notifyBrowser: 'jv-notify-browser',
  saveHistory:   'jv-save-history',
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? 'linear-gradient(90deg,#E8943A,#D4622A)' : '#1C1210',
        border: on ? 'none' : '1px solid #333',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.25s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: on ? 22 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function PrefRow({ label: l, sub, on, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1rem',
      background: '#0e0e0e',
      border: '1px solid rgba(212,98,42,0.1)',
      borderRadius: '0.75rem',
    }}>
      <div>
        <p style={{ color: '#d0d0d0', fontSize: '0.88rem', fontWeight: 500 }}>{l}</p>
        {sub && <p style={{ color: '#555', fontSize: '0.75rem', marginTop: 2 }}>{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function PreferencesTab() {
  const [prefs, setPrefs] = useState(() => ({
    theme:         localStorage.getItem(PREF_KEYS.theme) === 'soft',
    notifyEmail:   localStorage.getItem(PREF_KEYS.notifyEmail) !== 'false',
    notifyBrowser: localStorage.getItem(PREF_KEYS.notifyBrowser) === 'true',
    saveHistory:   localStorage.getItem(PREF_KEYS.saveHistory) !== 'false',
  }))

  function setPref(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }))
    localStorage.setItem(PREF_KEYS[key], String(value))
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value ? 'soft' : '')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={sectionHead}>Preferences</p>
        <p style={sectionSub}>Personalise your Just Vent experience.</p>
      </div>

      <p style={{ ...label, color: '#555', marginBottom: '0.5rem' }}>Appearance</p>
      <PrefRow
        label="Soft theme"
        sub="Muted gold tones instead of bright gold"
        on={prefs.theme}
        onChange={(v) => setPref('theme', v)}
      />

      <p style={{ ...label, color: '#555', margin: '0.5rem 0 0.5rem' }}>Notifications</p>
      <PrefRow
        label="Email digests"
        sub="Receive a weekly summary to your inbox"
        on={prefs.notifyEmail}
        onChange={(v) => setPref('notifyEmail', v)}
      />
      <PrefRow
        label="Browser notifications"
        sub="Get notified when your vent gets a response"
        on={prefs.notifyBrowser}
        onChange={(v) => setPref('notifyBrowser', v)}
      />

      <p style={{ ...label, color: '#555', margin: '0.5rem 0 0.5rem' }}>Privacy</p>
      <PrefRow
        label="Save vent history"
        sub="Store your vents locally on this device"
        on={prefs.saveHistory}
        onChange={(v) => setPref('saveHistory', v)}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab: Danger Zone
───────────────────────────────────────────── */
function DangerTab({ user }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState(null)

  async function deleteAccount() {
    setDeleting(true); setMsg(null)
    try {
      const deleteUser = httpsCallable(functions, 'deleteUser')
      await deleteUser()
      await signOut(auth)
      navigate('/signin')
    } catch (err) {
      setMsg({ type: 'err', text: err.message }); setDeleting(false)
    }
  }

  const unlocked = confirm === 'DELETE'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <p style={{ ...sectionHead, color: '#f87171' }}>Danger Zone</p>
        <p style={sectionSub}>These actions are permanent and cannot be undone.</p>
      </div>

      <div style={{
        padding: '1.25rem',
        background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '0.9rem',
      }}>
        <p style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>
          Delete your account
        </p>
        <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          Your profile, preferences and all associated data will be permanently removed.
          Type <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'monospace' }}>DELETE</span> to confirm.
        </p>

        <input
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setMsg(null) }}
          placeholder="Type DELETE to confirm"
          style={{
            ...field,
            borderColor: unlocked ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)',
            marginBottom: '0.85rem',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(239,68,68,0.6)'; e.target.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.15)' }}
          onBlur={(e)  => { e.target.style.borderColor = unlocked ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'; e.target.style.boxShadow = 'none' }}
        />

        <StatusMsg msg={msg} />

        <button
          onClick={deleteAccount}
          disabled={!unlocked || deleting}
          style={{
            width: '100%', padding: '0.6rem',
            borderRadius: '0.65rem', border: '1px solid rgba(239,68,68,0.35)',
            background: unlocked ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)',
            color: unlocked ? '#f87171' : '#555',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: unlocked ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          {deleting ? 'Deleting…' : 'Permanently delete account'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <svg style={{ width: 28, height: 28, animation: 'spin-gold 0.9s linear infinite', color: '#D4622A' }}
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

function StatusMsg({ msg }) {
  if (!msg) return null
  return (
    <p style={{
      fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: '0.55rem',
      color: msg.type === 'ok' ? '#86efac' : '#f87171',
      background: msg.type === 'ok' ? 'rgba(134,239,172,0.07)' : 'rgba(239,68,68,0.07)',
      border: `1px solid ${msg.type === 'ok' ? 'rgba(134,239,172,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {msg.text}
    </p>
  )
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
const TABS = [
  { id: 'profile',     label: 'Profile',     icon: '👤' },
  { id: 'security',    label: 'Security',    icon: '🔒' },
  { id: 'preferences', label: 'Preferences', icon: '🎨' },
  { id: 'danger',      label: 'Danger Zone', icon: '⚠️' },
]

export default function SettingsModal({ onClose, initialTab = 'profile' }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={shell}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(212,98,42,0.12)',
          flexShrink: 0,
        }}>
          <h2 style={{ color: '#f0f0f0', fontWeight: 700, fontSize: '1.1rem' }}>Settings</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#555', cursor: 'pointer',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '0.5rem', transition: 'color 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#D4622A' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <nav style={{
            width: 160, flexShrink: 0,
            borderRight: '1px solid rgba(212,98,42,0.1)',
            padding: '1rem 0.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
          }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.55rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.65rem', border: 'none',
                  background: activeTab === t.id ? 'rgba(212,98,42,0.12)' : 'transparent',
                  color: activeTab === t.id
                    ? '#D4622A'
                    : t.id === 'danger' ? '#f87171' : '#888',
                  fontSize: '0.83rem', fontWeight: activeTab === t.id ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  borderLeft: activeTab === t.id ? '2px solid #D4622A' : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (activeTab !== t.id) e.currentTarget.style.background = 'rgba(212,98,42,0.05)' }}
                onMouseLeave={(e) => { if (activeTab !== t.id) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Content panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {activeTab === 'profile'     && <ProfileTab     user={user} />}
            {activeTab === 'security'    && <SecurityTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'danger'      && <DangerTab      user={user} />}
          </div>
        </div>

      </div>
    </div>
  )
}
