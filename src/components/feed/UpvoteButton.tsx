'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface UpvoteButtonProps {
    count: number
    hasVoted: boolean
    onVote: () => Promise<void>
    disabled?: boolean
}

export default function UpvoteButton({
    count,
    hasVoted,
    onVote,
    disabled = false
}: UpvoteButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false)
    const [localCount, setLocalCount] = useState(count)
    const [localHasVoted, setLocalHasVoted] = useState(hasVoted)

    const handleClick = async () => {
        if (disabled) return

        // Optimistic update
        setIsAnimating(true)
        setLocalHasVoted(!localHasVoted)
        setLocalCount(prev => localHasVoted ? prev - 1 : prev + 1)

        try {
            await onVote()
        } catch (error) {
            // Revert on error
            setLocalHasVoted(hasVoted)
            setLocalCount(count)
        }

        setTimeout(() => setIsAnimating(false), 300)
    }

    return (
        <motion.button
            onClick={handleClick}
            disabled={disabled}
            className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-colors duration-200
        ${localHasVoted
                    ? 'bg-rose-primary/10 text-rose-primary'
                    : 'bg-blush text-text-secondary hover:bg-rose-light/30 hover:text-rose-primary'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
        >
            <motion.div
                animate={isAnimating ? {
                    scale: [1, 1.4, 1],
                    rotate: [0, -15, 15, 0],
                } : {}}
                transition={{ duration: 0.3 }}
            >
                <Heart
                    className={`w-4 h-4 ${localHasVoted ? 'fill-rose-primary' : ''}`}
                />
            </motion.div>

            <motion.span
                key={localCount}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {localCount}
            </motion.span>
        </motion.button>
    )
}
