import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import {
    User,
    LogOut,
    Settings,
    Menu,
    X,
    Home,
    ChevronDown
} from 'lucide-react'
import Logo from './Logo'

interface AuthenticatedHeaderProps {
    showBreadcrumbs?: boolean
    breadcrumbItems?: Array<{
        label: string
        href?: string
        icon?: React.ComponentType<{ className?: string }>
    }>
    pageTitle?: string
    className?: string
    // Track-specific props
    trackIcon?: React.ComponentType<{ className?: string }>
    trackColor?: string
    trackBgColor?: string
}

export default function AuthenticatedHeader({
    showBreadcrumbs = false,
    breadcrumbItems = [],
    pageTitle,
    className = '',
    trackIcon,
    trackColor,
    trackBgColor
}: AuthenticatedHeaderProps) {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen)
    }

    const closeMenus = () => {
        setIsMobileMenuOpen(false)
        setIsUserMenuOpen(false)
    }

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isUserMenuOpen])

    return (
        <header className={`bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo and Navigation */}
                    <div className="flex items-center space-x-6">
                        <Link to="/app" className="hover:opacity-80 transition-opacity">
                            <Logo size="md" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                to="/app"
                                className="text-slate-700 hover:text-slate-900 transition-colors font-medium flex items-center space-x-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>

                        </nav>
                    </div>

                    {/* Center - Page Title and Breadcrumbs (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4 flex-1 justify-center">
                        {showBreadcrumbs && breadcrumbItems.length > 0 && (
                            <nav className="flex items-center space-x-2 text-sm text-gray-600">
                                {breadcrumbItems.map((item, index) => {
                                    const IconComponent = item.icon
                                    const isLast = index === breadcrumbItems.length - 1

                                    return (
                                        <div key={index} className="flex items-center space-x-2">
                                            {index > 0 && (
                                                <span className="text-gray-400">/</span>
                                            )}
                                            {isLast ? (
                                                <span className="text-gray-900 font-medium flex items-center space-x-1">
                                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                                    <span>{item.label}</span>
                                                </span>
                                            ) : (
                                                <Link
                                                    to={item.href || '#'}
                                                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                                                >
                                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                                    <span>{item.label}</span>
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}
                            </nav>
                        )}

                        {pageTitle && !showBreadcrumbs && (
                            <div className="flex items-center space-x-3">
                                {trackIcon && trackColor && trackBgColor && (
                                    <div className={`w-8 h-8 ${trackBgColor} rounded-lg flex items-center justify-center`}>
                                        {React.createElement(trackIcon, { className: `w-4 h-4 ${trackColor}` })}
                                    </div>
                                )}
                                <h1 className="text-xl font-semibold text-slate-900">
                                    {pageTitle}
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* Right side - User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
                            >
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="hidden md:block text-sm font-medium">
                                    {user?.user_metadata?.full_name || 'User'}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900">
                                            {user?.user_metadata?.full_name || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={closeMenus}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        onClick={closeMenus}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 py-4">
                        {/* Mobile Page Title and Breadcrumbs */}
                        {pageTitle && (
                            <div className="mb-4 px-2">
                                <div className="flex items-center space-x-3 mb-2">
                                    {trackIcon && trackColor && trackBgColor && (
                                        <div className={`w-8 h-8 ${trackBgColor} rounded-lg flex items-center justify-center`}>
                                            {React.createElement(trackIcon, { className: `w-4 h-4 ${trackColor}` })}
                                        </div>
                                    )}
                                    <h1 className="text-lg font-semibold text-slate-900">
                                        {pageTitle}
                                    </h1>
                                </div>
                                {showBreadcrumbs && breadcrumbItems.length > 0 && (
                                    <nav className="flex items-center space-x-2 text-xs text-gray-600 overflow-x-auto">
                                        {breadcrumbItems.map((item, index) => {
                                            const IconComponent = item.icon
                                            const isLast = index === breadcrumbItems.length - 1

                                            return (
                                                <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                                                    {index > 0 && (
                                                        <span className="text-gray-400">/</span>
                                                    )}
                                                    {isLast ? (
                                                        <span className="text-gray-900 font-medium flex items-center space-x-1">
                                                            {IconComponent && <IconComponent className="w-3 h-3" />}
                                                            <span className="truncate max-w-20">{item.label}</span>
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            to={item.href || '#'}
                                                            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                                                            onClick={closeMenus}
                                                        >
                                                            {IconComponent && <IconComponent className="w-3 h-3" />}
                                                            <span className="truncate max-w-16">{item.label}</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </nav>
                                )}
                            </div>
                        )}

                        <nav className="space-y-2">
                            <Link
                                to="/app"
                                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                onClick={closeMenus}
                            >
                                <Home className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>


                            <div className="border-t border-slate-200 pt-2 mt-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                    onClick={closeMenus}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                    onClick={closeMenus}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg w-full text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
} 