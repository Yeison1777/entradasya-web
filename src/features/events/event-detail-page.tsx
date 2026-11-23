import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth/auth-context'
import { api } from '@/shared/api/client'
import type { Event, Order } from '@/shared/api/types'
import { formatDate, formatMoney } from './event-card'
import { CheckoutCard, type PaymentFormValue } from './checkout-card'

export function EventDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['event', id], queryFn: () => api<Event>(`/events/${id}`), enabled: Boolean(id) })
  const [sectorId, setSectorId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const event = query.data
  const sector = useMemo(() => event?.sectors.find((item) => item.id === sectorId) ?? event?.sectors[0], [event, sectorId])

  const purchase = useMutation({
    mutationFn: (payment: PaymentFormValue) => api<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ eventId: id, sectorId: sector?.id, quantity, payment: { ...payment, expiryMonth: Number(payment.expiryMonth), expiryYear: Number(payment.expiryYear) } }),
    }),
    onSuccess(order) {
      toast.success(order.status === 'PAID' ? 'Compra confirmada' : 'Orden procesada')
      navigate(`/mis-compras/${order.id}`)
    },
    onError(error: Error) { toast.error(error.message) },
  })

  if (query.isLoading) return <Centered text="Cargando evento…" />
  if (query.isError || !event) return <Centered text="No se pudo encontrar este evento." />
  const selectedSector = sector ?? event.sectors[0]

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {event.coverImagePath ? <img alt="" className="absolute inset-0 size-full object-cover opacity-30 blur-sm" src={event.coverImagePath} /> : null}
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="overflow-hidden rounded-[1.75rem] bg-slate-800 shadow-2xl"><div className="aspect-[16/10]">{event.coverImagePath ? <img alt={`Portada de ${event.name}`} className="size-full object-cover" src={event.coverImagePath} /> : <div className="grid size-full place-items-center"><Ticket className="size-20 text-orange-400" /></div>}</div></div>
          <div className="self-center"><span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider">{event.city}</span><h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{event.name}</h1><div className="mt-6 grid gap-3 text-slate-200"><p className="flex items-center gap-3"><CalendarDays className="size-5 text-orange-400" />{formatDate(event.startsAt)}</p><p className="flex items-center gap-3"><MapPin className="size-5 text-orange-400" />{event.venueName}, {event.venueAddress}</p></div><p className="mt-7 max-w-2xl whitespace-pre-line leading-7 text-slate-300">{event.description}</p></div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_28rem] lg:px-8">
        <section><h2 className="text-2xl font-semibold">Elige tu sector</h2><p className="mt-2 text-slate-600">La ubicación es libre dentro del sector. No se seleccionan asientos numerados en esta versión.</p>
          {event.sectorMapPath ? <img alt="Plano informativo de sectores" className="mt-6 max-h-[28rem] w-full rounded-3xl border border-slate-200 bg-white object-contain p-3" src={event.sectorMapPath} /> : null}
          <div className="mt-6 grid gap-3">{event.sectors.map((item) => <button className={`flex items-center justify-between rounded-2xl border p-5 text-left transition ${selectedSector?.id === item.id ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' : 'border-slate-200 bg-white hover:border-orange-200'}`} key={item.id} onClick={() => setSectorId(item.id)}><span><strong className="block">{item.name}</strong><span className="mt-1 block text-sm text-slate-500">{item.description}</span><span className="mt-2 block text-xs text-slate-500">{item.availableCapacity} disponibles</span></span><strong className="ml-4 whitespace-nowrap text-lg">{formatMoney(item.price, item.currency)}</strong></button>)}</div>
        </section>

        <CheckoutCard
          error={purchase.error instanceof Error ? purchase.error.message : undefined}
          event={event}
          loading={purchase.isPending}
          onQuantityChange={setQuantity}
          onSubmit={(payment) => purchase.mutate(payment)}
          quantity={quantity}
          sector={selectedSector}
          userRole={user?.role}
        />
      </div>
    </main>
  )
}

function Centered({ text }: { text: string }) { return <div className="grid min-h-[70vh] place-items-center px-6 text-center text-slate-500">{text}</div> }
