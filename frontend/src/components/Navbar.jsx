import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import LogoutModal from './LogoutModal'

function UserMenu({ user }) {
  const [open, setOpen]     = useState(false)
  const [logout, setLogout] = useState(false)
  const ref      = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function confirmLogout() {
    await signOut(auth)
    navigate('/signin')
  }

  const avatar = user?.email?.[0]?.toUpperCase() ?? '?'

  const items = [
    {
      label: 'Home',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689z"/><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a1.285 1.285 0 0 0 .091-.086L12 5.432z"/></svg>,
      action: () => { navigate('/'); setOpen(false) },
    },
    {
      label: 'Settings',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z" clipRule="evenodd"/></svg>,
      action: () => { navigate('/settings'); setOpen(false) },
    },
    { divider: true },
    {
      label: 'Log out',
      danger: true,
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}><path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06z" clipRule="evenodd"/></svg>,
      action: () => { setOpen(false); setLogout(true) },
    },
  ]

  return (
    <>
      {logout && <LogoutModal onConfirm={confirmLogout} onCancel={() => setLogout(false)} />}

      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen(v => !v)} title={user?.email} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg,#E8943A,#B5521F)',
          border: open ? '2px solid #F0A855' : '2px solid rgba(212,98,42,0.35)',
          color: '#0e0e0e', fontWeight: 700, fontSize: '0.85rem',
          cursor: 'pointer', transition: 'border-color 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {avatar}
        </button>

        {open && (
          <div className="animate-fade-up" style={{
            position: 'absolute', top: 46, right: 0, minWidth: 192,
            background: '#140D0B', border: '1px solid rgba(212,98,42,0.2)',
            borderRadius: '0.9rem', boxShadow: '0 10px 40px rgba(0,0,0,0.75)',
            overflow: 'hidden', zIndex: 100,
          }}>
            <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(212,98,42,0.1)' }}>
              <p style={{ fontSize: '0.68rem', color: '#444', marginBottom: 2 }}>Signed in as</p>
              <p style={{ fontSize: '0.78rem', color: '#D4622A', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>

            {items.map((item, i) =>
              item.divider
                ? <div key={i} style={{ height: 1, background: 'rgba(212,98,42,0.08)', margin: '0.2rem 0' }} />
                : (
                  <button key={item.label} onClick={item.action} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.58rem 1rem', background: 'transparent',
                    color: item.danger ? '#f87171' : '#c0c0c0',
                    fontSize: '0.84rem', fontWeight: 500,
                    cursor: 'pointer', border: 'none', textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(212,98,42,0.07)'; e.currentTarget.style.color = item.danger ? '#fca5a5' : '#F0A855' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = item.danger ? '#f87171' : '#c0c0c0' }}
                  >
                    {item.icon}{item.label}
                  </button>
                )
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function Navbar() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.75rem',
      background: 'rgba(9,6,8,0.88)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(212,98,42,0.12)',
    }}>
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4622A" style={{ width: 26, height: 26 }}>
          <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248zM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718z" clipRule="evenodd" />
        </svg>
        <span className="title-shimmer" style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Just Vent</span>
      </button>

      {user && <UserMenu user={user} />}
    </nav>
  )
}
