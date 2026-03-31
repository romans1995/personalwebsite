import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { trackAdminLoginView } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'

function AdminLoginPage() {
  const { user, isAdmin, loading, signIn, firebaseEnabled } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    trackAdminLoginView({
      path: '/studio/login',
    })
  }, [])

  if (!firebaseEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080f] px-6 text-center text-slate-300">
        Firebase is not configured yet. Add your environment variables to enable the private admin panel.
      </div>
    )
  }

  if (!loading && user && isAdmin) {
    const nextPath = location.state?.from?.pathname || '/studio'
    return <Navigate to={nextPath} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signIn(email, password)
      navigate('/studio', { replace: true })
    } catch {
      setError('Unable to sign in with the provided credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05080f] px-4 py-12 sm:px-6 lg:px-8">
      <div className="blob-1 pointer-events-none absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-sky-600/20 blur-[120px]" />
      <div className="blob-2 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Private admin</p>
            <h1 className="text-2xl font-semibold text-white">Secure sign in</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-500"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-sky-500"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LockKeyhole size={16} />
            {submitting ? 'Signing in…' : 'Sign in to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLoginPage
