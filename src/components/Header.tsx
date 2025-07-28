import { Link } from 'react-router-dom'
import Logo from './Logo'

interface HeaderProps {
  showAuthButtons?: boolean
  className?: string
}

export default function Header({ showAuthButtons = true, className = '' }: HeaderProps) {
  return (
    <nav className={`w-full py-4 px-6 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>

        {showAuthButtons && (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
} 