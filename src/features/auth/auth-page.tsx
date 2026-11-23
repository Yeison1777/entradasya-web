import { ArrowLeft, ShieldCheck, Ticket } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, Input } from '@/shared/ui/form-controls'
import { homeForRole } from '@/app/route-guards'
import { useAuth } from './auth-context'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  if (user) return <Navigate replace to={homeForRole(user.role)} />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const authenticated = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)
      toast.success(mode === 'login' ? 'Sesión iniciada' : 'Tu cuenta está lista')
      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested || homeForRole(authenticated.role), { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo completar el acceso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,.45),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,.25),transparent_35%)]" />
        <Link className="relative flex items-center gap-3 text-lg font-semibold" to="/"><span className="grid size-11 place-items-center rounded-2xl bg-orange-500"><Ticket /></span>EntradasYa</Link>
        <div className="relative max-w-xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-orange-300">Todo en un solo lugar</p><h1 className="mt-4 text-5xl font-semibold tracking-tight">Entradas seguras. Momentos inolvidables.</h1><p className="mt-6 text-lg leading-8 text-slate-300">Compra, organiza o controla el ingreso con una experiencia simple construida para cada rol.</p><div className="mt-8 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="text-emerald-400" />Tus datos sensibles nunca se almacenan.</div></div>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[#f7f5f2] px-6 py-12">
        <div className="w-full max-w-md">
          <Link className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950" to="/"><ArrowLeft className="size-4" />Volver al inicio</Link>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">{mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a EntradasYa'}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
          <p className="mt-3 text-slate-600">{mode === 'login' ? 'Accede a tus eventos, compras o controles de ingreso.' : 'Tu nueva cuenta se creará con el rol de cliente.'}</p>
          <form className="mt-8 grid gap-5" onSubmit={submit}>
            {mode === 'register' ? <Field label="Nombre completo"><Input autoComplete="name" minLength={2} onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></Field> : null}
            <Field label="Correo electrónico"><Input autoComplete="email" onChange={(event) => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} /></Field>
            <Field hint={mode === 'register' ? 'Mínimo 8 caracteres, con mayúscula, minúscula y número.' : undefined} label="Contraseña"><Input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} onChange={(event) => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} /></Field>
            <Button className="h-11 bg-orange-500 text-white hover:bg-orange-600" disabled={loading} type="submit">{loading ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">{mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'} <Link className="font-semibold text-orange-600 hover:underline" to={mode === 'login' ? '/crear-cuenta' : '/iniciar-sesion'}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</Link></p>
        </div>
      </section>
    </main>
  )
}
