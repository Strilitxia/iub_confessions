'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    color?: 'rose' | 'white' | 'gray'
}

export default function LoadingSpinner({ size = 'md', color = 'rose' }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    const colors = {
        rose: 'text-rose-primary',
        white: 'text-white',
        gray: 'text-gray-400',
    }

    return (
        <div className="flex items-center justify-center">
            <motion.svg
                className={`${sizes[size]} ${colors[color]}`}
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </motion.svg>
        </div>
    )
}

// Full page loading state
export function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-cream">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <motion.p
                    className="text-text-secondary font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    )
}

// Skeleton loader for cards
export function ConfessionCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blush rounded-full" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-blush rounded w-1/4" />
                    <div className="space-y-2">
                        <div className="h-3 bg-blush rounded w-full" />
                        <div className="h-3 bg-blush rounded w-3/4" />
                        <div className="h-3 bg-blush rounded w-1/2" />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blush">
                <div className="h-8 w-16 bg-blush rounded" />
                <div className="h-8 w-16 bg-blush rounded" />
            </div>
        </div>
    )
}
