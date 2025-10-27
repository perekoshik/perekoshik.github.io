import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { initTWA } from './lib/twa'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { TONCONNECT_MANIFEST_URL } from './lib/tonconnect'

initTWA()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider
    manifestUrl={TONCONNECT_MANIFEST_URL}
    uiPreferences={{ theme: 'SYSTEM' }}
  >
    <RouterProvider router={router} />
  </TonConnectUIProvider>
)
