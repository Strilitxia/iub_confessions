'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    FileCheck,
    Flag,
    BarChart3,
    Heart,
    ChevronLeft
} from 'lucide-react'

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/moderation', icon: FileCheck, label: 'Moderation' },
    { href: '/admin/reports', icon: Flag, label: 'Reports' },
    { href: '/admin/stats', icon: BarChart3, label: 'Statistics' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-blush min-h-screen p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <Heart className="w-6 h-6 text-rose-primary fill-rose-primary" />
                <span className="font-heading font-semibold text-lg text-text-primary">
                    Admin Panel
                </span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-colors relative
                  ${isActive
                                        ? 'text-rose-primary'
                                        : 'text-text-secondary hover:bg-blush hover:text-text-primary'
                                    }
                `}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-rose-primary/10 rounded-xl"
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    />
                                )}
                                <Icon className="w-5 h-5 relative z-10" />
                                <span className="font-medium relative z-10">{item.label}</span>
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Back to site */}
            <div className="mt-8 pt-4 border-t border-blush">
                <Link href="/">
                    <motion.div
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-rose-primary transition-colors"
                        whileHover={{ x: -4 }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Site</span>
                    </motion.div>
                </Link>
            </div>
        </aside>
    )
}
