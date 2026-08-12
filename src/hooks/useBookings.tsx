import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'nexttour:bookings:v1';

export type Booking = {
  id: string;
  tourId: string;
  tourHotel: string;
  tourDestination: string;
  tourPrice: number;
  name: string;
  phone: string;
  email: string;
  tripDate: string;
  adults: number;
  children: number;
  comment: string;
  status: 'new' | 'processed';
  createdAt: string;
};

export type NewBooking = Omit<Booking, 'id' | 'status' | 'createdAt'>;

type BookingsContextValue = {
  bookings: Booking[];
  addBooking: (booking: NewBooking) => Booking;
  toggleBookingStatus: (id: string) => void;
  deleteBooking: (id: string) => void;
};

const BookingsContext = createContext<BookingsContextValue | null>(null);

function loadBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as Booking[] : [];
  } catch {
    return [];
  }
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    const syncBookings = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setBookings(loadBookings());
    };
    window.addEventListener('storage', syncBookings);
    return () => window.removeEventListener('storage', syncBookings);
  }, []);

  const value = useMemo<BookingsContextValue>(() => ({
    bookings,
    addBooking: draft => {
      const booking: Booking = {
        ...draft,
        id: `booking-${crypto.randomUUID()}`,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      setBookings(current => [booking, ...current]);
      return booking;
    },
    toggleBookingStatus: id => setBookings(current => current.map(booking => (
      booking.id === id ? { ...booking, status: booking.status === 'new' ? 'processed' : 'new' } : booking
    ))),
    deleteBooking: id => setBookings(current => current.filter(booking => booking.id !== id)),
  }), [bookings]);

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) throw new Error('useBookings должен использоваться внутри BookingsProvider');
  return context;
}
