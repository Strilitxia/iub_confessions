'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'

export function useVotes() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const { user } = useAuth()
    const { toast } = useToast()

    const toggleVote = useCallback(async (confessionId: string, hasVoted: boolean) => {
        if (!user) {
            toast('Please login to vote', 'warning')
            return { success: false }
        }

        setIsLoading(true)
        try {
            if (hasVoted) {
                // Remove vote
                const { error } = await supabase
                    .from('votes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('confession_id', confessionId)

                if (error) throw error
            } else {
                // Add vote
                const { error } = await supabase
                    .from('votes')
                    .insert({
                        user_id: user.id,
                        confession_id: confessionId,
                    })

                if (error) throw error
            }

            return { success: true }
        } catch (error: any) {
            console.error('Vote error:', error)
            toast('Failed to vote', 'error')
            return { success: false }
        } finally {
            setIsLoading(false)
        }
    }, [supabase, user, toast])

    const checkVoted = useCallback(async (confessionIds: string[]) => {
        if (!user || confessionIds.length === 0) {
            return new Set<string>()
        }

        try {
            const { data } = await supabase
                .from('votes')
                .select('confession_id')
                .eq('user_id', user.id)
                .in('confession_id', confessionIds)

            return new Set(data?.map(v => v.confession_id) || [])
        } catch {
            return new Set<string>()
        }
    }, [supabase, user])

    return {
        toggleVote,
        checkVoted,
        isLoading,
    }
}
