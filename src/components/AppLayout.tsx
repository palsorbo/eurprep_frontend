import type { ReactNode } from 'react'
import AppHeader from './AppHeader'

interface AppLayoutProps {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader />
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
                {children}
            </div>
        </div>
    )
}
