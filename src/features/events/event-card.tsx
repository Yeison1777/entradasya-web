import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Event } from '@/shared/api/types'

export function EventCard({ event }: { event: Event }) {
  const minimum = event.sectors.length ? Math.min(...event.sectors.map((sector) => sector.price)) : null
  return (
    <Link className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8" to={`/eventos/${event.id}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        {event.coverImagePath ? (
          <img alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" src={event.coverImagePath} />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#fb923c,#ea580c_35%,#0f172a_90%)]">
            <Ticket className="size-16 text-white/80" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
          {event.city}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold tracking-tight group-hover:text-orange-600">{event.name}</h3>
        <div className="mt-4 grid gap-2 text-sm text-slate-500">
          <p className="flex items-center gap-2"><CalendarDays className="size-4 text-orange-500" />{formatDate(event.startsAt)}</p>
          <p className="flex items-center gap-2"><MapPin className="size-4 text-orange-500" />{event.venueName}</p>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">{event.sectors.length} sectores</span>
          <span className="font-semibold">{minimum === null ? 'Próximamente' : `Desde ${formatMoney(minimum)}`}</span>
        </div>
      </div>
    </Link>
  )
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}

export function formatMoney(value: number, currency = 'BOB'): string {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency }).format(value)
}
