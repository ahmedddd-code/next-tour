import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScrollManager } from './components/ScrollManager';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { DepartureCityDialogs } from './components/DepartureCityDialogs';
import { useAuth } from './hooks/useAuth';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ToursPage = lazy(() => import('./pages/ToursPage').then(module => ({ default: module.ToursPage })));
const TourPage = lazy(() => import('./pages/TourPage').then(module => ({ default: module.TourPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(module => ({ default: module.AccountPage })));
const AuthModal = lazy(() => import('./components/AuthModal').then(module => ({ default: module.AuthModal })));

function PageLoader() {
  return <div className="grid min-h-screen place-items-center bg-mist"><span className="size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-label="Загрузка страницы"/></div>;
}

function AuthExperience() {
  const { modalOpen, registrationSuccess } = useAuth();
  return modalOpen || registrationSuccess ? <Suspense fallback={null}><AuthModal/></Suspense> : null;
}

function PublicOverlays() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  const travelPage = pathname === '/' || pathname === '/tours' || pathname.startsWith('/tour/');
  return <>{travelPage && <DepartureCityDialogs/>}{pathname !== '/chat' && <FloatingSupportWidget/>}</>;
}

export default function App() {
  return <><ScrollManager/><Suspense fallback={<PageLoader/>}><Routes><Route path="/" element={<HomePage/>}/><Route path="/search" element={<Navigate to="/" replace state={{ scrollTo: 'search' }}/>}/><Route path="/ai" element={<Navigate to="/" replace state={{ scrollTo: 'ai' }}/>}/><Route path="/tours" element={<ToursPage/>}/><Route path="/tour/:id" element={<TourPage/>}/><Route path="/chat" element={<ChatPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></Suspense><PublicOverlays/><AuthExperience/></>;
}
