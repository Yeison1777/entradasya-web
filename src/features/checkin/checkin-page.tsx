import { CheckCircle2, Clock3, ScanLine, ShieldAlert, Users, XCircle } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { api } from '@/shared/api/client'
import type { Event } from '@/shared/api/types'
import { Field, Input, Select } from '@/shared/ui/form-controls'
import { QrScanner } from './qr-scanner'

type CheckinResult =
  | { status: 'ADMITTED'; checkinId: string; checkedInAt: string }
  | { status: 'ALREADY_USED'; checkedInAt: string }
  | { status: 'INVALID_CODE' | 'WRONG_EVENT' | 'VALIDATION_UNAVAILABLE' }

interface RecentCheckin { id: string; ticketId: string; ticketCodeSuffix: string; checkedInAt: string }

export function CheckinPage() {
  const client = useQueryClient()
  const events = useQuery({ queryKey: ['events'], queryFn: () => api<Event[]>('/events') })
  const [eventId, setEventId] = useState('')
  const [code, setCode] = useState('')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const summary = useQuery({ queryKey: ['checkin-summary', eventId], queryFn: () => api<{ admitted: number }>(`/checkins/events/${eventId}/summary`), enabled: Boolean(eventId), refetchInterval: 10_000 })
  const recent = useQuery({ queryKey: ['checkin-recent', eventId], queryFn: () => api<RecentCheckin[]>(`/checkins/events/${eventId}/recent`), enabled: Boolean(eventId), refetchInterval: 10_000 })
  const register = useMutation({ mutationFn: (ticketCode: string) => api<CheckinResult>('/checkins', { method: 'POST', body: JSON.stringify({ eventId, code: ticketCode }) }), onSuccess: async (value) => { setResult(value); setCode(''); await client.invalidateQueries({ queryKey: ['checkin-summary', eventId] }); await client.invalidateQueries({ queryKey: ['checkin-recent', eventId] }) }, onError: () => setResult({ status: 'VALIDATION_UNAVAILABLE' }) })
  function submit(event: FormEvent) { event.preventDefault(); setResult(null); register.mutate(code.trim()) }
  function scan(ticketCode: string) { setCode(ticketCode); setResult(null); register.mutate(ticketCode.trim()) }
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Control de puerta</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Validar ingreso</h1><p className="mt-3 text-slate-600">Selecciona el evento y escanea o pega el código de la entrada.</p>
          <form className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}><div><Field label="Evento"><Select disabled={events.isLoading || events.isError} onChange={(event) => { setEventId(event.target.value); setResult(null) }} required value={eventId}><option value="">{events.isLoading ? 'Cargando eventos…' : events.isError ? 'No se pudieron cargar los eventos' : 'Seleccionar evento'}</option>{events.data?.map((event) => <option key={event.id} value={event.id}>{event.name} — {event.city}</option>)}</Select></Field>{events.isError ? <button className="mt-2 text-sm font-medium text-orange-700 underline-offset-4 hover:underline" onClick={() => void events.refetch()} type="button">Reintentar carga de eventos</button> : null}</div><QrScanner disabled={!eventId || register.isPending} onDetected={scan} /><div className="relative flex items-center"><span className="h-px flex-1 bg-slate-200" /><span className="px-3 text-xs uppercase tracking-wider text-slate-400">o ingresa el código</span><span className="h-px flex-1 bg-slate-200" /></div><Field label="Código de entrada"><div className="relative"><ScanLine className="absolute left-3 top-3.5 size-4 text-slate-400" /><Input autoFocus className="pl-9 font-mono" minLength={32} onChange={(event) => setCode(event.target.value)} placeholder="Pega o escribe el código" required value={code} /></div></Field><Button className="h-12 bg-orange-500 text-base text-white hover:bg-orange-600" disabled={register.isPending || !eventId} type="submit">{register.isPending ? 'Validando…' : 'Registrar ingreso'}</Button></form>
          {result ? <ResultCard result={result} /> : null}
          <div className="mt-8"><h2 className="text-xl font-semibold">Últimos ingresos</h2>{!eventId ? <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Selecciona un evento para consultar sus ingresos.</p> : recent.isLoading ? <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando ingresos…</p> : recent.isError ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"><p>No se pudieron cargar los últimos ingresos.</p><button className="mt-2 font-semibold underline-offset-4 hover:underline" onClick={() => void recent.refetch()} type="button">Reintentar</button></div> : recent.data?.length ? <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">{recent.data.map((item) => <div className="flex items-center justify-between p-4" key={item.id}><span className="font-mono text-sm">…{item.ticketCodeSuffix}</span><span className="text-sm text-slate-500">{new Date(item.checkedInAt).toLocaleTimeString('es-BO')}</span></div>)}</div> : <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Aún no hay ingresos para este evento.</p>}</div>
        </section>
        <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white lg:sticky lg:top-24"><span className="grid size-12 place-items-center rounded-2xl bg-orange-500"><Users /></span><p className="mt-6 text-sm uppercase tracking-wider text-slate-400">Personas admitidas</p><strong className="mt-2 block text-6xl tracking-tight">{summary.data?.admitted ?? 0}</strong><p className="mt-4 text-sm leading-6 text-slate-400">El contador se actualiza automáticamente cada diez segundos.</p></aside>
      </div>
    </main>
  )
}

function ResultCard({ result }: { result: CheckinResult }) {
  const config = result.status === 'ADMITTED'
    ? { icon: CheckCircle2, title: 'Ingreso admitido', text: 'La entrada fue registrada correctamente.', style: 'border-emerald-300 bg-emerald-50 text-emerald-900' }
    : result.status === 'ALREADY_USED'
      ? { icon: Clock3, title: 'Entrada ya utilizada', text: `Primer ingreso: ${new Date(result.checkedInAt).toLocaleString('es-BO')}`, style: 'border-amber-300 bg-amber-50 text-amber-900' }
      : result.status === 'WRONG_EVENT'
        ? { icon: ShieldAlert, title: 'Evento incorrecto', text: 'La entrada corresponde a otro evento.', style: 'border-red-300 bg-red-50 text-red-900' }
        : result.status === 'INVALID_CODE'
          ? { icon: XCircle, title: 'Código inválido', text: 'No existe una entrada válida con este código.', style: 'border-red-300 bg-red-50 text-red-900' }
          : { icon: ShieldAlert, title: 'Validación no disponible', text: 'No se pudo consultar el servicio de entradas.', style: 'border-slate-300 bg-slate-100 text-slate-900' }
  const Icon = config.icon
  return <div className={`mt-6 flex items-center gap-5 rounded-3xl border p-6 ${config.style}`}><Icon className="size-12 shrink-0" /><div><h2 className="text-2xl font-semibold">{config.title}</h2><p className="mt-1">{config.text}</p></div></div>
}
