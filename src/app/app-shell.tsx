import {
  CalendarDays,
  ClipboardList,
  LogOut,
  Menu,
  ScanLine,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const roleLabels = {
  CLIENT: 'Cliente',
  ORGANIZER: 'Organizador',
  DOOR_STAFF: 'Control de puerta',
} as const

export function AppShell() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const links = user
    ? user.role === 'CLIENT'
      ? [
          { to: '/eventos', label: 'Eventos', icon: CalendarDays },
          { to: '/mis-compras', label: 'Mis compras', icon: ClipboardList },
          { to: '/mis-entradas', label: 'Mis entradas', icon: Ticket },
        ]
      : user.role === 'ORGANIZER'
        ? [{ to: '/organizador/eventos', label: 'Mis eventos', icon: CalendarDays }]
        : [{ to: '/puerta', label: 'Control de ingreso', icon: ScanLine }]
    : [{ to: '/eventos', label: 'Cartelera', icon: CalendarDays }]

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f5f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5 font-semibold tracking-tight" to="/">
            <span className="grid size-10 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Ticket className="size-5" />
            </span>
            <span className="text-lg">EntradasYa</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950',
                    isActive && 'bg-white text-slate-950 shadow-sm',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
                </div>
                <button
                  className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-950"
                  onClick={logout}
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link className={buttonVariants({ variant: 'ghost' })} to="/iniciar-sesion">
                  Iniciar sesión
                </Link>
                <Link className={buttonVariants({ className: 'bg-orange-500 hover:bg-orange-600' })} to="/crear-cuenta">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          <button className="grid size-10 place-items-center md:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-slate-200 bg-white p-4 md:hidden">
            <nav className="grid gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium" key={to} onClick={() => setOpen(false)} to={to}>
                  <Icon className="size-4 text-orange-500" /> {label}
                </Link>
              ))}
              {user ? (
                <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium" onClick={logout}>
                  <LogOut className="size-4 text-orange-500" /> Cerrar sesión
                </button>
              ) : (
                <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium" to="/iniciar-sesion">
                  <UserRound className="size-4 text-orange-500" /> Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>
      <Outlet />
      <footer className="mt-20 border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
        EntradasYa v1 · Plataforma local de eventos
      </footer>
    </div>
  )
}
