import ReactDOM from 'react-dom/client';
import '@/polyfills';
import '@/styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { RouterProvider } from 'react-router-dom';
import { initTWA } from '@/lib/twa';
import { router } from './router';

initTWA();

const manifestUrl = new URL(
  'tonconnect-manifest.json',
  `${window.location.origin}${import.meta.env.BASE_URL}`,
).toString();

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <RouterProvider router={router} />
    </TonConnectUIProvider>,
  );
}
