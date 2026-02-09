'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Eye, EyeOff, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Confession, ConfessionStatus } from '@/types/database'
import { getCardColor } from '@/lib/utils/colors'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import ConfessionCard from '@/components/feed/ConfessionCard'

interface ModerationTableProps {
    confessions: Confession[]
    onUpdate: () => void
}

const statusColors: Record<ConfessionStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    hidden: 'bg-gray-100 text-gray-700',
    removed: 'bg-red-100 text-red-700',
}

const statusIcons: Record<ConfessionStatus, typeof Clock> = {
    pending: Clock,
    approved: Check,
    hidden: EyeOff,
    removed: Trash2,
}

export default function ModerationTable({ confessions, onUpdate }: ModerationTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isProcessing, setIsProcessing] = useState(false)
    const [viewConfession, setViewConfession] = useState<Confession | null>(null)
    const { toast } = useToast()
    const supabase = createClient()

    const handleStatusChange = async (id: string, status: ConfessionStatus) => {
        setIsProcessing(true)
        try {
            const updateData: any = { status }
            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('confessions')
                .update(updateData)
                .eq('id', id)

            if (error) throw error

            toast(`Confession ${status}`, 'success')
            onUpdate()
        } catch (error) {
            console.error('Update error:', error)
            toast('Failed to update', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkAction = async (status: ConfessionStatus) => {
        if (selectedIds.size === 0) return

        setIsProcessing(true)
        try {
            const updateData: any = { status }
            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('confessions')
                .update(updateData)
                .in('id', Array.from(selectedIds))

            if (error) throw error

            toast(`${selectedIds.size} confessions ${status}`, 'success')
            setSelectedIds(new Set())
            onUpdate()
        } catch (error) {
            console.error('Bulk update error:', error)
            toast('Failed to update', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        setSelectedIds(next)
    }

    const selectAll = () => {
        if (selectedIds.size === confessions.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(confessions.map(c => c.id)))
        }
    }

    const getContentPreview = (content: any): string => {
        try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content
            return parsed.content
                ?.map((node: any) => node.content?.map((c: any) => c.text || '').join('') || '')
                .join(' ')
                .slice(0, 100) || 'No content'
        } catch {
            return String(content).slice(0, 100)
        }
    }

    if (confessions.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                No confessions to show
            </div>
        )
    }

    return (
        <div>
            {/* Bulk Actions */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 p-4 bg-rose-primary/5 rounded-xl flex items-center justify-between"
                    >
                        <span className="text-sm text-text-primary">
                            {selectedIds.size} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleBulkAction('approved')}
                                disabled={isProcessing}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBulkAction('hidden')}
                                disabled={isProcessing}
                            >
                                <EyeOff className="w-4 h-4 mr-1" />
                                Hide
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleBulkAction('removed')}
                                disabled={isProcessing}
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-blush overflow-hidden">
                <table className="w-full">
                    <thead className="bg-blush/50">
                        <tr>
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === confessions.length}
                                    onChange={selectAll}
                                    className="rounded border-blush"
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-text-secondary">Content</th>
                            <th className="p-4 text-left text-sm font-medium text-text-secondary">Status</th>
                            <th className="p-4 text-left text-sm font-medium text-text-secondary">Time</th>
                            <th className="p-4 text-left text-sm font-medium text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blush">
                        {confessions.map((confession) => {
                            const StatusIcon = statusIcons[confession.status]
                            const colorVariant = getCardColor(confession.color_variant)

                            return (
                                <motion.tr
                                    key={confession.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`hover:bg-blush/30 transition-colors ${selectedIds.has(confession.id) ? 'bg-rose-primary/5' : ''
                                        }`}
                                >
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(confession.id)}
                                            onChange={() => toggleSelect(confession.id)}
                                            className="rounded border-blush"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className={`inline-block w-2 h-2 rounded-full mr-2 ${colorVariant.bg}`} />
                                        <span className="text-sm text-text-primary">
                                            {getContentPreview(confession.content)}...
                                        </span>
                                        {confession.image_url && (
                                            <span className="ml-2 text-xs text-text-secondary">(has image)</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[confession.status]}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {confession.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <motion.button
                                                onClick={() => setViewConfession(confession)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </motion.button>
                                            {confession.status !== 'approved' && (
                                                <motion.button
                                                    onClick={() => handleStatusChange(confession.id, 'approved')}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Approve"
                                                    disabled={isProcessing}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.button>
                                            )}
                                            {confession.status !== 'hidden' && (
                                                <motion.button
                                                    onClick={() => handleStatusChange(confession.id, 'hidden')}
                                                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Hide"
                                                    disabled={isProcessing}
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </motion.button>
                                            )}
                                            {confession.status !== 'removed' && (
                                                <motion.button
                                                    onClick={() => handleStatusChange(confession.id, 'removed')}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Remove"
                                                    disabled={isProcessing}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewConfession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setViewConfession(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ConfessionCard
                                confession={viewConfession as any}
                                index={0}
                                isAuthenticated={true}
                                onVote={async () => { }}
                                onReport={() => { }}
                            />
                            <button
                                onClick={() => setViewConfession(null)}
                                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
