'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.2,
        }
    }
}

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-xl overflow-hidden`}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-blush">
                                <h2 className="text-xl font-heading font-semibold text-text-primary">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full text-text-secondary hover:bg-blush transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="px-6 py-4">
                            {children}
                        </div>

                        {/* Close button if no title */}
                        {!title && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full text-text-secondary hover:bg-blush transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
