import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

// Lazy load components for better performance
import { lazy, Suspense } from 'react'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TrackDetail = lazy(() => import('./pages/TrackDetail'))
const Practice = lazy(() => import('./pages/Practice'))
const TopicPractice = lazy(() => import('./pages/TopicPractice'))
const JamFeedback = lazy(() => import('./pages/JamFeedback'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router basename="/app">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/tracks/:trackId" element={
              <ProtectedRoute>
                <TrackDetail />
              </ProtectedRoute>
            } />

            <Route path="/tracks/:trackId/practice" element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            } />

            <Route path="/tracks/:trackId/practice/:topicId" element={
              <ProtectedRoute>
                <TopicPractice />
              </ProtectedRoute>
            } />

            <Route path="/jam-feedback" element={
              <ProtectedRoute>
                <JamFeedback />
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
