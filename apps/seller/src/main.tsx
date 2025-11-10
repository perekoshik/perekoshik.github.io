import ReactDOM from 'react-dom/client';
import '@/polyfills';
import '@/styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { RouterProvider } from 'react-router-dom';
import { initTWA } from '@/lib/twa';
import { router } from './router';
import { getTwaReturnUrl, isTelegramWebApp } from '@/lib/tonconnect';

initTWA();

const manifestUrl = new URL(
  'tonconnect-manifest.json',
  `${window.location.origin}${import.meta.env.BASE_URL}`,
).toString();

const container = document.getElementById('root');
const enterTwa = isTelegramWebApp();
const twaReturnUrl = enterTwa ? getTwaReturnUrl() : undefined;

if (container) {
  ReactDOM.createRoot(container).render(
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={enterTwa ? { returnStrategy: 'none', twaReturnUrl } : undefined}
    >
      <RouterProvider router={router} />
    </TonConnectUIProvider>,
  );
}
