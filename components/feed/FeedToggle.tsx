'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock } from 'lucide-react'

type FeedMode = 'featured' | 'latest'

interface FeedToggleProps {
    mode: FeedMode
    onChange: (mode: FeedMode) => void
}

export default function FeedToggle({ mode, onChange }: FeedToggleProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-blush rounded-xl">
            <ToggleButton
                isActive={mode === 'featured'}
                onClick={() => onChange('featured')}
                icon={<TrendingUp className="w-4 h-4" />}
                label="Featured"
            />
            <ToggleButton
                isActive={mode === 'latest'}
                onClick={() => onChange('latest')}
                icon={<Clock className="w-4 h-4" />}
                label="Latest"
            />
        </div>
    )
}

function ToggleButton({
    isActive,
    onClick,
    icon,
    label
}: {
    isActive: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-colors duration-200
        ${isActive
                    ? 'text-rose-primary'
                    : 'text-text-secondary hover:text-rose-dark'
                }
      `}
        >
            {isActive && (
                <motion.div
                    layoutId="feedToggle"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
            )}
            <span className="relative flex items-center gap-2">
                {icon}
                {label}
            </span>
        </button>
    )
}
