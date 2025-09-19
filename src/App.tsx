import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { PaymentProvider } from './lib/payment-context'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'


// Lazy load components for better performance
import { lazy, Suspense } from 'react'

// App components
const AuthRedirect = lazy(() => import('./components/AuthRedirect'))
const AuthCallback = lazy(() => import('./components/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SBIPO = lazy(() => import('./pages/SBIPO'))
const StreamingInterviewWrapper = lazy(() => import('./pages/StreamingInterviewWrapper'))
const InterviewResults = lazy(() => import('./pages/InterviewResults'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Default landing page - Auth redirect (shows login if not authenticated, redirects to dashboard if authenticated) */}
              <Route path="/" element={<AuthRedirect />} />

              {/* Auth callback */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Dashboard - protected route */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* SBI PO - protected route */}
              <Route path="/sbi-po" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SBIPO />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* SBI PO Interview - protected route */}
              <Route path="/sbi-po/interview/:setId" element={
                <ProtectedRoute>
                  <AppLayout>
                    <StreamingInterviewWrapper />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Interview Results - protected route */}
              <Route path="/results/:feedbackId" element={
                <ProtectedRoute>
                  <AppLayout>
                    <InterviewResults />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Interview Results - sessionId flow (from interview completion) */}
              <Route path="/results" element={
                <ProtectedRoute>
                  <AppLayout>
                    <InterviewResults />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </PaymentProvider>
    </AuthProvider>
  )
}

export default App
