import { CalendarDays, ChevronRight, CircleDollarSign, ReceiptText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { api } from '@/shared/api/client'
import type { Event, Order } from '@/shared/api/types'
import { formatDate, formatMoney } from '@/features/events/event-card'

const statusLabels = { PENDING: 'Pendiente', PAID: 'Pagada', REJECTED: 'Pago rechazado', CANCELLED: 'Cancelada' } as const
const statusStyles = { PENDING: 'bg-amber-50 text-amber-700', PAID: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-red-50 text-red-700', CANCELLED: 'bg-slate-100 text-slate-600' } as const

export function OrdersPage() {
  const query = useQuery({ queryKey: ['orders'], queryFn: () => api<Order[]>('/orders') })
  return <Page title="Mis compras" subtitle="Consulta el estado y detalle de todas tus órdenes.">{query.isLoading ? <Text text="Cargando compras…" /> : query.isError ? <Text text="No se pudieron cargar tus compras." /> : query.data?.length ? <div className="grid gap-4">{query.data.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <Text text="Todavía no realizaste ninguna compra." />}</Page>
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const query = useQuery({ queryKey: ['order', id], queryFn: () => api<Order>(`/orders/${id}`) })
  if (query.isLoading) return <Page title="Detalle de compra"><Text text="Cargando orden…" /></Page>
  if (!query.data) return <Page title="Detalle de compra"><Text text="No se encontró la orden." /></Page>
  const order = query.data
  return <Page title="Detalle de compra" subtitle={`Orden ${order.id}`}><div className="grid gap-5 lg:grid-cols-3"><div className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-span-2"><EventSummary eventId={order.eventId} /><dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2"><Info label="Cantidad" value={`${order.quantity} entrada${order.quantity === 1 ? '' : 's'}`} /><Info label="Precio unitario" value={order.unitPrice === null ? 'Pendiente' : formatMoney(order.unitPrice, order.currency)} /><Info label="Total" value={order.totalAmount === null ? 'Pendiente' : formatMoney(order.totalAmount, order.currency)} /><Info label="Creada" value={formatDate(order.createdAt)} /></dl></div><aside className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">Estado</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span><p className="mt-6 text-sm text-slate-500">Progreso interno</p><p className="mt-1 font-medium">{order.processStep.replaceAll('_', ' ')}</p>{order.failureCode ? <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{order.failureCode}</p> : null}</aside></div></Page>
}

function OrderCard({ order }: { order: Order }) {
  return <Link className="group flex items-center justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-lg hover:shadow-slate-900/5" to={`/mis-compras/${order.id}`}><div className="flex min-w-0 items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-600"><ReceiptText /></span><div className="min-w-0"><EventSummary compact eventId={order.eventId} /><p className="mt-1 text-sm text-slate-500">{order.quantity} entrada{order.quantity === 1 ? '' : 's'} · {formatDate(order.createdAt)}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span><strong>{order.totalAmount === null ? '—' : formatMoney(order.totalAmount, order.currency)}</strong><ChevronRight className="size-4 text-slate-400 group-hover:text-orange-500" /></div></Link>
}

function EventSummary({ eventId, compact = false }: { eventId: string; compact?: boolean }) {
  const query = useQuery({ queryKey: ['event', eventId], queryFn: () => api<Event>(`/events/${eventId}`), retry: false })
  if (compact) return <p className="truncate font-semibold">{query.data?.name ?? `Evento ${eventId.slice(0, 8)}`}</p>
  return <div><p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Evento</p><h2 className="mt-1 text-2xl font-semibold">{query.data?.name ?? `Evento ${eventId.slice(0, 8)}`}</h2>{query.data ? <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="size-4" />{formatDate(query.data.startsAt)}</p> : null}</div>
}

function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) { return <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-12 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Tu cuenta</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>{subtitle ? <p className="mt-3 break-all text-slate-500">{subtitle}</p> : null}<div className="mt-8">{children}</div></main> }
function Text({ text }: { text: string }) { return <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center text-slate-500">{text}</div> }
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="flex items-center gap-2 text-sm text-slate-500"><CircleDollarSign className="size-4" />{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }
