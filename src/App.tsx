import { Route, Routes } from 'react-router-dom';
import { ScrollManager } from './components/ScrollManager';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { DepartureCityDialogs } from './components/DepartureCityDialogs';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TourPage } from './pages/TourPage';
import { ToursPage } from './pages/ToursPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  return <><ScrollManager/><Routes><Route path="/" element={<HomePage/>}/><Route path="/tours" element={<ToursPage/>}/><Route path="/tour/:id" element={<TourPage/>}/><Route path="/chat" element={<ChatPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes><DepartureCityDialogs/><FloatingSupportWidget/></>;
}
