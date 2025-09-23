import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { LogOut } from 'lucide-react'
import Logo from './Logo'

interface AppHeaderProps {
    title?: string
}

export default function AppHeader({ title }: AppHeaderProps) {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/', { replace: true, state: { from: 'logout' } })
        } catch (error) {
            navigate('/', { replace: true, state: { from: 'logout_error' } })
        }
    }

    const handleLogoClick = () => {
        navigate('/dashboard')
    }


    // Generate breadcrumbs based on current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean)
        const breadcrumbs = []

        // Always start with Dashboard
        breadcrumbs.push({
            label: 'Dashboard',
            path: '/dashboard',
            isActive: location.pathname === '/dashboard'
        })

        // Add other segments
        if (pathSegments.includes('sbi-po')) {
            if (pathSegments.length === 1) {
                // /sbi-po
                breadcrumbs.push({
                    label: 'SBI PO',
                    path: '/sbi-po',
                    isActive: true
                })
            } else if (pathSegments.includes('interview')) {
                // /sbi-po/interview/1
                breadcrumbs.push({
                    label: 'SBI PO',
                    path: '/sbi-po',
                    isActive: false
                })
                const setId = pathSegments[pathSegments.length - 1]
                breadcrumbs.push({
                    label: `Interview Set ${setId}`,
                    path: location.pathname,
                    isActive: true
                })
            }
        }

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center space-x-4">
                        {/* Logo */}
                        <button
                            onClick={handleLogoClick}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        >
                            <Logo size="lg" />
                        </button>

                        {/* Page Title */}
                        {title && (
                            <div className="hidden md:block">
                                <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                            </div>
                        )}
                    </div>

                    {/* Center - Breadcrumbs */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={breadcrumb.path} className="flex items-center">
                                {index > 0 && (
                                    <span className="text-slate-400 mx-2">/</span>
                                )}
                                {breadcrumb.isActive ? (
                                    <span className="text-slate-900 font-medium">
                                        {breadcrumb.label}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => navigate(breadcrumb.path)}
                                        className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                    >
                                        {breadcrumb.label}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right side - User info and logout */}
                    <div className="flex items-center space-x-4">
                        <span className="text-slate-700 text-sm">
                            Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email || 'User'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
