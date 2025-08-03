import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

// Lazy load components for better performance
import { lazy, Suspense } from 'react'

// Landing page components
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// App components
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TrackDetail = lazy(() => import('./pages/TrackDetail'))
const Practice = lazy(() => import('./pages/Practice'))
const TopicPractice = lazy(() => import('./pages/TopicPractice'))
const JamFeedback = lazy(() => import('./pages/JamFeedback'))
const RecordingsPage = lazy(() => import('./pages/RecordingsPage'))

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
            {/* Public landing pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* App routes */}
            <Route path="/app/login" element={<Login />} />
            <Route path="/app" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/tracks/:trackId" element={
              <ProtectedRoute>
                <TrackDetail />
              </ProtectedRoute>
            } />
            <Route path="/app/tracks/:trackId/practice" element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            } />
            <Route path="/app/tracks/:trackId/practice/:topicId" element={
              <ProtectedRoute>
                <TopicPractice />
              </ProtectedRoute>
            } />
            <Route path="/app/jam-feedback/:recordingId?" element={
              <ProtectedRoute>
                <JamFeedback />
              </ProtectedRoute>
            } />
            <Route path="/app/recordings" element={
              <ProtectedRoute>
                <RecordingsPage />
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
