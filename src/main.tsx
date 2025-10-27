import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { initTWA } from './lib/twa'

initTWA()

ReactDOM.createRoot(document.getElementById('root')!).render(
  // УБРАЛ StrictMode, чтобы WebView не падал
  <RouterProvider router={router} />
)
