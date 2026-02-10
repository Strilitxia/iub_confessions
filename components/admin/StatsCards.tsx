'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: 'rose' | 'green' | 'blue' | 'amber' | 'purple'
    change?: {
        value: number
        label: string
    }
}

const colorClasses = {
    rose: {
        bg: 'bg-rose-primary/10',
        icon: 'text-rose-primary',
        border: 'border-rose-light/30',
    },
    green: {
        bg: 'bg-green-500/10',
        icon: 'text-green-500',
        border: 'border-green-200/30',
    },
    blue: {
        bg: 'bg-blue-500/10',
        icon: 'text-blue-500',
        border: 'border-blue-200/30',
    },
    amber: {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-500',
        border: 'border-amber-200/30',
    },
    purple: {
        bg: 'bg-purple-500/10',
        icon: 'text-purple-500',
        border: 'border-purple-200/30',
    },
}

export default function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
    const colors = colorClasses[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-2xl p-6 border ${colors.border} shadow-sm`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-text-secondary mb-1">{title}</p>
                    <p className="text-3xl font-bold text-text-primary">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 ${change.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </motion.div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-blush shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-blush rounded" />
                    <div className="h-8 w-16 bg-blush rounded" />
                </div>
                <div className="w-12 h-12 bg-blush rounded-xl" />
            </div>
        </div>
    )
}
