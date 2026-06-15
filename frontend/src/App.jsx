import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar    from './components/Navbar'
import Home      from './pages/Home'
import Settings  from './pages/Settings'
import SignIn    from './pages/SignIn'
import SignUp    from './pages/SignUp'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <>{<Navbar />}{children}</> : <Navigate to="/signin" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <Navigate to="/" replace /> : children
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020202' }}>
      <svg style={{ width: 32, height: 32, animation: 'spin-gold 0.9s linear infinite', color: '#d4991a' }}
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/signin" element={
            <PublicRoute><SignIn /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><SignUp /></PublicRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
