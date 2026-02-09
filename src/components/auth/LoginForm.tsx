'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Key, Heart, Loader } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { isAllowedEmailDomain, ALLOWED_EMAIL_DOMAIN } from '@/lib/admin-config'

type Step = 'email' | 'otp'

export default function LoginForm() {
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { signInWithOtp, verifyOtp } = useAuth()
    const { toast } = useToast()

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast('Please enter your email', 'warning')
            return
        }

        if (!isAllowedEmailDomain(email)) {
            toast(`Please use your ${ALLOWED_EMAIL_DOMAIN} email`, 'error')
            return
        }

        setIsLoading(true)

        try {
            const { error } = await signInWithOtp(email)

            if (error) throw error

            toast('Check your email for the verification code!', 'success')
            setStep('otp')
        } catch (error) {
            console.error('Login error:', error)
            toast('Failed to send code. Please try again.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!otp.trim()) {
            toast('Please enter the verification code', 'warning')
            return
        }

        setIsLoading(true)

        try {
            const { error } = await verifyOtp(email, otp)

            if (error) throw error

            toast('Welcome back! 💕', 'success')
            // Redirect will happen via auth state change
        } catch (error) {
            console.error('OTP error:', error)
            toast('Invalid code. Please try again.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
                {step === 'email' ? (
                    <motion.form
                        key="email"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleEmailSubmit}
                        className="space-y-6"
                    >
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
                                Welcome Back
                            </h1>
                            <p className="text-text-secondary">
                                Sign in with your IUB email to share confessions
                            </p>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-primary">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.name@iub.edu.bd"
                                    className="w-full pl-12 pr-4 py-3 border border-blush rounded-xl focus:outline-none focus:border-rose-primary transition-colors"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-text-secondary">
                                Only {ALLOWED_EMAIL_DOMAIN} emails are allowed
                            </p>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full gap-2"
                            isLoading={isLoading}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleOtpSubmit}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-block p-4 bg-rose-light/20 rounded-full mb-4"
                            >
                                <Key className="w-8 h-8 text-rose-primary" />
                            </motion.div>
                            <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
                                Check Your Email
                            </h1>
                            <p className="text-text-secondary">
                                We sent a 6-digit code to<br />
                                <span className="font-medium text-text-primary">{email}</span>
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-primary">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-blush rounded-xl focus:outline-none focus:border-rose-primary transition-colors font-mono"
                                disabled={isLoading}
                                maxLength={6}
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full gap-2"
                            isLoading={isLoading}
                        >
                            Verify & Login
                        </Button>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-center text-sm text-text-secondary hover:text-rose-dark transition-colors"
                        >
                            Use a different email
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    )
}
