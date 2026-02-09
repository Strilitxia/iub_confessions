'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { ConfessionWithProfile } from '@/types/database'
import { getRandomColorVariant } from '@/lib/utils/colors'

export function useConfessions() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const { user } = useAuth()
    const { toast } = useToast()

    const createConfession = useCallback(async (
        content: string,
        imageUrl?: string | null
    ) => {
        if (!user) {
            toast('Please login to post', 'warning')
            return { error: new Error('Not authenticated') }
        }

        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('confessions')
                .insert({
                    user_id: user.id,
                    content: JSON.parse(content),
                    image_url: imageUrl || null,
                    color_variant: getRandomColorVariant(),
                })
                .select()
                .single()

            if (error) throw error

            toast('Confession submitted!', 'success')
            return { data, error: null }
        } catch (error: any) {
            toast('Failed to submit', 'error')
            return { data: null, error }
        } finally {
            setIsLoading(false)
        }
    }, [supabase, user, toast])

    const fetchConfessions = useCallback(async (options?: {
        status?: string
        limit?: number
        offset?: number
    }) => {
        const { status = 'approved', limit = 20, offset = 0 } = options || {}

        try {
            let query = supabase
                .from('confessions')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (status !== 'all') {
                query = query.eq('status', status)
            }

            const { data, error } = await query

            if (error) throw error

            let processedData = data as ConfessionWithProfile[]

            // Check user votes
            if (user && processedData.length > 0) {
                const { data: votes } = await supabase
                    .from('votes')
                    .select('confession_id')
                    .eq('user_id', user.id)
                    .in('confession_id', processedData.map(c => c.id))

                const votedIds = new Set(votes?.map(v => v.confession_id) || [])
                processedData = processedData.map(c => ({
                    ...c,
                    user_has_voted: votedIds.has(c.id)
                }))
            }

            return { data: processedData, error: null }
        } catch (error: any) {
            return { data: null, error }
        }
    }, [supabase, user])

    return {
        createConfession,
        fetchConfessions,
        isLoading,
    }
}
