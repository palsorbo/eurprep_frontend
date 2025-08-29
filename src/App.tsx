import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import ProtectedRoute from './components/ProtectedRoute'

import './index.css'

// Lazy load components for better performance
import { lazy, Suspense } from 'react'

// App components
const Login = lazy(() => import('./pages/Login'))
const AuthCallback = lazy(() => import('./components/AuthCallback'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Default landing page - Login */}
            <Route path="/" element={<Login />} />
            
            {/* Auth callback */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Dashboard - protected route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
