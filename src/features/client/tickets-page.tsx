import { Download, QrCode, Ticket as TicketIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { api, downloadWithAuth } from '@/shared/api/client'
import type { Event, Ticket } from '@/shared/api/types'
import { formatDate } from '@/features/events/event-card'

export function TicketsPage() {
  const query = useQuery({ queryKey: ['tickets'], queryFn: () => api<Ticket[]>('/tickets') })
  return <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Tu cuenta</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Mis entradas</h1><p className="mt-3 text-slate-600">Descarga tus PDF y evita compartir los códigos antes del evento.</p>{query.isLoading ? <Notice text="Cargando entradas…" /> : query.data?.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">{query.data.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</div> : <Notice text="Aún no tienes entradas emitidas." />}</main>
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const event = useQuery({ queryKey: ['event', ticket.eventId], queryFn: () => api<Event>(`/events/${ticket.eventId}`), retry: false })
  async function download() { try { await downloadWithAuth(`/tickets/${ticket.id}/download`, `entrada-${ticket.id}.pdf`) } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo descargar.') } }
  return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-start justify-between bg-slate-950 p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-wider text-orange-400">Entrada #{ticket.sequence}</p><h2 className="mt-1 text-xl font-semibold">{event.data?.name ?? `Evento ${ticket.eventId.slice(0, 8)}`}</h2></div><QrCode className="size-9 text-orange-400" /></div><div className="p-5"><p className="text-sm text-slate-500">Emitida {formatDate(ticket.issuedAt)}</p><p className="mt-3 flex items-center gap-2 text-sm"><TicketIcon className="size-4 text-orange-500" /><span className="font-mono">…{ticket.code.slice(-8)}</span></p><Button className="mt-5 h-10 w-full bg-orange-500 text-white hover:bg-orange-600" onClick={download}><Download />Descargar PDF</Button></div></article>
}

function Notice({ text }: { text: string }) { return <div className="mt-8 rounded-3xl border border-dashed border-slate-300 py-16 text-center text-slate-500">{text}</div> }
