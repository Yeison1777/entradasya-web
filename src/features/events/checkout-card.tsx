import { CreditCard, HelpCircle, LoaderCircle, LockKeyhole, Minus, Plus } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import type { Event, Sector, UserRole } from '@/shared/api/types'
import { cn } from '@/lib/utils'
import { formatDate, formatMoney } from './event-card'

export interface PaymentFormValue {
  cardNumber: string
  cardHolder: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

interface CheckoutCardProps {
  event: Event
  sector?: Sector
  quantity: number
  userRole?: UserRole
  loading: boolean
  error?: string
  onQuantityChange(quantity: number): void
  onSubmit(payment: PaymentFormValue): void
}

export function CheckoutCard({
  event,
  sector,
  quantity,
  userRole,
  loading,
  error,
  onQuantityChange,
  onSubmit,
}: CheckoutCardProps) {
  const total = sector ? sector.price * quantity : 0

  return (
    <aside className="h-fit overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/8 lg:sticky lg:top-24">
      <div className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white">
        <div className="absolute -right-10 -top-12 size-40 rounded-full bg-orange-500/25 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[.18em] text-orange-400">Resumen de compra</p>
        <h2 className="relative mt-2 text-xl font-semibold">{event.name}</h2>
        <p className="relative mt-1 text-sm text-slate-400">{formatDate(event.startsAt)}</p>
      </div>

      <div className="p-6">
        {sector ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Sector seleccionado</p>
                <p className="mt-1 font-semibold">{sector.name}</p>
              </div>
              <strong className="text-lg">{formatMoney(sector.price, sector.currency)}</strong>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-slate-500">Cantidad de entradas</span>
              <div className="flex items-center gap-2">
                <Button aria-label="Restar una entrada" disabled={quantity <= 1 || loading} onClick={() => onQuantityChange(quantity - 1)} size="icon-sm" type="button" variant="outline">
                  <Minus />
                </Button>
                <strong className="w-7 text-center tabular-nums">{quantity}</strong>
                <Button aria-label="Sumar una entrada" disabled={loading || quantity >= Math.min(6, sector.availableCapacity)} onClick={() => onQuantityChange(quantity + 1)} size="icon-sm" type="button" variant="outline">
                  <Plus />
                </Button>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 border-y border-slate-100 py-5 text-sm">
              <PriceRow label={`${quantity} entrada${quantity === 1 ? '' : 's'} × ${formatMoney(sector.price, sector.currency)}`} value={formatMoney(total, sector.currency)} />
              <PriceRow label="Cargo por servicio" value={formatMoney(0, sector.currency)} />
            </dl>
            <div className="flex items-end justify-between py-5">
              <span className="font-medium">Total</span>
              <div className="text-right">
                <strong className="block text-2xl tracking-tight">{formatMoney(total, sector.currency)}</strong>
                <span className="text-xs text-slate-400">Impuestos incluidos</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">No hay sectores disponibles para comprar.</p>
        )}

        {sector && userRole === 'CLIENT' ? (
          <PaymentForm currency={sector.currency} error={error} loading={loading} onSubmit={onSubmit} total={total} />
        ) : sector && userRole ? (
          <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">Las compras están disponibles únicamente para cuentas de cliente.</p>
        ) : sector ? (
          <Link className={buttonVariants({ className: 'h-11 w-full bg-orange-500 text-white hover:bg-orange-600' })} state={{ from: `/eventos/${event.id}` }} to="/iniciar-sesion">
            Inicia sesión para comprar
          </Link>
        ) : null}

        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          El número completo de la tarjeta y el código de seguridad no se almacenan.
        </p>
      </div>
    </aside>
  )
}

function PaymentForm({
  currency,
  total,
  loading,
  error,
  onSubmit,
}: {
  currency: string
  total: number
  loading: boolean
  error?: string
  onSubmit(value: PaymentFormValue): void
}) {
  const [form, setForm] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const digits = form.cardNumber.replace(/\D/g, '')
  const brand = cardBrand(digits)

  function submit(event: FormEvent) {
    event.preventDefault()
    const validation = validatePayment(form)
    setErrors(validation)
    if (Object.keys(validation).length) return
    const [month, shortYear] = form.expiry.split('/')
    onSubmit({
      cardNumber: digits,
      cardHolder: form.cardHolder.trim(),
      expiryMonth: month,
      expiryYear: `20${shortYear}`,
      cvv: form.cvv,
    })
  }

  return (
    <form className="border-t border-slate-100 pt-6" noValidate onSubmit={submit}>
      <div className="mb-6 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,.45),transparent_35%),linear-gradient(135deg,#0f172a,#1e293b)] p-5 text-white shadow-xl shadow-slate-950/20">
        <div className="flex items-center justify-between">
          <span className="grid size-9 place-items-center rounded-xl bg-white/10"><CreditCard className="size-5" /></span>
          <span className="text-sm font-semibold tracking-[.15em]">{brand}</span>
        </div>
        <p className="mt-8 font-mono text-lg tracking-[.14em]">{displayCardNumber(digits)}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Titular</p>
            <p className="mt-1 truncate text-sm font-medium">{form.cardHolder || 'NOMBRE DEL TITULAR'}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Vence</p>
            <p className="mt-1 font-mono text-sm">{form.expiry || 'MM/AA'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <PaymentField error={errors.cardNumber} label="Número de tarjeta">
          <input
            aria-invalid={Boolean(errors.cardNumber)}
            autoComplete="cc-number"
            className={inputStyles(Boolean(errors.cardNumber))}
            inputMode="numeric"
            maxLength={19}
            onChange={(event) => setForm({ ...form, cardNumber: event.target.value.replace(/\D/g, '').slice(0, 16) })}
            placeholder="0000 0000 0000 0000"
            value={formatCardNumber(digits)}
          />
        </PaymentField>

        <PaymentField error={errors.cardHolder} label="Nombre del titular">
          <input
            aria-invalid={Boolean(errors.cardHolder)}
            autoComplete="cc-name"
            className={inputStyles(Boolean(errors.cardHolder))}
            maxLength={120}
            onChange={(event) => setForm({ ...form, cardHolder: event.target.value.toUpperCase() })}
            placeholder="NOMBRE APELLIDO"
            value={form.cardHolder}
          />
        </PaymentField>

        <div className="grid grid-cols-2 gap-3">
          <PaymentField error={errors.expiry} label="Vencimiento">
            <input
              aria-invalid={Boolean(errors.expiry)}
              autoComplete="cc-exp"
              className={inputStyles(Boolean(errors.expiry))}
              inputMode="numeric"
              onChange={(event) => setForm({ ...form, expiry: formatExpiry(event.target.value) })}
              placeholder="MM/AA"
              value={form.expiry}
            />
          </PaymentField>
          <PaymentField error={errors.cvv} label={<span className="flex items-center gap-1.5">Código de seguridad <HelpCircle className="size-3.5 text-slate-400" aria-label="Tres dígitos impresos en el reverso de tu tarjeta" /></span>}>
            <input
              aria-invalid={Boolean(errors.cvv)}
              autoComplete="cc-csc"
              className={inputStyles(Boolean(errors.cvv))}
              inputMode="numeric"
              maxLength={3}
              onChange={(event) => setForm({ ...form, cvv: event.target.value.replace(/\D/g, '').slice(0, 3) })}
              placeholder="•••"
              type="password"
              value={form.cvv}
            />
          </PaymentField>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p> : null}

      <Button className="mt-5 h-12 w-full bg-orange-500 text-base text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600" disabled={loading} type="submit">
        {loading ? <><LoaderCircle className="animate-spin" />Procesando pago…</> : <>Pagar {formatMoney(total, currency)}</>}
      </Button>
    </form>
  )
}

function PaymentField({ label, error, children }: { label: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="font-medium">{value}</dd></div>
}

function inputStyles(invalid: boolean) {
  return cn(
    'h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4',
    invalid ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-orange-400 focus:ring-orange-100',
  )
}

function formatCardNumber(value: string) {
  return value.replace(/(.{4})/g, '$1 ').trim()
}

function displayCardNumber(value: string) {
  return formatCardNumber(value.padEnd(16, '•')).slice(0, 19)
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function cardBrand(value: string) {
  if (value.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(value) || /^2(2[2-9]|[3-6]|7[01])/.test(value)) return 'MASTERCARD'
  return 'ENTRADASYA'
}

function validatePayment(form: { cardNumber: string; cardHolder: string; expiry: string; cvv: string }) {
  const errors: Partial<Record<keyof typeof form, string>> = {}
  const cardNumber = form.cardNumber.replace(/\D/g, '')
  if (cardNumber.length !== 16) errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.'
  if (form.cardHolder.trim().length < 2) errors.cardHolder = 'Ingresa el nombre del titular.'

  const match = /^(\d{2})\/(\d{2})$/.exec(form.expiry)
  if (!match) {
    errors.expiry = 'Usa el formato MM/AA.'
  } else {
    const month = Number(match[1])
    const year = 2000 + Number(match[2])
    const now = new Date()
    if (month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiry = 'La fecha de vencimiento no es válida.'
    }
  }

  if (!/^\d{3}$/.test(form.cvv)) errors.cvv = 'Ingresa exactamente 3 dígitos.'
  return errors
}
