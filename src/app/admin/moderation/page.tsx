'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileCheck, Filter } from 'lucide-react'
import ModerationTable from '@/components/admin/ModerationTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Confession, ConfessionStatus } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

const STATUS_OPTIONS: (ConfessionStatus | 'all')[] = ['all', 'pending', 'approved', 'hidden', 'removed']

export default function ModerationPage() {
    const [confessions, setConfessions] = useState<Confession[]>([])
    const [statusFilter, setStatusFilter] = useState<ConfessionStatus | 'all'>('pending')
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchConfessions = useCallback(async () => {
        setIsLoading(true)
        try {
            let query = supabase
                .from('confessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error

            setConfessions(data || [])
        } catch (error) {
            console.error('Error fetching confessions:', error)
        } finally {
            setIsLoading(false)
        }
    }, [supabase, statusFilter])

    useEffect(() => {
        fetchConfessions()
    }, [fetchConfessions])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-text-primary flex items-center gap-3">
                        <FileCheck className="w-8 h-8 text-rose-primary" />
                        Moderation
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Review and manage confessions
                    </p>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-text-secondary" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ConfessionStatus | 'all')}
                        className="px-4 py-2 border border-blush rounded-xl bg-white focus:outline-none focus:border-rose-primary"
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <ModerationTable confessions={confessions} onUpdate={fetchConfessions} />
            )}
        </motion.div>
    )
}
