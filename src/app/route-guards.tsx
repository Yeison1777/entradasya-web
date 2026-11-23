import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import type { UserRole } from '@/shared/api/types'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-slate-500">Cargando sesión…</div>
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/iniciar-sesion" />
  if (roles && !roles.includes(user.role)) return <Navigate replace to={homeForRole(user.role)} />
  return children
}

export function homeForRole(role: UserRole): string {
  if (role === 'ORGANIZER') return '/organizador/eventos'
  if (role === 'DOOR_STAFF') return '/puerta'
  return '/eventos'
}
