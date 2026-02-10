'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedContainerProps {
    children: ReactNode
    className?: string
    delay?: number
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            damping: 20,
            stiffness: 100,
        },
    },
}

export default function AnimatedContainer({
    children,
    className = '',
    delay = 0
}: AnimatedContainerProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedItem({
    children,
    className = ''
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    )
}

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    )
}
