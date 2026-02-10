'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RefreshCw } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import ConfessionCard from './ConfessionCard'
import FeedToggle from './FeedToggle'
import ReportModal from '@/components/post/ReportModal'
import { ConfessionCardSkeleton } from '@/components/ui/LoadingSpinner'
import { ConfessionWithProfile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { sortByFeatured, sortByLatest } from '@/lib/utils/algorithms'

type FeedMode = 'featured' | 'latest'
const PAGE_SIZE = 10

export default function ConfessionFeed() {
    const [confessions, setConfessions] = useState<ConfessionWithProfile[]>([])
    const [mode, setMode] = useState<FeedMode>('featured')
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [reportingId, setReportingId] = useState<string | null>(null)

    const { user } = useAuth()
    const { toast } = useToast()
    const supabase = createClient()

    const fetchConfessions = useCallback(async (reset = false) => {
        if (reset) {
            setIsLoading(true)
        } else {
            setIsLoadingMore(true)
        }

        try {
            const offset = reset ? 0 : confessions.length

            // Fetch confessions
            let query = supabase
                .from('confessions')
                .select('*')
                .eq('status', 'approved')
                .range(offset, offset + PAGE_SIZE - 1)

            if (mode === 'latest') {
                query = query.order('created_at', { ascending: false })
            } else {
                // For featured, we fetch more and sort client-side
                query = query.order('created_at', { ascending: false })
            }

            const { data, error } = await query

            if (error) throw error

            let processedData = data as ConfessionWithProfile[]

            // Check if user has voted on these confessions
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

            // Sort by featured if needed
            if (mode === 'featured') {
                processedData = sortByFeatured(processedData)
            }

            if (reset) {
                setConfessions(processedData)
            } else {
                setConfessions(prev => {
                    const newData = processedData.filter(
                        newItem => !prev.some(existingItem => existingItem.id === newItem.id)
                    )
                    const combined = [...prev, ...newData]
                    return mode === 'featured' ? sortByFeatured(combined) : combined
                })
            }

            setHasMore(data.length === PAGE_SIZE)
        } catch (error) {
            console.error('Error fetching confessions:', error)
            toast('Failed to load confessions', 'error')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [supabase, user, mode, confessions.length, toast])

    useEffect(() => {
        fetchConfessions(true)
    }, [mode])

    // Handle vote
    const handleVote = async (confessionId: string) => {
        if (!user) {
            toast('Please login to vote', 'warning')
            return
        }

        const confession = confessions.find(c => c.id === confessionId)
        if (!confession) return

        try {
            if (confession.user_has_voted) {
                // Remove vote
                await supabase
                    .from('votes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('confession_id', confessionId)

                setConfessions(prev =>
                    prev.map(c =>
                        c.id === confessionId
                            ? { ...c, user_has_voted: false, upvote_count: c.upvote_count - 1 }
                            : c
                    )
                )
            } else {
                // Add vote
                await supabase
                    .from('votes')
                    .insert({ user_id: user.id, confession_id: confessionId })

                setConfessions(prev =>
                    prev.map(c =>
                        c.id === confessionId
                            ? { ...c, user_has_voted: true, upvote_count: c.upvote_count + 1 }
                            : c
                    )
                )
            }
        } catch (error) {
            console.error('Error voting:', error)
            toast('Failed to vote', 'error')
        }
    }

    // Handle load more (scroll-based)
    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop
            >= document.documentElement.offsetHeight - 500
        ) {
            if (!isLoadingMore && hasMore) {
                fetchConfessions(false)
            }
        }
    }, [isLoadingMore, hasMore, fetchConfessions])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-primary fill-rose-light" />
                    <h2 className="font-heading text-2xl font-semibold text-text-primary">
                        Confessions
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <FeedToggle mode={mode} onChange={setMode} />

                    <motion.button
                        onClick={() => fetchConfessions(true)}
                        className="p-2 rounded-full text-text-secondary hover:bg-blush transition-colors"
                        whileHover={{ rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Feed */}
            {isLoading ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-6">
                            <ConfessionCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : confessions.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <Heart className="w-16 h-16 text-rose-light mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
                        No confessions yet
                    </h3>
                    <p className="text-text-secondary">
                        Be the first to share your feelings!
                    </p>
                </motion.div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {confessions.map((confession, index) => (
                            <div key={confession.id} className="break-inside-avoid mb-6">
                                <ConfessionCard
                                    confession={confession}
                                    index={index}
                                    onVote={handleVote}
                                    onReport={setReportingId}
                                    isAuthenticated={!!user}
                                />
                            </div>
                        ))}
                    </AnimatePresence>

                    {/* Loading more indicator */}
                    {isLoadingMore && (
                        <div className="break-inside-avoid mb-6">
                            <ConfessionCardSkeleton />
                        </div>
                    )}
                </div>
            )}

            {!isLoading && !hasMore && confessions.length > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-text-secondary py-8 w-full"
                >
                    You've reached the end! 💕
                </motion.p>
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={!!reportingId}
                onClose={() => setReportingId(null)}
                confessionId={reportingId || ''}
            />
        </div>
    )
}
