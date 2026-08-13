import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_PASSWORD, invokeSiteData } from '../lib/siteData';

export type Booking = { id: string; tourId: string; tourHotel: string; tourDestination: string; tourPrice: number; name: string; phone: string; email: string; tripDate: string; adults: number; children: number; comment: string; status: 'new' | 'processed'; createdAt: string };
export type NewBooking = Omit<Booking, 'id' | 'status' | 'createdAt'>;
type ContextValue = { bookings: Booking[]; addBooking: (booking: NewBooking) => Promise<void>; toggleBookingStatus: (id: string) => Promise<void>; deleteBooking: (id: string) => Promise<void> };
const BookingsContext = createContext<ContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const load = useCallback(async () => {
    if (sessionStorage.getItem('nexttour:admin-authenticated') !== 'true') return;
    try { const data = await invokeSiteData({ action: 'admin_list_bookings', adminPassword: ADMIN_PASSWORD }); setBookings((data.bookings as Booking[]) ?? []); } catch { /* Повторим автоматически. */ }
  }, []);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 2500); return () => window.clearInterval(timer); }, [load]);
  const value = useMemo<ContextValue>(() => ({
    bookings,
    addBooking: async booking => { await invokeSiteData({ action: 'create_booking', data: booking }); },
    toggleBookingStatus: async id => { const item = bookings.find(booking => booking.id === id); await invokeSiteData({ action: 'admin_booking_status', adminPassword: ADMIN_PASSWORD, id, status: item?.status === 'new' ? 'processed' : 'new' }); await load(); },
    deleteBooking: async id => { await invokeSiteData({ action: 'admin_delete_booking', adminPassword: ADMIN_PASSWORD, id }); await load(); },
  }), [bookings, load]);
  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}
export function useBookings() { const context = useContext(BookingsContext); if (!context) throw new Error('useBookings должен использоваться внутри BookingsProvider'); return context; }
