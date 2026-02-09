'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import ConfessionFeed from '@/components/feed/ConfessionFeed'

export default function HomePage() {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-rose-light/20 to-transparent py-16">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-10 left-10 text-rose-light/30"
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        <Heart className="w-16 h-16 fill-current" />
                    </motion.div>
                    <motion.div
                        className="absolute top-20 right-20 text-rose-light/20"
                        animate={{
                            y: [0, 10, 0],
                            rotate: [0, -10, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                    >
                        <Heart className="w-24 h-24 fill-current" />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-10 right-10 text-rose-light/25"
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 15, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                        <Sparkles className="w-12 h-12" />
                    </motion.div>
                </div>

                {/* Hero Content */}
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-6"
                        >
                            <Heart className="w-16 h-16 text-rose-primary fill-rose-primary mx-auto" />
                        </motion.div>

                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
                            Share Your <span className="text-rose-primary">Heart</span>
                        </h1>

                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
                            Anonymous confessions from the IUB community.
                            Express your feelings, share your stories, and connect with others.
                        </p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center justify-center gap-2 text-sm text-text-secondary"
                        >
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>100% Anonymous</span>
                            <span className="mx-2">•</span>
                            <span>Only for @iub.edu.bd</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feed Section */}
            <section className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                <ConfessionFeed />
            </section>
        </div>
    )
}
