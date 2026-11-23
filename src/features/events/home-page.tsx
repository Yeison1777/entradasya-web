import { ArrowRight, ScanLine, ShieldCheck, Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { EventCard } from './event-card'
import { api } from '@/shared/api/client'
import type { Event } from '@/shared/api/types'
import heroImage from '@/assets/hero.png'

export function HomePage() {
  const events = useQuery({ queryKey: ['events'], queryFn: () => api<Event[]>('/events') })
  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,.22),transparent_27%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,.12),transparent_25%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">Eventos en Bolivia, entradas en segundos</p>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-.04em] text-slate-950 sm:text-6xl lg:text-7xl">Tu próxima historia comienza aquí.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Descubre conciertos y experiencias, elige tu sector y lleva tus entradas digitales siempre contigo.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: 'lg', className: 'h-12 bg-orange-500 px-5 text-white hover:bg-orange-600' })} to="/eventos">Explorar cartelera <ArrowRight /></Link>
              <Link className={buttonVariants({ size: 'lg', variant: 'outline', className: 'h-12 bg-white px-5' })} to="/iniciar-sesion">Publicar un evento</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 -z-10 rotate-3 rounded-[2rem] bg-orange-300/30" />
            <img alt="Público disfrutando un concierto" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl" src={heroImage} />
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Entrada digital</p>
              <p className="mt-1 flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-emerald-500" />Lista para ingresar</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-orange-600">Cartelera</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Eventos que no querrás perderte</h2></div>
          <Link className="hidden text-sm font-semibold text-orange-600 sm:block" to="/eventos">Ver todos →</Link>
        </div>
        {events.isLoading ? <LoadingCards /> : events.isError ? <Empty title="No pudimos cargar la cartelera" /> : events.data?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.data.slice(0, 3).map((event) => <EventCard event={event} key={event.id} />)}</div>
        ) : <Empty title="Pronto encontrarás nuevos eventos aquí" />}
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
          <Feature icon={Ticket} title="Una entrada por persona" text="Cada unidad comprada genera su propio PDF y código QR seguro." />
          <Feature icon={ShieldCheck} title="Compra protegida" text="Los cupos se reservan de forma atómica y nunca vendemos por encima del aforo." />
          <Feature icon={ScanLine} title="Ingreso sin vueltas" text="El primer escaneo admite el ingreso y los duplicados quedan bloqueados." />
        </div>
      </section>
    </main>
  )
}

function Feature({ icon: Icon, title, text }: { icon: typeof Ticket; title: string; text: string }) {
  return <article><span className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><Icon /></span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></article>
}

function LoadingCards() { return <div className="mt-8 grid gap-6 md:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-96 animate-pulse rounded-[1.5rem] bg-slate-200" key={item} />)}</div> }
function Empty({ title }: { title: string }) { return <div className="mt-8 rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center text-slate-500">{title}</div> }
