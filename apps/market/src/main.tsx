import ReactDOM from 'react-dom/client';
import '@/polyfills';
import '@/styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { RouterProvider } from 'react-router-dom';
import { initTWA } from '@/lib/twa';
import { router } from './router';

initTWA();

const manifestEnv = (import.meta.env?.VITE_TONCONNECT_MANIFEST_URL as string | undefined)?.trim();
const manifestUrl = manifestEnv && /^https?:\/\//i.test(manifestEnv)
  ? manifestEnv
  : `${window.location.origin}/tonconnect-manifest.json`;

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <RouterProvider router={router} />
    </TonConnectUIProvider>,
  );
}
