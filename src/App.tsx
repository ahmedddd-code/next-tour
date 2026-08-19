import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DepartureCityDialogs } from './components/DepartureCityDialogs';
import { CompareShortcut } from './components/CompareShortcut';
import { AuthModal } from './components/AuthModal';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { HomeShortcut } from './components/HomeShortcut';
import { ScreamerShortcut } from './components/ScreamerShortcut';
import { ScrollManager } from './components/ScrollManager';
import { useAuth } from './hooks/useAuth';

const page = <T extends object>(loader: () => Promise<T>, name: keyof T) => lazy(async () => ({ default: (await loader())[name] as React.ComponentType }));
const HomePage = page(() => import('./pages/HomePage'), 'HomePage');
const ToursPage = page(() => import('./pages/ToursPage'), 'ToursPage');
const TourPage = page(() => import('./pages/TourPage'), 'TourPage');
const SearchPage = page(() => import('./pages/SearchPage'), 'SearchPage');
const DestinationsPage = page(() => import('./pages/DestinationsPage'), 'DestinationsPage');
const AiPage = page(() => import('./pages/AiPage'), 'AiPage');
const ReviewsPage = page(() => import('./pages/ReviewsPage'), 'ReviewsPage');
const ContactsPage = page(() => import('./pages/ContactsPage'), 'ContactsPage');
const ChatPage = page(() => import('./pages/ChatPage'), 'ChatPage');
const AccountPage = page(() => import('./pages/AccountPage'), 'AccountPage');
const AdminPage = page(() => import('./pages/AdminPage'), 'AdminPage');
const ScreamerPage = page(() => import('./pages/ScreamerPage'), 'ScreamerPage');
const GamePage = page(() => import('./pages/GamePage'), 'GamePage');
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage');

function PageLoader() {
  return <div className="grid min-h-screen place-items-center bg-mist"><span className="size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-label="Загрузка страницы"/></div>;
}

function AuthExperience() {
  const { modalOpen, registrationSuccess } = useAuth();
  return modalOpen || registrationSuccess ? <AuthModal/> : null;
}

function PublicOverlays() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname === '/screamer' || pathname === '/game') return null;
  const travelPage = ['/', '/tours', '/search', '/destinations'].includes(pathname) || pathname.startsWith('/tour/');
  return <>{travelPage && <DepartureCityDialogs/>}{pathname !== '/chat' && <FloatingSupportWidget/>}</>;
}

export default function App() {
  return <><ScreamerShortcut/><ScrollManager/><Suspense fallback={<PageLoader/>}><Routes>
    <Route path="/" element={<HomePage/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/destinations" element={<DestinationsPage/>}/><Route path="/ai" element={<AiPage/>}/><Route path="/reviews" element={<ReviewsPage/>}/><Route path="/contacts" element={<ContactsPage/>}/>
    <Route path="/tours" element={<ToursPage/>}/><Route path="/tour/:id" element={<TourPage/>}/><Route path="/chat" element={<ChatPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="/screamer" element={<ScreamerPage/>}/><Route path="/game" element={<GamePage/>}/><Route path="*" element={<NotFoundPage/>}/>
  </Routes></Suspense><CompareShortcut/><HomeShortcut/><PublicOverlays/><AuthExperience/></>;
}
