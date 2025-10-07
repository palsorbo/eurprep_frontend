import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { LogOut, Mail, Copy, Check, User, Settings, ChevronDown } from 'lucide-react'
import Logo from './Logo'
import { useState, useEffect, useRef } from 'react'

interface AppHeaderProps {
    title?: string
}

export default function AppHeader({ title }: AppHeaderProps) {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showEmailTooltip, setShowEmailTooltip] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const userMenuRef = useRef<HTMLDivElement>(null)

    const emailAddress = 'hello@eurprep.com'

    const getMotivationalMessage = (firstName: string) => {
        const messages = [
            `Great work, ${firstName}! Let's build more confidence`,
            `${firstName}, you're making excellent progress!`,
            `Welcome back, ${firstName}! Ready for more practice?`,
            `${firstName}, your interview skills are improving!`,
            `Keep it up, ${firstName}! Every session counts`
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }

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

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(emailAddress)
            setCopySuccess(true)
            setTimeout(() => {
                setCopySuccess(false)
                setShowEmailTooltip(false)
            }, 2000)
        } catch (error) {
            console.error('Failed to copy email:', error)
        }
    }

    // Handle clicking outside tooltip and Escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setShowEmailTooltip(false)
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowEmailTooltip(false)
                setShowUserMenu(false)
            }
        }

        if (showEmailTooltip || showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscapeKey)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [showEmailTooltip, showUserMenu])


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

                    {/* Right side - User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">
                                {getMotivationalMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Candidate')}
                            </span>
                            <span className="sm:hidden text-sm">
                                {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-medium text-slate-900">
                                        {user?.user_metadata?.full_name || 'User'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        navigate('/profile')
                                        setShowUserMenu(false)
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Profile Settings</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowEmailTooltip(!showEmailTooltip)
                                        setShowUserMenu(false)
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>Contact Support</span>
                                </button>

                                <div className="border-t border-slate-100 mt-2 pt-2">
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setShowUserMenu(false)
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Email Tooltip (shown from dropdown) */}
                        {showEmailTooltip && (
                            <div ref={tooltipRef} className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-slate-600" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">Contact Email</div>
                                            <div className="text-sm text-slate-600 font-mono">{emailAddress}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopyEmail}
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors duration-200"
                                    >
                                        {copySuccess ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span className="text-sm">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
