import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { loading, user, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080f] text-slate-300">
        Checking access…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/studio/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080f] px-6 text-center text-slate-300">
        This account is authenticated but not authorized for the private admin panel.
      </div>
    )
  }

  return children
}

export default ProtectedRoute
