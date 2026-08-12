import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ToursProvider } from './hooks/useTours';
import { BookingsProvider } from './hooks/useBookings';
import { ReviewsProvider } from './hooks/useReviews';
import { SupportChatProvider } from './hooks/useSupportChat';
import { DepartureCityProvider } from './hooks/useDepartureCity';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ToursProvider>
          <BookingsProvider>
            <ReviewsProvider>
              <SupportChatProvider>
                <DepartureCityProvider>
                  <App />
                </DepartureCityProvider>
              </SupportChatProvider>
            </ReviewsProvider>
          </BookingsProvider>
        </ToursProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
