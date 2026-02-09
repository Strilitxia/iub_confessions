'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flag, AlertTriangle } from 'lucide-react'
import ReportsList from '@/components/admin/ReportsList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ReportWithConfession } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportWithConfession[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchReports = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          confessions (*)
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error

            setReports(data || [])
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold text-text-primary flex items-center gap-3">
                    <Flag className="w-8 h-8 text-rose-primary" />
                    Reports
                </h1>
                <p className="text-text-secondary mt-1">
                    Review and resolve user reports
                </p>
            </div>

            {/* Stats */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800">
                    <strong>{reports.length}</strong> pending {reports.length === 1 ? 'report' : 'reports'} to review
                </span>
            </div>

            {/* Reports List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <ReportsList reports={reports} onUpdate={fetchReports} />
            )}
        </motion.div>
    )
}
