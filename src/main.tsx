import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ToursProvider } from './hooks/useTours';
import { DepartureCityProvider } from './hooks/useDepartureCity';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ToastProvider><AuthProvider>
          <ToursProvider>
            <DepartureCityProvider>
              <App />
            </DepartureCityProvider>
          </ToursProvider>
        </AuthProvider></ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
