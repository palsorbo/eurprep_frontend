import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'

// Initialize PostHog
// !TODO move to settings key later
posthog.init('phc_yrKFee9D3k2wr4fSpAediSO8VK5AM2zKRekya7i97nz', {
  api_host: 'https://app.posthog.com',
  // Enable automatic pageview tracking
  capture_pageview: true,
  // Capture page leave events
  capture_pageleave: true,
  // Persist user data across sessions
  persistence: 'localStorage+cookie',
  // Configure cookie domain for cross-subdomain tracking
  cookie_domain: '.eurprep.com',
  // Disable tracking in development, enable only in production
  loaded: (posthog: any) => {
    if (process.env.NODE_ENV !== 'production') {
      posthog.opt_out_capturing()
      console.log('PostHog tracking disabled in development')
    } else {
      console.log('PostHog tracking active in production')
    }
  }
} as any)


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
