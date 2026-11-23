export type UserRole = 'CLIENT' | 'ORGANIZER' | 'DOOR_STAFF'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
}

export interface AuthSession {
  accessToken: string
  user: User
}

export interface Sector {
  id: string
  eventId: string
  name: string
  description: string
  price: number
  currency: string
  capacity: number
  availableCapacity: number
  active: boolean
}

export interface Event {
  id: string
  organizerId: string
  name: string
  description: string
  startsAt: string
  venueName: string
  venueAddress: string
  city: string
  coverImagePath: string | null
  sectorMapPath: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  sectors: Sector[]
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  customerId: string
  eventId: string
  sectorId: string
  quantity: number
  unitPrice: number | null
  totalAmount: number | null
  currency: string
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED'
  processStep:
    | 'CREATED'
    | 'CAPACITY_RESERVED'
    | 'PAYMENT_APPROVED'
    | 'TICKETS_ISSUED'
    | 'COMPLETED'
  failureCode: string | null
  createdAt: string
}

export interface Ticket {
  id: string
  orderId: string
  customerId: string
  eventId: string
  sectorId: string
  sequence: number
  code: string
  status: 'VALID' | 'CANCELLED'
  issuedAt: string
}

export interface ApiErrorBody {
  statusCode?: number
  code?: string
  message?: string | string[]
}
