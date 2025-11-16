import ReactDOM from 'react-dom/client';
import '@/polyfills';
import '@/styles.css';
import { TonConnectUIProvider, type ActionConfiguration } from '@tonconnect/ui-react';
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
const typedReturnUrl = twaReturnUrl && /^[a-zA-Z][\w+.-]*:\/\//.test(twaReturnUrl)
  ? (twaReturnUrl as `${string}://${string}`)
  : undefined;
const actionsConfiguration: ActionConfiguration | undefined = enterTwa
  ? typedReturnUrl
    ? { returnStrategy: 'none', twaReturnUrl: typedReturnUrl }
    : { returnStrategy: 'none' }
  : undefined;
const providerProps = actionsConfiguration ? { actionsConfiguration } : {};

if (container) {
  ReactDOM.createRoot(container).render(
    <TonConnectUIProvider manifestUrl={manifestUrl} {...providerProps}>
      <RouterProvider router={router} />
    </TonConnectUIProvider>,
  );
}
