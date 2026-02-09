'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Heart, Clock, Flag, Users, TrendingUp } from 'lucide-react'
import StatsCard, { StatsCardSkeleton } from '@/components/admin/StatsCards'
import { createClient } from '@/lib/supabase/client'

interface Stats {
    totalConfessions: number
    pendingConfessions: number
    approvedConfessions: number
    totalReports: number
    totalUsers: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchStats = useCallback(async () => {
        try {
            // Fetch all stats in parallel
            const [confessionsRes, pendingRes, approvedRes, reportsRes, usersRes] = await Promise.all([
                supabase.from('confessions').select('id', { count: 'exact', head: true }),
                supabase.from('confessions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('confessions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
            ])

            setStats({
                totalConfessions: confessionsRes.count || 0,
                pendingConfessions: pendingRes.count || 0,
                approvedConfessions: approvedRes.count || 0,
                totalReports: reportsRes.count || 0,
                totalUsers: usersRes.count || 0,
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-1">Overview of your confession platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : stats ? (
                    <>
                        <StatsCard
                            title="Total Confessions"
                            value={stats.totalConfessions}
                            icon={Heart}
                            color="rose"
                        />
                        <StatsCard
                            title="Pending Review"
                            value={stats.pendingConfessions}
                            icon={Clock}
                            color="amber"
                        />
                        <StatsCard
                            title="Open Reports"
                            value={stats.totalReports}
                            icon={Flag}
                            color="purple"
                        />
                        <StatsCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={Users}
                            color="blue"
                        />
                    </>
                ) : null}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Confessions Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 border border-blush"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-text-primary">
                            Pending Review
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-text-primary mb-2">
                        {stats?.pendingConfessions || 0}
                    </p>
                    <p className="text-sm text-text-secondary">
                        Confessions waiting for approval
                    </p>
                    <a
                        onClick={(e) => {
                            e.preventDefault()
                            router.push("/admin/moderation?status=pending")
                        }}
                        className="inline-block mt-4 text-sm text-rose-primary hover:text-rose-dark font-medium"
                    >
                        Review now →
                    </a>
                </motion.div>

                {/* Reports Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-blush"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <Flag className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-text-primary">
                            Reports
                        </h3>
                    </div>
                    <p className="text-3xl font-bold text-text-primary mb-2">
                        {stats?.totalReports || 0}
                    </p>
                    <p className="text-sm text-text-secondary">
                        Reports needing attention
                    </p>
                    <a

                        onClick={(e) => {
                            e.preventDefault()
                            router.push('/admin/reports')
                        }}
                        className="inline-block mt-4 text-sm text-rose-primary hover:text-rose-dark font-medium"
                    >
                        View reports →
                    </a>
                </motion.div>
            </div>
        </motion.div>
    )
}
