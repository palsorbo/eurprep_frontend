'use client'

import { AuthProvider } from '@/lib/auth-context'

export default function ClientAuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return <AuthProvider>{children}</AuthProvider>
} 