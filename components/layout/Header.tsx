'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, PenLine, LogIn, LogOut, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: "600" })

export default function Header() {
    const { user, profile, signOut, isLoading } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.refresh()
    }

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blush"
        >
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Heart className="w-7 h-7 md:w-8 md:h-8 text-rose-primary fill-rose-primary" />
                    </motion.div>
                    <Link href="/" className="font-heading text-sm md:text-xl font-bold text-text-primary leading-tight">
                        IUB <span className="text-rose-primary">Confessions</span>
                    </Link>
                    <span className="font-heading md:text-xl text-2xl text-text-primary leading-tight">|</span>
                    <Link href="https://www.facebook.com/iub.pc" target="_blank" rel="noopener noreferrer" className={`leading-tight font-heading flex items-center gap-1 text-sm md:text-xl text-text-primary ${spaceGrotesk.className}`}>
                        <Image src="/iubpc.png" alt="Logo" width={40} height={40} />
                        An IUBPC Project
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex items-center">
                    {isLoading ? (
                        <div className="w-24 h-9 bg-blush animate-pulse rounded-xl" />
                    ) : user ? (
                        <>
                            {/* Write Confession Button */}
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 5.5, // Total 6s (0.5 + 5.5)
                                    ease: "easeInOut"
                                }}
                            >
                                <Button
                                    variant="primary"
                                    size="md" // Increased size from sm to md
                                    onClick={() => {
                                        const event = new CustomEvent('openCreateModal')
                                        window.dispatchEvent(event)
                                    }}
                                    className="gap-2 shadow-md hover:shadow-lg"
                                >
                                    <span className="md:inline md:font-medium md:text-base text-[10px]">Write Post</span>
                                </Button>
                            </motion.div>

                            {/* Admin Link */}
                            {profile?.is_admin && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}

                            {/* Sign Out */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-2 text-text-secondary"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="primary" size="sm" className="gap-2">
                                <LogIn className="w-4 h-4" />
                                <span>Login</span>
                            </Button>
                        </Link>
                    )}
                </nav>
            </div>
        </motion.header>
    )
}
