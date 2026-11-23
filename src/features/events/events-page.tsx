import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { Input } from '@/shared/ui/form-controls'
import { api } from '@/shared/api/client'
import type { Event } from '@/shared/api/types'
import { EventCard } from './event-card'

export function EventsPage() {
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['events'], queryFn: () => api<Event[]>('/events') })
  const events = useMemo(() => query.data?.filter((event) => `${event.name} ${event.city} ${event.venueName}`.toLowerCase().includes(search.toLowerCase())) ?? [], [query.data, search])
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Cartelera</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Encuentra tu próximo evento</h1><p className="mt-3 text-slate-600">Compra por sector. La ubicación es libre dentro de la zona elegida.</p></div>
        <div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-3.5 size-4 text-slate-400" /><Input aria-label="Buscar eventos" className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, ciudad o lugar" value={search} /></div>
      </div>
      {query.isLoading ? <div className="mt-10 text-slate-500">Cargando eventos…</div> : query.isError ? <Notice text="No se pudo conectar con events-service." /> : events.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <Notice text="No encontramos eventos con esa búsqueda." />}
    </main>
  )
}

function Notice({ text }: { text: string }) { return <div className="mt-10 rounded-3xl border border-dashed border-slate-300 py-16 text-center text-slate-500">{text}</div> }
