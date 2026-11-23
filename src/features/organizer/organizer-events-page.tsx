import { CalendarPlus, ImagePlus, MapPin, Plus, Send, Ticket, XCircle } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { api } from '@/shared/api/client'
import type { Event } from '@/shared/api/types'
import { Field, Input } from '@/shared/ui/form-controls'
import { formatDate, formatMoney } from '@/features/events/event-card'

export function OrganizerEventsPage() {
  const queryClient = useQueryClient()
  const events = useQuery({ queryKey: ['organizer-events'], queryFn: () => api<Event[]>('/organizer/events') })
  const [creating, setCreating] = useState(false)
  async function refresh() { await queryClient.invalidateQueries({ queryKey: ['organizer-events'] }) }
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Organizador</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Mis eventos</h1><p className="mt-3 text-slate-600">Crea el evento, agrega sectores e imágenes y publícalo cuando esté listo.</p></div><Button className="h-11 bg-orange-500 text-white hover:bg-orange-600" onClick={() => setCreating((value) => !value)}><CalendarPlus />{creating ? 'Cerrar formulario' : 'Nuevo evento'}</Button></div>
      {creating ? <CreateEventForm onCreated={async () => { setCreating(false); await refresh() }} /> : null}
      <div className="mt-8 grid gap-6">{events.isLoading ? <Notice text="Cargando eventos…" /> : events.data?.length ? events.data.map((event) => <OrganizerEventCard event={event} key={event.id} onChanged={refresh} />) : <Notice text="Todavía no creaste eventos." />}</div>
    </main>
  )
}

function CreateEventForm({ onCreated }: { onCreated(): Promise<void> }) {
  const [form, setForm] = useState({ name: '', description: '', startsAt: '', venueName: '', venueAddress: '', city: '' })
  const mutation = useMutation({ mutationFn: () => api<Event>('/organizer/events', { method: 'POST', body: JSON.stringify({ ...form, startsAt: new Date(form.startsAt).toISOString() }) }), onSuccess: async () => { toast.success('Evento creado como borrador'); await onCreated() }, onError: (error: Error) => toast.error(error.message) })
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate() }
  return <form className="mt-8 grid gap-5 rounded-3xl border border-orange-200 bg-orange-50/50 p-6 sm:grid-cols-2" onSubmit={submit}><Field label="Nombre"><Input minLength={3} onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></Field><Field label="Fecha y hora"><Input onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required type="datetime-local" value={form.startsAt} /></Field><Field label="Lugar"><Input onChange={(event) => setForm({ ...form, venueName: event.target.value })} required value={form.venueName} /></Field><Field label="Ciudad"><Input onChange={(event) => setForm({ ...form, city: event.target.value })} required value={form.city} /></Field><Field label="Dirección"><Input onChange={(event) => setForm({ ...form, venueAddress: event.target.value })} required value={form.venueAddress} /></Field><label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Descripción<textarea className="min-h-28 rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" minLength={10} onChange={(event) => setForm({ ...form, description: event.target.value })} required value={form.description} /></label><Button className="h-11 bg-orange-500 text-white hover:bg-orange-600 sm:col-span-2" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Creando…' : 'Crear borrador'}</Button></form>
}

function OrganizerEventCard({ event, onChanged }: { event: Event; onChanged(): Promise<void> }) {
  const [sectorOpen, setSectorOpen] = useState(false)
  const action = useMutation({ mutationFn: (name: 'publish' | 'cancel') => api<Event>(`/organizer/events/${event.id}/${name}`, { method: 'POST' }), onSuccess: async (_, name) => { toast.success(name === 'publish' ? 'Evento publicado' : 'Evento cancelado'); await onChanged() }, onError: (error: Error) => toast.error(error.message) })
  return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="grid lg:grid-cols-[15rem_1fr]"><div className="min-h-48 bg-slate-900">{event.coverImagePath ? <img alt="" className="size-full object-cover" src={event.coverImagePath} /> : <div className="grid size-full place-items-center text-slate-500"><Ticket className="size-14" /></div>}</div><div className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${event.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : event.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{event.status}</span><h2 className="mt-3 text-2xl font-semibold">{event.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="size-4" />{event.venueName} · {formatDate(event.startsAt)}</p></div><div className="flex flex-wrap gap-2">{event.status === 'DRAFT' ? <><Button onClick={() => setSectorOpen((value) => !value)} variant="outline"><Plus />Sector</Button><ImageUpload eventId={event.id} onChanged={onChanged} /><Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={action.isPending} onClick={() => action.mutate('publish')}><Send />Publicar</Button></> : null}{event.status === 'PUBLISHED' ? <Button disabled={action.isPending} onClick={() => action.mutate('cancel')} variant="destructive"><XCircle />Cancelar</Button> : null}</div></div><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{event.sectors.map((sector) => <div className="rounded-2xl bg-slate-50 p-4" key={sector.id}><strong>{sector.name}</strong><p className="mt-1 text-sm text-slate-500">{formatMoney(sector.price)} · {sector.availableCapacity}/{sector.capacity} disponibles</p></div>)}</div>{sectorOpen ? <SectorForm eventId={event.id} onCreated={async () => { setSectorOpen(false); await onChanged() }} /> : null}</div></div></article>
}

function SectorForm({ eventId, onCreated }: { eventId: string; onCreated(): Promise<void> }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', capacity: '' })
  const mutation = useMutation({ mutationFn: () => api(`/organizer/events/${eventId}/sectors`, { method: 'POST', body: JSON.stringify({ ...form, price: Number(form.price), capacity: Number(form.capacity) }) }), onSuccess: async () => { toast.success('Sector agregado'); await onCreated() }, onError: (error: Error) => toast.error(error.message) })
  return <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate() }}><Field label="Nombre"><Input onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} /></Field><Field label="Descripción"><Input onChange={(event) => setForm({ ...form, description: event.target.value })} required value={form.description} /></Field><Field label="Precio BOB"><Input min="0" onChange={(event) => setForm({ ...form, price: event.target.value })} required step="0.01" type="number" value={form.price} /></Field><Field label="Cupo"><Input min="1" onChange={(event) => setForm({ ...form, capacity: event.target.value })} required type="number" value={form.capacity} /></Field><Button className="bg-orange-500 text-white sm:col-span-4" disabled={mutation.isPending} type="submit">Agregar sector</Button></form>
}

function ImageUpload({ eventId, onChanged }: { eventId: string; onChanged(): Promise<void> }) {
  const mutation = useMutation({ mutationFn: (files: FileList) => { const form = new FormData(); if (files[0]) form.append('cover', files[0]); if (files[1]) form.append('sectorMap', files[1]); return api(`/organizer/events/${eventId}/images`, { method: 'POST', body: form }) }, onSuccess: async () => { toast.success('Imágenes actualizadas'); await onChanged() }, onError: (error: Error) => toast.error(error.message) })
  return <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium hover:bg-slate-50"><ImagePlus className="size-4" />Imágenes<input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={(event) => { if (event.target.files?.length) mutation.mutate(event.target.files) }} type="file" /></label>
}

function Notice({ text }: { text: string }) { return <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center text-slate-500">{text}</div> }
