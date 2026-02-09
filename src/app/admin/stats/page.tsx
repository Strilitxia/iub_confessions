'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Heart, Users, TrendingUp, Calendar } from 'lucide-react'
import StatsCard, { StatsCardSkeleton } from '@/components/admin/StatsCards'
import { createClient } from '@/lib/supabase/client'

interface ExtendedStats {
    totalConfessions: number
    totalApproved: number
    totalUsers: number
    totalVotes: number
    recentConfessions: number
    recentUsers: number
}

export default function StatsPage() {
    const [stats, setStats] = useState<ExtendedStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchStats = useCallback(async () => {
        try {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const [
                confessionsRes,
                approvedRes,
                usersRes,
                votesRes,
                recentConfessionsRes,
                recentUsersRes,
            ] = await Promise.all([
                supabase.from('confessions').select('id', { count: 'exact', head: true }),
                supabase.from('confessions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('votes').select('id', { count: 'exact', head: true }),
                supabase.from('confessions').select('id', { count: 'exact', head: true })
                    .gte('created_at', sevenDaysAgo.toISOString()),
                supabase.from('profiles').select('id', { count: 'exact', head: true })
                    .gte('created_at', sevenDaysAgo.toISOString()),
            ])

            setStats({
                totalConfessions: confessionsRes.count || 0,
                totalApproved: approvedRes.count || 0,
                totalUsers: usersRes.count || 0,
                totalVotes: votesRes.count || 0,
                recentConfessions: recentConfessionsRes.count || 0,
                recentUsers: recentUsersRes.count || 0,
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
                <h1 className="font-heading text-3xl font-bold text-text-primary flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-rose-primary" />
                    Statistics
                </h1>
                <p className="text-text-secondary mt-1">
                    Platform analytics and metrics
                </p>
            </div>

            {/* All Time Stats */}
            <div>
                <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
                    All Time
                </h2>
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
                                title="Approved"
                                value={stats.totalApproved}
                                icon={TrendingUp}
                                color="green"
                            />
                            <StatsCard
                                title="Total Users"
                                value={stats.totalUsers}
                                icon={Users}
                                color="blue"
                            />
                            <StatsCard
                                title="Total Votes"
                                value={stats.totalVotes}
                                icon={Heart}
                                color="purple"
                            />
                        </>
                    ) : null}
                </div>
            </div>

            {/* Last 7 Days */}
            <div>
                <h2 className="font-heading text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-text-secondary" />
                    Last 7 Days
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        <>
                            <StatsCardSkeleton />
                            <StatsCardSkeleton />
                        </>
                    ) : stats ? (
                        <>
                            <StatsCard
                                title="New Confessions"
                                value={stats.recentConfessions}
                                icon={Heart}
                                color="rose"
                            />
                            <StatsCard
                                title="New Users"
                                value={stats.recentUsers}
                                icon={Users}
                                color="blue"
                            />
                        </>
                    ) : null}
                </div>
            </div>

            {/* Approval Rate */}
            {stats && stats.totalConfessions > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-blush"
                >
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">
                        Approval Rate
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-blush rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-rose-primary to-rose-light"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.round((stats.totalApproved / stats.totalConfessions) * 100)}%`
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="text-2xl font-bold text-rose-primary">
                            {Math.round((stats.totalApproved / stats.totalConfessions) * 100)}%
                        </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                        {stats.totalApproved} of {stats.totalConfessions} confessions approved
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
