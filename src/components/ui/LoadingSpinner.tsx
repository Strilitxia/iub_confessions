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
        <div className="bg-white rounded-[2rem] p-8 border-2 border-blush/50 shadow-sm animate-pulse">
            <div className="space-y-4">
                <div className="h-6 bg-blush rounded-xl w-3/4" />
                <div className="space-y-2">
                    <div className="h-4 bg-blush/70 rounded-lg w-full" />
                    <div className="h-4 bg-blush/70 rounded-lg w-full" />
                    <div className="h-4 bg-blush/70 rounded-lg w-2/3" />
                </div>
            </div>

            {/* Optional Image Placeholder */}
            <div className="mt-6 aspect-square bg-blush/30 rounded-2xl w-full" />

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-blush/30">
                <div className="h-4 w-24 bg-blush/50 rounded-full" />
                <div className="flex gap-2">
                    <div className="h-10 w-16 bg-blush/50 rounded-full" />
                    <div className="h-10 w-10 bg-blush/50 rounded-full" />
                </div>
            </div>
        </div>
    )
}
