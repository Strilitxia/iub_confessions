'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertTriangle, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ReportWithConfession } from '@/types/database'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface ReportsListProps {
    reports: ReportWithConfession[]
    onUpdate: () => void
}

export default function ReportsList({ reports, onUpdate }: ReportsListProps) {
    const [selectedReport, setSelectedReport] = useState<ReportWithConfession | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const handleResolve = async (reportId: string, action: 'resolve' | 'dismiss') => {
        setIsProcessing(true)
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: action === 'resolve' ? 'resolved' : 'dismissed' })
                .eq('id', reportId)

            if (error) throw error

            toast(`Report ${action}d`, 'success')
            setSelectedReport(null)
            onUpdate()
        } catch (error) {
            console.error('Report update error:', error)
            toast('Failed to update report', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleHideConfession = async (confessionId: string, reportId: string) => {
        setIsProcessing(true)
        try {
            // Hide the confession
            await supabase
                .from('confessions')
                .update({ status: 'hidden' })
                .eq('id', confessionId)

            // Resolve the report
            await supabase
                .from('reports')
                .update({ status: 'resolved' })
                .eq('id', reportId)

            toast('Confession hidden and report resolved', 'success')
            setSelectedReport(null)
            onUpdate()
        } catch (error) {
            console.error('Action error:', error)
            toast('Failed to perform action', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const getContentPreview = (content: any): string => {
        try {
            const parsed = typeof content === 'string' ? JSON.parse(content) : content
            return parsed.content
                ?.map((node: any) => node.content?.map((c: any) => c.text || '').join('') || '')
                .join(' ')
                .slice(0, 150) || 'No content'
        } catch {
            return String(content).slice(0, 150)
        }
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-rose-light" />
                <p>No pending reports</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {reports.map((report) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-blush p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                {/* Report reason */}
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <span className="font-medium text-text-primary">{report.reason}</span>
                                </div>

                                {/* Confession preview */}
                                {report.confessions && (
                                    <div className="bg-blush/50 rounded-xl p-4 mb-3">
                                        <p className="text-sm text-text-secondary">
                                            {getContentPreview(report.confessions.content)}...
                                        </p>
                                    </div>
                                )}

                                {/* Time */}
                                <p className="text-xs text-text-secondary">
                                    Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleResolve(report.id, 'dismiss')}
                                    disabled={isProcessing}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Report detail modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Report Details"
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-4">
                        {/* Reason */}
                        <div>
                            <h4 className="text-sm font-medium text-text-secondary mb-1">Reason</h4>
                            <p className="text-text-primary">{selectedReport.reason}</p>
                        </div>

                        {/* Full confession */}
                        {selectedReport.confessions && (
                            <div>
                                <h4 className="text-sm font-medium text-text-secondary mb-2">Confession Content</h4>
                                <div className="bg-blush/50 rounded-xl p-4 max-h-60 overflow-y-auto">
                                    <p className="text-sm text-text-primary whitespace-pre-wrap">
                                        {getContentPreview(selectedReport.confessions.content)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-blush">
                            <Button
                                variant="ghost"
                                onClick={() => handleResolve(selectedReport.id, 'dismiss')}
                                disabled={isProcessing}
                            >
                                Dismiss Report
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleHideConfession(
                                    selectedReport.confession_id,
                                    selectedReport.id
                                )}
                                disabled={isProcessing}
                                isLoading={isProcessing}
                            >
                                Hide Confession & Resolve
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}
