'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RefreshCw, Loader2, LayoutGrid } from 'lucide-react'
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
    const countRef = useRef(0)
    countRef.current = confessions.length

    // Helper to determine bento box spanning based on index or content length
    const getBentoClass = (index: number, content: string) => {
        // Pattern: Every 5th item is large, items with long text span two rows
        if (index % 7 === 0) return 'md:col-span-2 md:row-span-2' // Big Featured Square
        if (content.length > 200) return 'md:row-span-2' // Tall card for long confessions
        if (index % 4 === 0) return 'md:col-span-2' // Wide card
        return 'md:col-span-1 md:row-span-1' // Standard card
    }

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
        setConfessions(prev => prev.map(c => 
            c.id === confessionId 
            ? { ...c, user_has_voted: isAdding, upvote_count: c.upvote_count + (isAdding ? 1 : -1) }
            : c
        ))

        try {
            if (isAdding) {
                await supabase.from('votes').insert({ user_id: user.id, confession_id: confessionId })
                await (supabase.rpc as any)('increment_vote', { row_id: confessionId })
            } else {
                await supabase.from('votes').delete().eq('user_id', user.id).eq('confession_id', confessionId)
                await (supabase.rpc as any)('decrement_vote', { row_id: confessionId })
            }
        } catch (error) {
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
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-primary/10 rounded-xl">
                        <LayoutGrid className="w-6 h-6 text-rose-primary" />
                    </div>
                    <div>
                        <h2 className="font-heading text-2xl font-bold text-text-primary">Confession Board</h2>
                        <p className="text-sm text-text-secondary">Read what IUB is whispering about</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <FeedToggle mode={mode} onChange={setMode} />
                    <button 
                        onClick={() => fetchConfessions(true)} 
                        className="p-2.5 hover:bg-rose-light/20 rounded-full transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-5 h-5 text-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className={i === 0 ? 'md:col-span-2 md:row-span-2' : ''}>
                            <ConfessionCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : (
                /* The Bento Grid */
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-flow-row-dense">
                    <AnimatePresence mode="popLayout">
                        {confessions.map((confession, index) => (
                            <motion.div 
                                layout
                                key={confession.id} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={getBentoClass(index, confession.content || '')}
                            >
                                <ConfessionCard
                                    confession={confession}
                                    index={index}
                                    onVote={handleVote}
                                    onReport={setReportingId}
                                    isAuthenticated={!!user}
                                    // Ensure your Card component fills the height of the bento slot
                                    className="h-full" 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isLoadingMore && (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="animate-spin text-rose-primary w-8 h-8" />
                        </div>
                    )}
                </div>
            )}

            {!hasMore && confessions.length > 0 && (
                <div className="text-center py-16 border-t border-dashed border-rose-light/30">
                    <Heart className="w-8 h-8 text-rose-light mx-auto mb-2 opacity-50" />
                    <p className="text-text-secondary font-medium italic">You've reached the end of the whispers...</p>
                </div>
            )}

            <ReportModal isOpen={!!reportingId} onClose={() => setReportingId(null)} confessionId={reportingId || ''} />
        </div>
    )
}
