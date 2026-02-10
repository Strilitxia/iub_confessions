'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/components/auth/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LoginPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    // Redirect if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            router.push('/')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (user) return null

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 text-rose-light/10"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 3, repeat: Infinity }
                    }}
                >
                    <Heart className="w-64 h-64 fill-current" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/4 right-1/4 text-rose-light/10"
                    animate={{
                        rotate: -360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 4, repeat: Infinity, delay: 1 }
                    }}
                >
                    <Heart className="w-48 h-48 fill-current" />
                </motion.div>
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-blush">
                    <LoginForm />
                </div>
            </motion.div>
        </div>
    )
}
