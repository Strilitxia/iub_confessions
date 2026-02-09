'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import AdminSidebar from '@/components/admin/AdminSidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, profile, isLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
                return
            }

            if (!profile?.is_admin) {
                toast('Access denied. Admin only.', 'error')
                router.push('/')
                return
            }

            setIsAuthorized(true)
        }
    }, [user, profile, isLoading, router, toast])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!isAuthorized) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-cream">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
