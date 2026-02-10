'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSearchParams } from 'next/navigation'

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const { signInWithGoogle } = useAuth()
    const { toast } = useToast()
    const searchParams = useSearchParams()

    // Check for error from OAuth callback
    useEffect(() => {
        const error = searchParams.get('error')
        if (error === 'auth_failed') {
            toast('Authentication failed. Please try again.', 'error')
        }
    }, [searchParams, toast])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)

        try {
            const { error } = await signInWithGoogle()

            if (error) {
                throw error
            }

            // OAuth will redirect automatically
        } catch (error) {
            console.error('Login error:', error)
            toast('Failed to sign in with Google. Please try again.', 'error')
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block mb-4"
                    >
                        <Heart className="w-12 h-12 text-rose-primary fill-rose-light" />
                    </motion.div>
                    <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
                        Welcome to IUB Confessions
                    </h1>
                    <p className="text-text-secondary">
                        Sign in with your IUB Google account to share confessions, don't worry your identity will be <b>anonymous</b>.
                    </p>
                </div>

                {/* Google Sign In Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-blush rounded-xl font-medium text-text-primary bg-blush hover:bg-blush/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-rose-primary border-t-transparent rounded-full animate-spin" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </motion.button>

                {/* Info */}
                <div className="text-center text-xs text-text-secondary space-y-2">
                    <p>
                        Only <span className="font-medium text-text-primary">@iub.edu.bd</span> emails are allowed
                    </p>
                    <p className="text-[10px]">
                        By signing in, you agree to our community guidelines.
                        <br />
                        Keep it respectful and kind 💕
                    </p>
                </div>
            </div>
        </div>
    )
}
