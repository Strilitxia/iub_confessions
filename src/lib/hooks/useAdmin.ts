'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { ConfessionStatus, ReportStatus } from '@/types/database'

export function useAdmin() {
    const supabase = createClient()
    const { profile } = useAuth()
    const { toast } = useToast()

    const isAdmin = profile?.is_admin || false

    const updateConfessionStatus = useCallback(async (
        confessionId: string,
        status: ConfessionStatus
    ) => {
        if (!isAdmin) {
            toast('Admin access required', 'error')
            return { error: new Error('Not authorized') }
        }

        try {
            const updateData: any = { status }
            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('confessions')
                .update(updateData)
                .eq('id', confessionId)

            if (error) throw error

            toast(`Confession ${status}`, 'success')
            return { error: null }
        } catch (error: any) {
            toast('Failed to update', 'error')
            return { error }
        }
    }, [supabase, isAdmin, toast])

    const updateReportStatus = useCallback(async (
        reportId: string,
        status: ReportStatus
    ) => {
        if (!isAdmin) {
            toast('Admin access required', 'error')
            return { error: new Error('Not authorized') }
        }

        try {
            const { error } = await supabase
                .from('reports')
                .update({ status })
                .eq('id', reportId)

            if (error) throw error

            toast(`Report ${status}`, 'success')
            return { error: null }
        } catch (error: any) {
            toast('Failed to update report', 'error')
            return { error }
        }
    }, [supabase, isAdmin, toast])

    const bulkUpdateConfessions = useCallback(async (
        confessionIds: string[],
        status: ConfessionStatus
    ) => {
        if (!isAdmin) {
            toast('Admin access required', 'error')
            return { error: new Error('Not authorized') }
        }

        try {
            const updateData: any = { status }
            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('confessions')
                .update(updateData)
                .in('id', confessionIds)

            if (error) throw error

            toast(`${confessionIds.length} confessions ${status}`, 'success')
            return { error: null }
        } catch (error: any) {
            toast('Failed to update', 'error')
            return { error }
        }
    }, [supabase, isAdmin, toast])

    return {
        isAdmin,
        updateConfessionStatus,
        updateReportStatus,
        bulkUpdateConfessions,
    }
}
