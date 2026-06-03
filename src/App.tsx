import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import AuthPage from './pages/Auth/AuthPage'
import { AuthLayout } from './layouts/AuthLayout'
import HotelsPage from './pages/HotelsPage/HotelsPage'
import { BookingsTable } from './pages/admin/BookingsTable'
import { AddHotelForm } from './pages/admin/AddHotelForm'
import { AddRoomForm } from './pages/admin/AddRoomForm'
import { BookingHistory } from './pages/profile/BookingHistory'
import { BookingDetails } from './pages/BookingDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HotelsPage />} />
          
          {/* 👇 BOO-35: Интерфейс управляющего */}
          <Route path="/admin/bookings" element={<BookingsTable />} />
          <Route path="/admin/add-hotel" element={<AddHotelForm />} />
          <Route path="/admin/hotels/:hotelId/add-room" element={<AddRoomForm />} />
          
          {/* 👇 BOO-34: Оформление бронирования и ЛК */}
          <Route path="/profile/bookings" element={<BookingHistory />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
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