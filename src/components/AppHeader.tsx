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

        // Handle profile path
        if (pathSegments[0] === 'profile') {
            breadcrumbs.push({
                label: 'Profile',
                path: '/profile',
                isActive: true
            })
        }

        // Handle results path
        if (pathSegments[0] === 'results') {
            breadcrumbs.push({
                label: 'Results',
                path: '/results',
                isActive: true
            })
        }

        // Handle exam type paths (sbi-po or ibps-po)
        const examType = pathSegments.find(segment => segment === 'sbi-po' || segment === 'ibps-po')

        if (examType) {
            // Convert ibps-po to IBPS PO, sbi-po to SBI PO
            const examLabel = examType.toUpperCase().replace('-', ' ')
            const examPath = `/${examType}`

            if (pathSegments.length === 1) {
                // /sbi-po or /ibps-po
                breadcrumbs.push({
                    label: examLabel,
                    path: examPath,
                    isActive: true
                })
            } else if (pathSegments.includes('interview')) {
                // /sbi-po/interview/1 or /ibps-po/interview/1
                breadcrumbs.push({
                    label: examLabel,
                    path: examPath,
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
                    <div className="flex items-center space-x-6">
                        {/* Logo */}
                        <button
                            onClick={handleLogoClick}
                            className="flex items-center space-x-2 p-2 hover:opacity-80 hover:bg-slate-50 rounded-lg transition-all duration-200"
                        >
                            <Logo size="lg" />
                        </button>

                        {/* Page Title */}
                        {/* {title && (
                            <div className="hidden md:block">
                                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
                            </div>
                        )} */}
                    </div>

                    {/* Center - Breadcrumbs */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={breadcrumb.path} className="flex items-center">
                                {index > 0 && (
                                    <span className="text-slate-400 mx-3 text-sm">/</span>
                                )}
                                {breadcrumb.isActive ? (
                                    <span className="text-slate-900 font-semibold px-3 py-1.5 bg-slate-100 rounded-md">
                                        {breadcrumb.label}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => navigate(breadcrumb.path)}
                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2 py-1 rounded transition-all duration-200"
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
                            className="flex items-center space-x-3 px-4 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm"
                        >
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <span className="hidden sm:inline text-sm font-medium">
                                {getMotivationalMessage(user?.user_metadata?.full_name?.split(' ')[0] || 'Candidate')}
                            </span>
                            <span className="sm:hidden text-sm font-medium">
                                {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                            </span>
                            <ChevronDown className="w-4 h-4 opacity-60" />
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 z-50 py-3 backdrop-blur-sm">
                                <div className="px-5 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {user?.user_metadata?.full_name || 'Candidate'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        navigate('/profile')
                                        setShowUserMenu(false)
                                    }}
                                    className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 rounded-lg"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-medium">Profile Settings</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowEmailTooltip(!showEmailTooltip)
                                        setShowUserMenu(false)
                                    }}
                                    className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 rounded-lg"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span className="font-medium">Contact Support</span>
                                </button>

                                <div className="border-t border-slate-100 mt-3 pt-3 mx-2">
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setShowUserMenu(false)
                                        }}
                                        className="w-full flex items-center space-x-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Email Tooltip (shown from dropdown) */}
                        {showEmailTooltip && (
                            <div ref={tooltipRef} className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 z-50 p-5 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {/* <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-slate-600" />
                                        </div> */}
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">Contact Email</div>
                                            <div className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded mt-1">{emailAddress}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopyEmail}
                                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 hover:shadow-sm font-medium"
                                    >
                                        {copySuccess ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                {/* <span className="text-sm text-green-600">Copied!</span> */}
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
