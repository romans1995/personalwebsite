import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'

const AuthContext = createContext(null)

async function checkAdmin(user) {
  if (!isFirebaseConfigured || !user) {
    return false
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid))
    return adminDoc.exists()
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return undefined
    }

    let active = true

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return
      setUser(nextUser)
      const nextIsAdmin = await checkAdmin(nextUser)
      if (!active) return
      setIsAdmin(nextIsAdmin)
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      firebaseEnabled: isFirebaseConfigured,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signOut: () => firebaseSignOut(auth),
    }),
    [user, isAdmin, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
