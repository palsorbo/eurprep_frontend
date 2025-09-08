import { ReactNode } from 'react'
import AppHeader from './AppHeader'

interface AppLayoutProps {
    children: ReactNode
    title?: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title={title} />
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
                {children}
            </div>
        </div>
    )
}
