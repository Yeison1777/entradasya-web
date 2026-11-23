import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api, tokenStorage } from '@/shared/api/client'
import type { AuthSession, User } from '@/shared/api/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login(email: string, password: string): Promise<User>
  register(name: string, email: string, password: string): Promise<User>
  logout(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()))

  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) return
    api<User>('/auth/me')
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const session = await api<AuthSession>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        tokenStorage.set(session.accessToken)
        setUser(session.user)
        return session.user
      },
      async register(name, email, password) {
        const session = await api<AuthSession>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        tokenStorage.set(session.accessToken)
        setUser(session.user)
        return session.user
      },
      logout() {
        tokenStorage.clear()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.')
  return value
}
