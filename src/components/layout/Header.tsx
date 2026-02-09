'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, PenLine, LogIn, LogOut, Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

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
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Heart className="w-8 h-8 text-rose-primary fill-rose-primary" />
                    </motion.div>
                    <span className="font-heading text-xl font-semibold text-text-primary">
                        IUB <span className="text-rose-primary">Confessions</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-3">
                    {isLoading ? (
                        <div className="w-24 h-9 bg-blush animate-pulse rounded-xl" />
                    ) : user ? (
                        <>
                            {/* Write Confession Button */}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    const event = new CustomEvent('openCreateModal')
                                    window.dispatchEvent(event)
                                }}
                                className="gap-2"
                            >
                                <PenLine className="w-4 h-4" />
                                <span className="hidden sm:inline">Write</span>
                            </Button>

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
