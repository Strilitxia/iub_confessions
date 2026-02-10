'use client'

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConfessionFeed from '@/components/feed/ConfessionFeed'
import { useAuth } from '@/components/auth/AuthProvider'

export default function HomePage() {
    const { user } = useAuth()
    const router = useRouter()

    const handleConfessClick = () => {
        if (user) {
            window.dispatchEvent(new Event('openCreateModal'))
        } else {
            router.push('/login')
        }
    }
    return (
        <div className="relative">
            {/* Hero Section - Only for guests */}
            {!user && (
                <section className="relative overflow-hidden bg-gradient-to-b from-rose-light/20 to-transparent py-8 md:py-12">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className="absolute top-4 left-4 text-rose-light/30"
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 10, 0],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        >
                            <Heart className="w-10 h-10 fill-current" />
                        </motion.div>
                        <motion.div
                            className="absolute top-8 right-8 text-rose-light/20"
                            animate={{
                                y: [0, 10, 0],
                                rotate: [0, -10, 0],
                            }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        >
                            <Heart className="w-16 h-16 fill-current" />
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
                                className="inline-block mb-3"
                            >
                                <Heart className="w-10 h-10 md:w-12 md:h-12 text-rose-primary fill-rose-primary mx-auto" />
                            </motion.div>

                            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3">
                                Share Your <span className="text-rose-primary">Heart</span>
                            </h1>

                            <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto mb-6 leading-relaxed">
                                Anonymous confessions from the IUB community.
                                <br className="hidden md:block" /> Express your feelings, share your stories, and connect.
                            </p>

                            <div className="flex flex-col items-center gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={handleConfessClick}
                                    className="px-8 py-3 bg-gradient-to-r from-rose-primary to-rose-dark text-white rounded-full font-semibold shadow-lg shadow-rose-primary/30 hover:shadow-xl hover:shadow-rose-primary/40 transition-all flex items-center gap-2 group"
                                >
                                    <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                                    Confess Your Feelings
                                </motion.button>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center justify-center gap-2 text-xs md:text-sm text-text-secondary/80"
                                >
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span>100% Anonymous</span>
                                    <span className="mx-2">•</span>
                                    <span>Only for @iub.edu.bd</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Feed Section */}
            <section className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                <ConfessionFeed />
            </section>
        </div>
    )
}
