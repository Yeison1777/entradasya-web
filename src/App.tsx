import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/app/app-shell'
import { ProtectedRoute } from '@/app/route-guards'
import { AuthPage } from '@/features/auth/auth-page'
import { CheckinPage } from '@/features/checkin/checkin-page'
import { OrderDetailPage, OrdersPage } from '@/features/client/orders-page'
import { TicketsPage } from '@/features/client/tickets-page'
import { EventDetailPage } from '@/features/events/event-detail-page'
import { EventsPage } from '@/features/events/events-page'
import { HomePage } from '@/features/events/home-page'
import { OrganizerEventsPage } from '@/features/organizer/organizer-events-page'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthPage mode="login" />} path="/iniciar-sesion" />
      <Route element={<AuthPage mode="register" />} path="/crear-cuenta" />
      <Route element={<AppShell />}>
        <Route element={<HomePage />} index />
        <Route element={<EventsPage />} path="eventos" />
        <Route element={<EventDetailPage />} path="eventos/:id" />
        <Route element={<ProtectedRoute roles={['CLIENT']}><OrdersPage /></ProtectedRoute>} path="mis-compras" />
        <Route element={<ProtectedRoute roles={['CLIENT']}><OrderDetailPage /></ProtectedRoute>} path="mis-compras/:id" />
        <Route element={<ProtectedRoute roles={['CLIENT']}><TicketsPage /></ProtectedRoute>} path="mis-entradas" />
        <Route element={<ProtectedRoute roles={['ORGANIZER']}><OrganizerEventsPage /></ProtectedRoute>} path="organizador/eventos" />
        <Route element={<ProtectedRoute roles={['DOOR_STAFF']}><CheckinPage /></ProtectedRoute>} path="puerta" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
    </Routes>
  )
}
