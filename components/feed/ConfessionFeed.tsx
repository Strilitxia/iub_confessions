'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RefreshCw, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import ConfessionCard from './ConfessionCard'
import FeedToggle from './FeedToggle'
import ReportModal from '@/components/post/ReportModal'
import { ConfessionCardSkeleton } from '@/components/ui/LoadingSpinner'
import { ConfessionWithProfile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { sortByFeatured } from '@/lib/utils/algorithms'

type FeedMode = 'featured' | 'latest'
const PAGE_SIZE = 12

export default function ConfessionFeed() {
    const [confessions, setConfessions] = useState<ConfessionWithProfile[]>([])
    const [mode, setMode] = useState<FeedMode>('featured')
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [reportingId, setReportingId] = useState<string | null>(null)

    const router = useRouter()
    const { user } = useAuth()
    const { toast } = useToast()
    const supabase = createClient()
    
    // Track count in a ref to avoid infinite dependency loops
    const countRef = useRef(0)
    countRef.current = confessions.length

    const fetchConfessions = useCallback(async (reset = false) => {
        if (reset) setIsLoading(true)
        else setIsLoadingMore(true)

        try {
            const offset = reset ? 0 : countRef.current
            const { data, error } = await supabase
                .from('confessions')
                .select('*')
                .eq('status', 'approved')
                .range(offset, offset + PAGE_SIZE - 1)
                .order('created_at', { ascending: false })

            if (error) throw error
            let processedData = data as ConfessionWithProfile[]

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

            if (mode === 'featured') processedData = sortByFeatured(processedData)

            setConfessions(prev => {
                if (reset) return processedData
                const existingIds = new Set(prev.map(p => p.id))
                return [...prev, ...processedData.filter(n => !existingIds.has(n.id))]
            })

            setHasMore(data.length === PAGE_SIZE)
        } catch (error: any) {
            toast(error.message || 'Failed to load', 'error')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [supabase, user, mode, toast])

    useEffect(() => {
        fetchConfessions(true)
    }, [mode, user?.id, fetchConfessions])

    const handleVote = async (confessionId: string) => {
        if (!user) return router.push('/login')

        const confession = confessions.find(c => c.id === confessionId)
        if (!confession) return

        const isAdding = !confession.user_has_voted

        // Optimistic UI Update
        setConfessions(prev => prev.map(c => 
            c.id === confessionId 
            ? { ...c, user_has_voted: isAdding, upvote_count: c.upvote_count + (isAdding ? 1 : -1) }
            : c
        ))

        try {
            if (isAdding) {
                await supabase.from('votes').insert({ user_id: user.id, confession_id: confessionId })
                // FIX: Cast as any to bypass "never" type error on custom RPCs
                await (supabase.rpc as any)('increment_vote', { row_id: confessionId })
            } else {
                await supabase.from('votes').delete().eq('user_id', user.id).eq('confession_id', confessionId)
                await (supabase.rpc as any)('decrement_vote', { row_id: confessionId })
            }
        } catch (error) {
            // Revert state on failure
            setConfessions(prev => prev.map(c => 
                c.id === confessionId 
                ? { ...c, user_has_voted: !isAdding, upvote_count: c.upvote_count + (isAdding ? -1 : 1) }
                : c
            ))
            toast('Vote failed', 'error')
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            if (isLoading || isLoadingMore || !hasMore) return
            const threshold = document.documentElement.offsetHeight - 900
            if (window.innerHeight + window.scrollY >= threshold) {
                fetchConfessions(false)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [fetchConfessions, isLoading, isLoadingMore, hasMore])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-primary fill-rose-light" />
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-text-primary">Confessions</h2>
                </div>
                <div className="flex items-center gap-2">
                    <FeedToggle mode={mode} onChange={setMode} />
                    <button onClick={() => fetchConfessions(true)} className="p-2 hover:bg-rose-light/10 rounded-full">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <ConfessionCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {confessions.map((confession, index) => (
                            <motion.div layout key={confession.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ConfessionCard
                                    confession={confession}
                                    index={index}
                                    onVote={handleVote}
                                    onReport={setReportingId}
                                    isAuthenticated={!!user}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoadingMore && <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-rose-primary" /></div>}
                </div>
            )}

            {!hasMore && confessions.length > 0 && <p className="text-center text-text-secondary py-10 font-medium">You've reached the end! 💕</p>}

            <ReportModal isOpen={!!reportingId} onClose={() => setReportingId(null)} confessionId={reportingId || ''} />
        </div>
    )
}
