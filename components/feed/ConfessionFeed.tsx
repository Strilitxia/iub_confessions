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
const PAGE_SIZE = 12 // Using a multiple of 2, 3, and 4 for cleaner grid layouts

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
    
    // Use a ref to track current length for fetching without triggering re-renders
    const confessionsCount = useRef(0)
    confessionsCount.current = confessions.length

    const fetchConfessions = useCallback(async (reset = false) => {
        if (reset) setIsLoading(true)
        else setIsLoadingMore(true)

        try {
            const offset = reset ? 0 : confessionsCount.current

            let query = supabase
                .from('confessions')
                .select('*')
                .eq('status', 'approved')
                .range(offset, offset + PAGE_SIZE - 1)
                .order('created_at', { ascending: false })

            const { data, error } = await query
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

            if (mode === 'featured') {
                processedData = sortByFeatured(processedData)
            }

            setConfessions(prev => {
                if (reset) return processedData
                const filtered = processedData.filter(n => !prev.some(p => p.id === n.id))
                return [...prev, ...filtered]
            })

            setHasMore(data.length === PAGE_SIZE)
        } catch (error) {
            console.error('Fetch error:', error)
            toast('Failed to load confessions', 'error')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
        // Removed confessions.length from dependencies to stop the loop
    }, [supabase, user, mode, toast])

    useEffect(() => {
        fetchConfessions(true)
    }, [mode, user?.id, fetchConfessions])

    const handleVote = async (confessionId: string) => {
        if (!user) return router.push('/login')

        const confession = confessions.find(c => c.id === confessionId)
        if (!confession) return

        const isAddingVote = !confession.user_has_voted

        // Optimistic Update
        setConfessions(prev => prev.map(c => 
            c.id === confessionId 
            ? { ...c, user_has_voted: isAddingVote, upvote_count: c.upvote_count + (isAddingVote ? 1 : -1) }
            : c
        ))

        try {
            if (isAddingVote) {
                await supabase.from('votes').insert({ user_id: user.id, confession_id: confessionId })
                await supabase.rpc('increment_vote', { row_id: confessionId }) // Better than manual update
            } else {
                await supabase.from('votes').delete().eq('user_id', user.id).eq('confession_id', confessionId)
                await supabase.rpc('decrement_vote', { row_id: confessionId })
            }
        } catch (error) {
            // Revert on error
            setConfessions(prev => prev.map(c => 
                c.id === confessionId 
                ? { ...c, user_has_voted: !isAddingVote, upvote_count: c.upvote_count + (!isAddingVote ? 1 : -1) }
                : c
            ))
            toast('Vote failed', 'error')
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            if (isLoading || isLoadingMore || !hasMore) return
            
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800
            if (scrolledToBottom) {
                fetchConfessions(false)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [fetchConfessions, isLoading, isLoadingMore, hasMore])

    return (
        <div className="md:space-y-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-primary fill-rose-light" />
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-text-primary">
                        Confessions
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <FeedToggle mode={mode} onChange={setMode} />
                    <button onClick={() => fetchConfessions(true)} className="p-2 hover:bg-rose-light/10 rounded-full transition-colors">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <ConfessionCardSkeleton key={i} />)}
                </div>
            ) : (
                <>
                    {/* Replaced 'columns' with 'grid' for significant performance boost */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {confessions.map((confession, index) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={confession.id}
                                >
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
                    </div>

                    {isLoadingMore && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-primary" />
                        </div>
                    )}

                    {!hasMore && confessions.length > 0 && (
                        <p className="text-center text-text-secondary py-10 font-medium">
                            That's all for now! 💕
                        </p>
                    )}
                </>
            )}

            <ReportModal
                isOpen={!!reportingId}
                onClose={() => setReportingId(null)}
                confessionId={reportingId || ''}
            />
        </div>
    )
}
