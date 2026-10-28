import {createRoot} from 'react-dom/client';
import { APIProvider } from '@vis.gl/react-google-maps';
import App from './App.tsx';
import './index.css';

import { AuthProvider } from './context/AuthContext.tsx';
import { ChatProvider } from './context/ChatContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';

// Google Maps Quota Handling (Tier 1)
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

createRoot(document.getElementById('root')!).render(
  <APIProvider 
    apiKey={API_KEY} 
    libraries={['marker', 'places', 'routes']}
  >
    <AuthProvider>
      <LocationProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </LocationProvider>
    </AuthProvider>
  </APIProvider>
);
