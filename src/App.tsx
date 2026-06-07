import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import AuthPage from './pages/Auth/AuthPage'
import { AuthLayout } from './layouts/AuthLayout'
import HotelsPage from './pages/HotelsPage/HotelsPage'
import { AdminPage } from './pages/admin/AdminPage'
import { AddHotelForm } from './pages/admin/AddHotelForm'
import { AddRoomForm } from './pages/admin/AddRoomForm'
import { BookingHistory } from './pages/profile/BookingHistory'
import { useAuth } from './hooks/useAuth'
import { HotelDetailPage } from './pages/HotelDetailPage/HotelDetailPage'

// Updated ProtectedRoute to handle roles
function ProtectedRoute({ children, managerOnly = false }: { children: React.ReactNode, managerOnly?: boolean }) {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (managerOnly && !user?.is_manager) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HotelsPage />} />
          <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute managerOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-hotel" element={
            <ProtectedRoute managerOnly={true}>
              <AddHotelForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-room" element={
            <ProtectedRoute managerOnly={true}>
              <AddRoomForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-room/:hotelId" element={
            <ProtectedRoute managerOnly={true}>
              <AddRoomForm />
            </ProtectedRoute>
          } />
          
          {/* User Profile Routes */}
          <Route path="/profile/bookings" element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          } />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<AuthPage initialIsLogin={true} />} />
          <Route path="register" element={<AuthPage initialIsLogin={false} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
