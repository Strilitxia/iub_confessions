'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-t border-blush py-8 mt-auto"
        >
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Heart className="w-5 h-5 text-rose-primary fill-rose-light" />
                        <span className="font-heading text-lg">
                            IUB <span className="text-rose-primary">Confessions</span>
                        </span>
                    </div>

                    {/* Info */}
                    <p className="text-sm text-text-secondary text-center">
                        Share your feelings anonymously with the IUB community
                    </p>

                    {/* Copyright */}
                    <p className="text-sm text-text-secondary">
                        © {currentYear} Made with{' '}
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block text-rose-primary"
                        >
                            ❤️
                        </motion.span>{' '}
                        for IUB
                    </p>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-text-secondary/70 text-center mt-6">
                    This is an anonymous platform. Please be respectful and follow community guidelines.
                    Inappropriate content will be removed.
                </p>
            </div>
        </motion.footer>
    )
}
